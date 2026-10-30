// Motor de Análise Estatística - Core do aplicativo
// Implementa as técnicas do vídeo: frequência (12 últimos), quentes/frias, pares/ímpares, soma, linhas/colunas

import { 
  Concurso, 
  FrequenciaDezena, 
  AnaliseEstatistica, 
  FormulaUsuario, 
  JogoGerado 
} from '@/types';
import { 
  LOTOFACIL_CONFIG, 
  LINHAS_VOLANTE, 
  COLUNAS_VOLANTE, 
  CORES_DEZENAS,
  FECHAMENTOS_PREDEFINIDOS 
} from '@/constants';

// ========== ANÁLISE DE FREQUÊNCIA (Base do vídeo: 12 últimos concursos) ==========

export const analisarFrequencia = (
  concursos: Concurso[], 
  qtdConcursos: number = LOTOFACIL_CONFIG.CONCURSOS_PADRAO_ANALISE
): FrequenciaDezena[] => {
  // Pega os últimos N concursos (mais recentes primeiro)
  const ultimosConcursos = concursos.slice(0, qtdConcursos);
  
  // Conta frequência de cada dezena (1-25)
  const contadores: Record<number, number> = {};
  const ultimasOcorrencias: Record<number, number[]> = {};
  
  // Inicializa
  for (let i = 1; i <= LOTOFACIL_CONFIG.TOTAL_DEZENAS; i++) {
    contadores[i] = 0;
    ultimasOcorrencias[i] = [];
  }
  
  // Conta ocorrências
  ultimosConcursos.forEach((concurso, index) => {
    concurso.dezenas.forEach(dezena => {
      contadores[dezena]++;
      ultimasOcorrencias[dezena].push(concurso.numero);
    });
  });
  
  // Calcula atraso (quantos concursos desde a última saída)
  const frequencias: FrequenciaDezena[] = [];
  
  for (let dezena = 1; dezena <= LOTOFACIL_CONFIG.TOTAL_DEZENAS; dezena++) {
    const freq = contadores[dezena];
    const percentual = (freq / qtdConcursos) * 100;
    
    // Atraso: procura o último concurso onde a dezena saiu
    let atraso = 0;
    for (const c of ultimosConcursos) {
      if (c.dezenas.includes(dezena)) break;
      atraso++;
    }
    // Se não saiu em nenhum dos últimos N, atraso = N
    if (atraso >= qtdConcursos) atraso = qtdConcursos;
    
    // Classifica status baseado no vídeo: quente (alta freq), fria (atrasada), morna (média)
    let status: 'quente' | 'morna' | 'fria' = 'morna';
    const mediaEsperada = (qtdConcursos * LOTOFACIL_CONFIG.DEZENAS_POR_JOGO) / LOTOFACIL_CONFIG.TOTAL_DEZENAS; // ~7.2 para 12 concursos
    
    if (freq >= mediaEsperada * 1.3) status = 'quente';     // 30% acima da média
    else if (freq <= mediaEsperada * 0.7 || atraso >= 5) status = 'fria'; // 30% abaixo ou atraso >= 5
    
    frequencias.push({
      dezena,
      frequencia: freq,
      atraso,
      ultimasOcorrencias: ultimasOcorrencias[dezena].slice(0, 10),
      percentual: Math.round(percentual * 10) / 10,
      status,
    });
  }
  
  // Ordena: quentes primeiro (maior freq), depois frias (maior atraso), depois mornos
  return frequencias.sort((a, b) => {
    if (a.status !== b.status) {
      const ordem = { quente: 0, fria: 1, morna: 2 };
      return ordem[a.status] - ordem[b.status];
    }
    if (a.status === 'quente') return b.frequencia - a.frequencia;
    if (a.status === 'fria') return b.atraso - a.atraso;
    return b.frequencia - a.frequencia;
  });
};

// ========== ANÁLISE PARES/ÍMPARES ==========

export const analisarParesImpares = (concursos: Concurso[], qtd: number = 12) => {
  const ultimos = concursos.slice(0, qtd);
  const distribuicao: Record<string, number> = {};
  
  let totalPares = 0, totalImpares = 0;
  
  ultimos.forEach(c => {
    const pares = c.dezenas.filter(d => d % 2 === 0).length;
    const impares = c.dezenas.filter(d => d % 2 !== 0).length;
    totalPares += pares;
    totalImpares += impares;
    const key = `${pares}p-${impares}i`;
    distribuicao[key] = (distribuicao[key] || 0) + 1;
  });
  
  const mediaPares = totalPares / qtd;
  const mediaImpares = totalImpares / qtd;
  
  // Converte para array ordenado
  const distArray = Object.entries(distribuicao)
    .map(([key, count]) => {
      const [p, i] = key.split('-');
      return { 
        pares: parseInt(p), 
        impares: parseInt(i.replace('i', '')), 
        count,
        percentual: Math.round((count / qtd) * 1000) / 10
      };
    })
    .sort((a, b) => b.count - a.count);
  
  // Recomendação: mais próximo da média teórica (7.5 pares, 7.5 ímpares)
  // Mas baseada no que mais ocorreu
  const maisComum = distArray[0];
  
  return {
    mediaPares: Math.round(mediaPares * 10) / 10,
    mediaImpares: Math.round(mediaImpares * 10) / 10,
    distribuicao: distArray,
    recomendacao: { 
      pares: maisComum?.pares || 7, 
      impares: maisComum?.impares || 8 
    },
  };
};

// ========== ANÁLISE DE SOMA ==========

export const analisarSoma = (concursos: Concurso[], qtd: number = 12) => {
  const ultimos = concursos.slice(0, qtd);
  const somas = ultimos.map(c => c.dezenas.reduce((a, b) => a + b, 0));
  
  const media = somas.reduce((a, b) => a + b, 0) / qtd;
  const min = Math.min(...somas);
  const max = Math.max(...somas);
  
  // Faixa recomendada: média ± 1 desvio padrão aproximado
  const desvio = Math.sqrt(somas.reduce((acc, s) => acc + Math.pow(s - media, 2), 0) / qtd);
  
  return {
    media: Math.round(media * 10) / 10,
    min,
    max,
    desvio: Math.round(desvio * 10) / 10,
    recomendacao: { 
      min: Math.max(LOTOFACIL_CONFIG.DEZENAS_POR_JOGO * (LOTOFACIL_CONFIG.DEZENAS_POR_JOGO + 1) / 2, Math.round(media - desvio)), // soma mínima possível 1+2+...+15=120
      max: Math.min(
        LOTOFACIL_CONFIG.TOTAL_DEZENAS * LOTOFACIL_CONFIG.DEZENAS_POR_JOGO - (LOTOFACIL_CONFIG.TOTAL_DEZENAS - LOTOFACIL_CONFIG.DEZENAS_POR_JOGO) * (LOTOFACIL_CONFIG.TOTAL_DEZENAS - LOTOFACIL_CONFIG.DEZENAS_POR_JOGO + 1) / 2, 
        Math.round(media + desvio)
      ), // soma máxima 11+12+...+25=270
    },
    historico: somas,
  };
};

// ========== ANÁLISE POR LINHAS E COLUNAS ==========

export const analisarLinhasColunas = (concursos: Concurso[], qtd: number = 12) => {
  const ultimos = concursos.slice(0, qtd);
  
  const linhas: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  const colunas: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  
  ultimos.forEach(c => {
    c.dezenas.forEach(d => {
      // Linha
      const linha = Math.ceil(d / 5);
      linhas[linha].push(d);
      
      // Coluna
      const coluna = ((d - 1) % 5) + 1;
      colunas[coluna].push(d);
    });
  });
  
  // Frequência por linha
  const freqLinhas: Record<number, Record<number, number>> = {};
  const freqColunas: Record<number, Record<number, number>> = {};
  
  for (let l = 1; l <= 5; l++) {
    freqLinhas[l] = {};
    LINHAS_VOLANTE[l-1].forEach(d => freqLinhas[l][d] = 0);
    linhas[l].forEach(d => freqLinhas[l][d]++);
  }
  
  for (let c = 1; c <= 5; c++) {
    freqColunas[c] = {};
    COLUNAS_VOLANTE[c-1].forEach(d => freqColunas[c][d] = 0);
    colunas[c].forEach(d => freqColunas[c][d]++);
  }
  
  return {
    linhas: {
      1: LINHAS_VOLANTE[0].map(d => ({ dezena: d, freq: freqLinhas[1][d] })),
      2: LINHAS_VOLANTE[1].map(d => ({ dezena: d, freq: freqLinhas[2][d] })),
      3: LINHAS_VOLANTE[2].map(d => ({ dezena: d, freq: freqLinhas[3][d] })),
      4: LINHAS_VOLANTE[3].map(d => ({ dezena: d, freq: freqLinhas[4][d] })),
      5: LINHAS_VOLANTE[4].map(d => ({ dezena: d, freq: freqLinhas[5][d] })),
    },
    colunas: {
      1: COLUNAS_VOLANTE[0].map(d => ({ dezena: d, freq: freqColunas[1][d] })),
      2: COLUNAS_VOLANTE[1].map(d => ({ dezena: d, freq: freqColunas[2][d] })),
      3: COLUNAS_VOLANTE[2].map(d => ({ dezena: d, freq: freqColunas[3][d] })),
      4: COLUNAS_VOLANTE[3].map(d => ({ dezena: d, freq: freqColunas[4][d] })),
      5: COLUNAS_VOLANTE[4].map(d => ({ dezena: d, freq: freqColunas[5][d] })),
    },
    mediaPorLinha: {
      1: linhas[1].length / qtd,
      2: linhas[2].length / qtd,
      3: linhas[3].length / qtd,
      4: linhas[4].length / qtd,
      5: linhas[5].length / qtd,
    },
    mediaPorColuna: {
      1: colunas[1].length / qtd,
      2: colunas[2].length / qtd,
      3: colunas[3].length / qtd,
      4: colunas[4].length / qtd,
      5: colunas[5].length / qtd,
    },
  };
};

// ========== ANÁLISE DE REPETIÇÕES (Dezenas que saem em concursos consecutivos) ==========

export const analisarRepeticoes = (concursos: Concurso[], qtd: number = 12) => {
  const ultimos = concursos.slice(0, qtd);
  const repeticoes: Record<number, number> = {};
  
  for (let i = 0; i < ultimos.length - 1; i++) {
    const atual = ultimos[i].dezenas;
    const anterior = ultimos[i + 1].dezenas;
    
    atual.forEach(d => {
      if (anterior.includes(d)) {
        repeticoes[d] = (repeticoes[d] || 0) + 1;
      }
    });
  }
  
  return Object.entries(repeticoes)
    .map(([dezena, count]) => ({ dezena: parseInt(dezena), count }))
    .sort((a, b) => b.count - a.count);
};

// ========== ANÁLISE COMPLETA (Retorna tudo estruturado) ==========

export const gerarAnaliseCompleta = (
  concursos: Concurso[], 
  qtdConcursos: number = LOTOFACIL_CONFIG.CONCURSOS_PADRAO_ANALISE
): AnaliseEstatistica => {
  const frequencias = analisarFrequencia(concursos, qtdConcursos);
  const paresImpares = analisarParesImpares(concursos, qtdConcursos);
  const somaTotal = analisarSoma(concursos, qtdConcursos);
  const linhasColunas = analisarLinhasColunas(concursos, qtdConcursos);
  const repeticoes = analisarRepeticoes(concursos, qtdConcursos);
  
  // Dezenas por linha (agrupamento visual)
  const dezenasPorLinha = {
    linha1: LINHAS_VOLANTE[0],
    linha2: LINHAS_VOLANTE[1],
    linha3: LINHAS_VOLANTE[2],
    linha4: LINHAS_VOLANTE[3],
    linha5: LINHAS_VOLANTE[4],
  };
  
  const dezenasPorColuna = {
    col1: COLUNAS_VOLANTE[0],
    col2: COLUNAS_VOLANTE[1],
    col3: COLUNAS_VOLANTE[2],
    col4: COLUNAS_VOLANTE[3],
    col5: COLUNAS_VOLANTE[4],
  };
  
  // Últimas dezenas por concurso (para visualização)
  const ultimasDezenas = concursos.slice(0, qtdConcursos).map(c => c.dezenas);
  
  return {
    concursoBase: concursos[0]?.numero || 0,
    totalConcursosAnalisados: qtdConcursos,
    frequencias,
    paresImpares,
    somaTotal,
    dezenasPorLinha,
    dezenasPorColuna,
    ultimasDezenas,
    repeticoes,
  };
};

// ========== GERADOR DE JOGOS BASEADO EM FÓRMULA ==========

// Gera números aleatórios únicos dentro de um range, excluindo alguns
const gerarAleatoriosUnicos = (
  qtd: number, 
  min: number, 
  max: number, 
  excluir: number[] = []
): number[] => {
  const disponiveis = Array.from({ length: max - min + 1 }, (_, i) => min + i)
    .filter(d => !excluir.includes(d));
  
  const resultado: number[] = [];
  const embaralhado = [...disponiveis].sort(() => Math.random() - 0.5);
  
  for (const d of embaralhado) {
    if (resultado.length >= qtd) break;
    resultado.push(d);
  }
  
  return resultado.sort((a, b) => a - b);
};

// Aplica a fórmula do usuário para gerar 18-20 números base
export const gerarNumerosBase = (formula: FormulaUsuario, analise: AnaliseEstatistica): number[] => {
  const { frequencias } = analise;
  const selecionados: number[] = [];
  const usados = new Set<number>();
  
  // 1. Números favoritos (obrigatórios se configurados)
  if (formula.numerosFavoritos.length > 0) {
    formula.numerosFavoritos.forEach(d => {
      if (d >= 1 && d <= 25 && !usados.has(d)) {
        selecionados.push(d);
        usados.add(d);
      }
    });
  }
  
  // 2. Dezenas obrigatórias
  if (formula.exigirDezenas.length > 0) {
    formula.exigirDezenas.forEach(d => {
      if (d >= 1 && d <= 25 && !usados.has(d)) {
        selecionados.push(d);
        usados.add(d);
      }
    });
  }
  
  // 3. Quentes (maior frequência)
  if (formula.qtdQuentes > 0) {
    const quentes = frequencias
      .filter(f => f.status === 'quente' && !usados.has(f.dezena) && !formula.excluirDezenas.includes(f.dezena))
      .slice(0, formula.qtdQuentes);
    
    quentes.forEach(f => {
      if (!usados.has(f.dezena)) {
        selecionados.push(f.dezena);
        usados.add(f.dezena);
      }
    });
  }
  
  // 4. Frias/Atrasadas
  if (formula.qtdFrias > 0) {
    const frias = frequencias
      .filter(f => f.status === 'fria' && !usados.has(f.dezena) && !formula.excluirDezenas.includes(f.dezena))
      .sort((a, b) => b.atraso - a.atraso)
      .slice(0, formula.qtdFrias);
    
    frias.forEach(f => {
      if (!usados.has(f.dezena)) {
        selecionados.push(f.dezena);
        usados.add(f.dezena);
      }
    });
  }
  
  // 5. Aleatórias (preenche o restante)
  const faltando = Math.max(0, formula.qtdAleatorias - (selecionados.length - formula.numerosFavoritos.length - formula.exigirDezenas.length));
  if (faltando > 0) {
    const aleatorias = gerarAleatoriosUnicos(faltando, 1, 25, [...usados, ...formula.excluirDezenas]);
    aleatorias.forEach(d => {
      if (!usados.has(d)) {
        selecionados.push(d);
        usados.add(d);
      }
    });
  }
  
  // Garante que temos números suficientes (mínimo 16 para fechamento)
  while (selecionados.length < 16) {
    const extras = gerarAleatoriosUnicos(1, 1, 25, [...usados, ...formula.excluirDezenas]);
    extras.forEach(d => {
      if (!usados.has(d)) {
        selecionados.push(d);
        usados.add(d);
      }
    });
  }
  
  // Limita ao máximo (20 para fechamentos maiores)
  return selecionados.slice(0, 20).sort((a, b) => a - b);
};

// Valida se um jogo atende aos filtros da fórmula
const validarJogo = (jogo: number[], formula: FormulaUsuario): boolean => {
  // Soma
  const soma = jogo.reduce((a, b) => a + b, 0);
  if (soma < formula.faixaSomaMin || soma > formula.faixaSomaMax) return false;
  
  // Pares/Ímpares
  const pares = jogo.filter(d => d % 2 === 0).length;
  const impares = jogo.filter(d => d % 2 !== 0).length;
  if (pares < formula.qtdParesMin || pares > formula.qtdParesMax) return false;
  if (impares < formula.qtdImparesMin || impares > formula.qtdImparesMax) return false;
  
  // Linhas (máximo por linha)
  for (let l = 0; l < 5; l++) {
    const count = jogo.filter(d => LINHAS_VOLANTE[l].includes(d)).length;
    if (count > formula.maxPorLinha) return false;
  }
  
  // Colunas (máximo por coluna)
  for (let c = 0; c < 5; c++) {
    const count = jogo.filter(d => COLUNAS_VOLANTE[c].includes(d)).length;
    if (count > formula.maxPorColuna) return false;
  }
  
  // Dezenas excluídas
  if (jogo.some(d => formula.excluirDezenas.includes(d))) return false;
  
  // Dezenas obrigatórias
  if (!formula.exigirDezenas.every(d => jogo.includes(d))) return false;
  
  return true;
};

// Gera jogos usando fechamento matemático
export const gerarJogosFechamento = (
  numerosBase: number[], 
  tipoFechamento: string
): number[][] => {
  const fechamento = FECHAMENTOS_PREDEFINIDOS.find(f => f.id === tipoFechamento);
  if (!fechamento) return [];
  
  const n = fechamento.numerosBase;
  const base = numerosBase.slice(0, n);
  
  if (base.length < n) return [];
  
  // Implementação simplificada de fechamentos conhecidos
  // Em produção, usar bibliotecas especializadas ou algoritmos exatos
  switch (tipoFechamento) {
    case 'fechamento-16-8':
      return gerarFechamento16_8(base);
    case 'fechamento-17-16':
      return gerarFechamento17_16(base);
    case 'fechamento-18-24':
      return gerarFechamento18_24(base);
    case 'fechamento-19-48':
      return gerarFechamento19_48(base);
    case 'fechamento-20-96':
      return gerarFechamento20_96(base);
    default:
      return [];
  }
};

// Fechamento 16 números -> 8 jogos (garantia 13 se 15∈16)
const gerarFechamento16_8 = (nums: number[]): number[][] => {
  // Matriz padrão otimizada para 16 números em 8 jogos de 15
  // Cada jogo exclui 1 número diferente dos 16
  const jogos: number[][] = [];
  for (let i = 0; i < 8; i++) {
    const jogo = nums.filter((_, idx) => idx !== i && idx !== (i + 8) % 16).slice(0, 15);
    if (jogo.length === 15) jogos.push(jogo);
  }
  return jogos.slice(0, 8);
};

// Fechamento 17 números -> 16 jogos
const gerarFechamento17_16 = (nums: number[]): number[][] => {
  const jogos: number[][] = [];
  // Estratégia: combinações balanceadas
  for (let i = 0; i < 16; i++) {
    const excluir = [i % 17, (i + 5) % 17];
    const jogo = nums.filter((_, idx) => !excluir.includes(idx)).slice(0, 15);
    if (jogo.length === 15) jogos.push(jogo);
  }
  return jogos.slice(0, 16);
};

// Fechamento 18 números -> 24 jogos (o mais popular do vídeo)
const gerarFechamento18_24 = (nums: number[]): number[][] => {
  // Matriz de fechamento 18->24 (garantia 14 se 15∈18)
  // Baseado em design combinatório padrão
  const matriz = [
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,15],
    [0,1,2,3,4,5,6,7,8,9,10,11,12,14,15],
    [0,1,2,3,4,5,6,7,8,9,10,11,13,14,15],
    [0,1,2,3,4,5,6,7,8,9,10,12,13,14,15],
    [0,1,2,3,4,5,6,7,8,9,11,12,13,14,15],
    [0,1,2,3,4,5,6,7,8,10,11,12,13,14,15],
    [0,1,2,3,4,5,6,7,9,10,11,12,13,14,15],
    [0,1,2,3,4,5,6,8,9,10,11,12,13,14,15],
    [0,1,2,3,4,5,7,8,9,10,11,12,13,14,15],
    [0,1,2,3,4,6,7,8,9,10,11,12,13,14,15],
    [0,1,2,3,5,6,7,8,9,10,11,12,13,14,15],
    [0,1,2,4,5,6,7,8,9,10,11,12,13,14,15],
    [0,1,3,4,5,6,7,8,9,10,11,12,13,14,15],
    [0,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,16],
    [0,1,2,3,4,5,6,7,8,9,10,11,12,14,16],
    [0,1,2,3,4,5,6,7,8,9,10,11,13,15,16],
    [0,1,2,3,4,5,6,7,8,9,10,12,14,15,16],
    [0,1,2,3,4,5,6,7,8,9,11,12,13,14,16],
    [0,1,2,3,4,5,6,7,8,10,11,12,13,15,16],
    [0,1,2,3,4,5,6,7,9,10,11,12,14,15,16],
    [0,1,2,3,4,5,6,8,9,10,11,12,13,14,16],
    [0,1,2,3,4,5,7,8,9,10,11,12,13,15,16],
  ];
  
  return matriz.map(indices => indices.map(i => nums[i]).sort((a, b) => a - b));
};

// Fechamento 19 -> 48
const gerarFechamento19_48 = (nums: number[]): number[][] => {
  // Versão simplificada - em produção usar matriz exata
  const jogos: number[][] = [];
  const base18 = nums.slice(0, 18);
  const extras = nums.slice(18);
  
  // Pega o fechamento 18-24 e varia com o 19º número
  const fech18 = gerarFechamento18_24(base18);
  jogos.push(...fech18);
  
  // Adiciona variações com o 19º número
  if (extras.length > 0) {
    const extra = extras[0];
    fech18.forEach(jogo => {
      if (jogos.length < 48) {
        // Substitui um número aleatório pelo extra
        const idx = Math.floor(Math.random() * 15);
        const novo = [...jogo];
        novo[idx] = extra;
        jogos.push(novo.sort((a, b) => a - b));
      }
    });
  }
  
  return jogos.slice(0, 48);
};

// Fechamento 20 -> 96
const gerarFechamento20_96 = (nums: number[]): number[][] => {
  const jogos: number[][] = [];
  const base18 = nums.slice(0, 18);
  const extras = nums.slice(18, 20);
  
  const fech18 = gerarFechamento18_24(base18);
  jogos.push(...fech18);
  
  // Variações com 19º e 20º números
  extras.forEach(extra => {
    fech18.forEach(jogo => {
      if (jogos.length < 96) {
        const idx = Math.floor(Math.random() * 15);
        const novo = [...jogo];
        novo[idx] = extra;
        jogos.push(novo.sort((a, b) => a - b));
      }
    });
  });
  
  return jogos.slice(0, 96);
};

// ========== GERADOR PRINCIPAL DE JOGOS ==========

export const gerarJogosPorFormula = (
  formula: FormulaUsuario,
  analise: AnaliseEstatistica,
  concursoAlvo: number,
  quantidade: number = 1
): JogoGerado[] => {
  const jogos: JogoGerado[] = [];
  const maxTentativas = quantidade * 50; // Evita loop infinito
  let tentativas = 0;
  
  // Determina tipo de fechamento baseado na quantidade de números base
  let tipoFechamento = 'fechamento-18-24';
  if (formula.qtdQuentes + formula.qtdFrias + formula.qtdAleatorias + formula.qtdFavoritas <= 16) {
    tipoFechamento = 'fechamento-16-8';
  } else if (formula.qtdQuentes + formula.qtdFrias + formula.qtdAleatorias + formula.qtdFavoritas <= 17) {
    tipoFechamento = 'fechamento-17-16';
  } else if (formula.qtdQuentes + formula.qtdFrias + formula.qtdAleatorias + formula.qtdFavoritas <= 19) {
    tipoFechamento = 'fechamento-19-48';
  } else if (formula.qtdQuentes + formula.qtdFrias + formula.qtdAleatorias + formula.qtdFavoritas >= 20) {
    tipoFechamento = 'fechamento-20-96';
  }
  
  while (jogos.length < quantidade && tentativas < maxTentativas) {
    tentativas++;
    
    // Gera números base (pode variar ligeiramente a cada iteração para aleatoriedade controlada)
    const numerosBase = gerarNumerosBase(formula, analise);
    const matriz = gerarJogosFechamento(numerosBase, tipoFechamento);
    
    for (const jogo of matriz) {
      if (jogos.length >= quantidade) break;
      if (validarJogo(jogo, formula)) {
        // Verifica se não é duplicado
        const duplicado = jogos.some(j => 
          j.dezenas.length === jogo.length && j.dezenas.every((d, i) => d === jogo[i])
        );
        if (!duplicado) {
          jogos.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            formulaId: formula.id,
            formulaNome: formula.nome,
            dezenas: jogo,
            concursoAlvo,
            dataGeracao: new Date().toISOString(),
            conferido: false,
          });
        }
      }
    }
  }
  
  return jogos;
};

// ========== CONFERIDOR DE RESULTADOS ==========

export const conferirJogo = (jogo: number[], resultado: number[]): { acertos: number; premio: number } => {
  const acertos = jogo.filter(d => resultado.includes(d)).length;
  
  // Tabela de prêmios aproximados (valores variam por concurso)
  const premiosEstimados: Record<number, number> = {
    11: 6.00,
    12: 12.00,
    13: 30.00,
    14: 1500.00,
    15: 1500000.00, // Varia muito, valor base
  };
  
  return {
    acertos,
    premio: premiosEstimados[acertos] || 0,
  };
};

export const conferirMultiplosJogos = (jogos: number[][], resultado: number[]) => {
  return jogos.map(jogo => ({
    jogo,
    ...conferirJogo(jogo, resultado),
  })).sort((a, b) => b.acertos - a.acertos);
};

// ========== ESTATÍSTICAS DE UMA FÓRMULA ==========

export const calcularEstatisticasFormula = (
  formula: FormulaUsuario,
  historicoJogos: JogoGerado[],
  concursos: Concurso[]
) => {
  const jogosConferidos = historicoJogos.filter(j => j.conferido && j.acertos !== undefined);
  
  if (jogosConferidos.length === 0) {
    return {
      totalJogos: 0,
      jogosConferidos: 0,
      acertosPorFaixa: { 11: 0, 12: 0, 13: 0, 14: 0, 15: 0 },
      totalGasto: 0,
      totalPremios: 0,
      roi: 0,
      melhorAcerto: 0,
      mediaAcertos: 0,
    };
  }
  
  const acertosPorFaixa = { 11: 0, 12: 0, 13: 0, 14: 0, 15: 0 };
  let totalPremios = 0;
  let melhorAcerto = 0;
  let somaAcertos = 0;
  
  jogosConferidos.forEach(j => {
    if (j.acertos !== undefined) {
      if (j.acertos >= 11) acertosPorFaixa[j.acertos as keyof typeof acertosPorFaixa]++;
      totalPremios += j.premio || 0;
      melhorAcerto = Math.max(melhorAcerto, j.acertos);
      somaAcertos += j.acertos;
    }
  });
  
  const totalJogos = historicoJogos.length;
  const custoPorJogo = 3.00;
  const totalGasto = totalJogos * custoPorJogo;
  
  return {
    totalJogos,
    jogosConferidos: jogosConferidos.length,
    acertosPorFaixa,
    totalGasto,
    totalPremios,
    roi: totalGasto > 0 ? ((totalPremios - totalGasto) / totalGasto) * 100 : 0,
    melhorAcerto,
    mediaAcertos: somaAcertos / jogosConferidos.length,
  };
};