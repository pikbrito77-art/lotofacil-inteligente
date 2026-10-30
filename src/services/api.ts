// Serviço de API para buscar dados da Caixa e outras fontes
import axios from 'axios';
import { Concurso, Premiacao } from '@/types';
import { API_ENDPOINTS } from '@/constants';

interface CaixaConcursoResponse {
  numero: number;
  data: string;
  dezenas: number[];
  premiacoes: Array<{
    faixa: number;
    ganhadores: number;
    valor: number;
  }>;
  acumulou: boolean;
  valorAcumulado: number;
  proxConcurso: number;
  dataProxConcurso: string;
  valorEstimadoProx: number;
}

interface BrApiResponse {
  numero: number;
  data: string;
  dezenas: number[];
  premiacoes: Array<{
    faixa: number;
    ganhadores: number;
    valor: number;
  }>;
  acumulou: boolean;
  valorAcumulado: number;
  proximoConcurso: number;
  dataProximoConcurso: string;
  valorEstimadoProximo: number;
}

const axiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'LotofacilInteligente/1.0',
  },
});

// Converte resposta da Caixa para nosso formato
const converterCaixa = (data: CaixaConcursoResponse): Concurso => ({
  id: data.numero,
  numero: data.numero,
  data: data.data,
  dezenas: data.dezenas.sort((a, b) => a - b),
  premiacoes: data.premiacoes.map(p => ({
    faixa: p.faixa,
    ganhadores: p.ganhadores,
    valor: p.valor,
  })),
  acumulou: data.acumulou,
  valorAcumulado: data.valorAcumulado,
  proxConcurso: data.proxConcurso,
  dataProxConcurso: data.dataProxConcurso,
  valorEstimadoProx: data.valorEstimadoProx,
});

// Converte resposta da BR-API para nosso formato
const converterBrApi = (data: BrApiResponse): Concurso => ({
  id: data.numero,
  numero: data.numero,
  data: data.data,
  dezenas: data.dezenas.sort((a, b) => a - b),
  premiacoes: data.premiacoes.map(p => ({
    faixa: p.faixa,
    ganhadores: p.ganhadores,
    valor: p.valor,
  })),
  acumulou: data.acumulou,
  valorAcumulado: data.valorAcumulado,
  proxConcurso: data.proximoConcurso,
  dataProxConcurso: data.dataProximoConcurso,
  valorEstimadoProx: data.valorEstimadoProximo,
});

// Busca o último concurso
export const buscarUltimoConcurso = async (): Promise<Concurso | null> => {
  // Tenta Caixa primeiro
  try {
    const response = await axiosInstance.get<CaixaConcursoResponse>(API_ENDPOINTS.CAIXA_RESULTADO_LATEST);
    if (response.data?.numero) return converterCaixa(response.data);
  } catch (e) {
    console.warn('Erro ao buscar na Caixa API:', e);
  }
  
  // Fallback BR-API
  try {
    const response = await axiosInstance.get<BrApiResponse>(API_ENDPOINTS.BR_API_LATEST);
    if (response.data?.numero) return converterBrApi(response.data);
  } catch (e) {
    console.warn('Erro ao buscar na BR-API:', e);
  }
  
  return null;
};

// Busca concurso específico por número
export const buscarConcursoPorNumero = async (numero: number): Promise<Concurso | null> => {
  // Tenta Caixa
  try {
    const response = await axiosInstance.get<CaixaConcursoResponse>(API_ENDPOINTS.CAIXA_RESULTADO_NUMERO(numero));
    if (response.data?.numero) return converterCaixa(response.data);
  } catch (e) {
    console.warn(`Erro ao buscar concurso ${numero} na Caixa:`, e);
  }
  
  // Fallback BR-API
  try {
    const response = await axiosInstance.get<BrApiResponse>(API_ENDPOINTS.BR_API_NUMERO(numero));
    if (response.data?.numero) return converterBrApi(response.data);
  } catch (e) {
    console.warn(`Erro ao buscar concurso ${numero} na BR-API:`, e);
  }
  
  return null;
};

// Busca últimos N concursos
export const buscarUltimosConcursos = async (quantidade: number): Promise<Concurso[]> => {
  // Tenta Caixa
  try {
    const response = await axiosInstance.get<CaixaConcursoResponse[]>(API_ENDPOINTS.CAIXA_ULTIMOS(quantidade));
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map(converterCaixa).sort((a, b) => b.numero - a.numero);
    }
  } catch (e) {
    console.warn('Erro ao buscar últimos concursos na Caixa:', e);
  }
  
  // Fallback: buscar um por um na BR-API (mais lento mas funciona)
  try {
    const ultimo = await buscarUltimoConcurso();
    if (!ultimo) return [];
    
    const concursos: Concurso[] = [ultimo];
    let numeroAtual = ultimo.numero - 1;
    
    while (concursos.length < quantidade && numeroAtual > 0) {
      const c = await buscarConcursoPorNumero(numeroAtual);
      if (c) concursos.push(c);
      numeroAtual--;
      
      // Pequena pausa para não sobrecarregar a API
      if (concursos.length % 5 === 0) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    
    return concursos.sort((a, b) => b.numero - a.numero);
  } catch (e) {
    console.warn('Erro ao buscar últimos concursos na BR-API:', e);
  }
  
  return [];
};

// Busca concursos em lote (para sincronização inicial)
export const sincronizarHistorico = async (
  quantidade: number,
  onProgress?: (atual: number, total: number) => void
): Promise<Concurso[]> => {
  const ultimo = await buscarUltimoConcurso();
  if (!ultimo) return [];
  
  const concursos: Concurso[] = [ultimo];
  let numeroAtual = ultimo.numero - 1;
  
  while (concursos.length < quantidade && numeroAtual > 0) {
    const c = await buscarConcursoPorNumero(numeroAtual);
    if (c) concursos.push(c);
    numeroAtual--;
    
    if (onProgress) onProgress(concursos.length, quantidade);
    
    // Pausa a cada 10 requisições
    if (concursos.length % 10 === 0) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  
  return concursos.sort((a, b) => b.numero - a.numero);
};

// Verifica se há novos concursos
export const verificarNovosConcursos = async (ultimoConhecido: number): Promise<Concurso[]> => {
  const ultimo = await buscarUltimoConcurso();
  if (!ultimo || ultimo.numero <= ultimoConhecido) return [];
  
  const novos: Concurso[] = [];
  for (let n = ultimoConhecido + 1; n <= ultimo.numero; n++) {
    const c = await buscarConcursoPorNumero(n);
    if (c) novos.push(c);
  }
  
  return novos.sort((a, b) => a.numero - b.numero);
};

// Formata data para exibição (brasileiro)
export const formatarDataBR = (dataISO: string): string => {
  try {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dataISO;
  }
};

// Formata valor monetário
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(valor);
};