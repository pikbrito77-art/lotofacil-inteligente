// Hooks personalizados para gerenciamento de estado
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Concurso, 
  FormulaUsuario, 
  JogoGerado, 
  ConfiguracoesApp, 
  AnaliseEstatistica,
  EstatisticasUsuario 
} from '@/types';
import { 
  CONFIG_PADRAO, 
  FORMULA_PADRAO,
  CHAVES_STORAGE 
} from '@/constants';
import * as Database from '@/services/database';
import * as API from '@/services/api';
import * as Analysis from '@/services/analysis';
import { v4 as uuidv4 } from '@/utils/uuid';

// ========== HOOK DE INICIALIZAÇÃO ==========

export const useInicializacao = () => {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  useEffect(() => {
    const init = async () => {
      try {
        await Database.initDatabase();
        setPronto(true);
      } catch (e) {
        setErro('Erro ao inicializar banco de dados');
        console.error(e);
      }
    };
    init();
  }, []);
  
  return { pronto, erro };
};

// ========== HOOK DE CONCURSOS ==========

export const useConcursos = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string | null>(null);
  
  const carregarDoBanco = useCallback(async () => {
    try {
      const dados = await Database.buscarUltimosConcursos(100);
      setConcursos(dados);
      const ult = await Database.buscarUltimoConcurso();
      if (ult) setUltimaAtualizacao(ult.data);
    } catch (e) {
      console.error('Erro ao carregar concursos do banco:', e);
    }
  }, []);
  
  const sincronizar = useCallback(async (qtd = 50, onProgress?: (atual: number, total: number) => void) => {
    setCarregando(true);
    setErro(null);
    try {
      const novos = await API.sincronizarHistorico(qtd, onProgress);
      if (novos.length > 0) {
        await Database.salvarConcursos(novos);
        setConcursos(novos);
        const ult = novos[0];
        setUltimaAtualizacao(ult.data);
      }
    } catch (e) {
      setErro('Erro ao sincronizar dados');
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }, []);
  
  const verificarNovos = useCallback(async () => {
    if (concursos.length === 0) return;
    try {
      const ultimoLocal = concursos[0].numero;
      const novos = await API.verificarNovosConcursos(ultimoLocal);
      if (novos.length > 0) {
        await Database.salvarConcursos(novos);
        setConcursos(prev => [...novos, ...prev].slice(0, 100));
        setUltimaAtualizacao(novos[0].data);
      }
      return novos;
    } catch (e) {
      console.error('Erro ao verificar novos:', e);
    }
  }, [concursos]);
  
  useEffect(() => {
    carregarDoBanco();
  }, [carregarDoBanco]);
  
  return {
    concursos,
    carregando,
    erro,
    ultimaAtualizacao,
    carregarDoBanco,
    sincronizar,
    verificarNovos,
    ultimoConcurso: concursos[0] || null,
  };
};

// ========== HOOK DE ANÁLISE ==========

export const useAnalise = (concursos: Concurso[], qtdConcursos: number = 12) => {
  const [analise, setAnalise] = useState<AnaliseEstatistica | null>(null);
  const [carregando, setCarregando] = useState(false);
  
  useEffect(() => {
    if (concursos.length === 0) return;
    
    const gerar = async () => {
      setCarregando(true);
      try {
        const resultado = Analysis.gerarAnaliseCompleta(concursos, qtdConcursos);
        setAnalise(resultado);
      } catch (e) {
        console.error('Erro ao gerar análise:', e);
      } finally {
        setCarregando(false);
      }
    };
    
    gerar();
  }, [concursos, qtdConcursos]);
  
  // Helpers para fácil acesso
  const quentes = useMemo(() => 
    analise?.frequencias.filter(f => f.status === 'quente') || [], [analise]);
  const frias = useMemo(() => 
    analise?.frequencias.filter(f => f.status === 'fria') || [], [analise]);
  const mornas = useMemo(() => 
    analise?.frequencias.filter(f => f.status === 'morna') || [], [analise]);
  
  return {
    analise,
    carregando,
    quentes,
    frias,
    mornas,
    frequencias: analise?.frequencias || [],
    paresImpares: analise?.paresImpares,
    somaTotal: analise?.somaTotal,
    linhasColunas: analise ? {
      linhas: analise.dezenasPorLinha,
      colunas: analise.dezenasPorColuna,
    } : null,
    repeticoes: analise?.repeticoes || [],
  };
};

// ========== HOOK DE FÓRMULAS ==========

export const useFormulas = () => {
  const [formulas, setFormulas] = useState<FormulaUsuario[]>([]);
  const [carregando, setCarregando] = useState(false);
  
  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await Database.buscarFormulas();
      setFormulas(dados);
    } catch (e) {
      console.error('Erro ao carregar fórmulas:', e);
    } finally {
      setCarregando(false);
    }
  }, []);
  
  const salvar = useCallback(async (formula: FormulaUsuario) => {
    try {
      await Database.salvarFormula(formula);
      await carregar();
      return true;
    } catch (e) {
      console.error('Erro ao salvar fórmula:', e);
      return false;
    }
  }, [carregar]);
  
  const deletar = useCallback(async (id: string) => {
    try {
      await Database.deletarFormula(id);
      await carregar();
      return true;
    } catch (e) {
      console.error('Erro ao deletar fórmula:', e);
      return false;
    }
  }, [carregar]);
  
  const duplicar = useCallback(async (id: string, novoNome: string) => {
    const original = formulas.find(f => f.id === id);
    if (!original) return false;
    
    const copia: FormulaUsuario = {
      ...original,
      id: uuidv4(),
      nome: novoNome,
      criadaEm: new Date().toISOString(),
      atualizadaEm: new Date().toISOString(),
      vezesUsada: 0,
    };
    
    return salvar(copia);
  }, [formulas, salvar]);
  
  useEffect(() => {
    carregar();
  }, [carregar]);
  
  const formulaAtiva = formulas.find(f => f.ativa) || formulas[0];
  
  return {
    formulas,
    carregando,
    formulaAtiva,
    carregar,
    salvar,
    deletar,
    duplicar,
  };
};

// ========== HOOK DE JOGOS GERADOS ==========

export const useJogos = () => {
  const [jogos, setJogos] = useState<JogoGerado[]>([]);
  const [carregando, setCarregando] = useState(false);
  
  const carregarPorConcurso = useCallback(async (concurso: number) => {
    setCarregando(true);
    try {
      const dados = await Database.buscarJogosPorConcurso(concurso);
      setJogos(dados);
    } catch (e) {
      console.error('Erro ao carregar jogos:', e);
    } finally {
      setCarregando(false);
    }
  }, []);
  
  const carregarPorFormula = useCallback(async (formulaId: string) => {
    setCarregando(true);
    try {
      const dados = await Database.buscarJogosPorFormula(formulaId);
      setJogos(dados);
    } catch (e) {
      console.error('Erro ao carregar jogos:', e);
    } finally {
      setCarregando(false);
    }
  }, []);
  
  const carregarTodos = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await Database.buscarTodosJogos();
      setJogos(dados);
    } catch (e) {
      console.error('Erro ao carregar todos jogos:', e);
    } finally {
      setCarregando(false);
    }
  }, []);
  
  const gerarEconomicos = useCallback(async (
    formula: FormulaUsuario,
    analise: AnaliseEstatistica,
    concursoAlvo: number,
    qtd: number
  ) => {
    setCarregando(true);
    try {
      const novosJogos = Analysis.gerarJogosPorFormula(formula, analise, concursoAlvo, qtd);
      await Database.salvarJogos(novosJogos);
      await Database.incrementarUsoFormula(formula.id);
      setJogos(prev => [...novosJogos, ...prev]);
      return novosJogos;
    } catch (e) {
      console.error('Erro ao gerar jogos:', e);
      return [];
    } finally {
      setCarregando(false);
    }
  }, []);
  
  const conferir = useCallback(async (jogoId: string, resultado: number[]) => {
    try {
      const jogo = jogos.find(j => j.id === jogoId);
      if (!jogo) return;
      
      const { acertos, premio } = Analysis.conferirJogo(jogo.dezenas, resultado);
      await Database.conferirJogo(jogoId, acertos, premio);
      
      setJogos(prev => prev.map(j => 
        j.id === jogoId ? { ...j, conferido: true, acertos, premio } : j
      ));
      
      return { acertos, premio };
    } catch (e) {
      console.error('Erro ao conferir jogo:', e);
    }
  }, [jogos]);
  
  return {
    jogos,
    carregando,
    carregarPorConcurso,
    carregarPorFormula,
    carregarTodos,
    gerarEconomicos,
    conferir,
  };
};

// ========== HOOK DE CONFIGURAÇÕES ==========

export const useConfiguracoes = () => {
  const [config, setConfig] = useState<ConfiguracoesApp>(CONFIG_PADRAO);
  const [carregando, setCarregando] = useState(true);
  
  const carregar = useCallback(async () => {
    try {
      const saved = await Database.buscarTodasConfiguracoes();
      setConfig(prev => ({ ...prev, ...saved }));
    } catch (e) {
      console.error('Erro ao carregar configurações:', e);
    } finally {
      setCarregando(false);
    }
  }, []);
  
  const salvar = useCallback(async <K extends keyof ConfiguracoesApp>(
    chave: K, 
    valor: ConfiguracoesApp[K]
  ) => {
    try {
      await Database.salvarConfiguracao(chave, valor);
      setConfig(prev => ({ ...prev, [chave]: valor }));
      return true;
    } catch (e) {
      console.error('Erro ao salvar configuração:', e);
      return false;
    }
  }, []);
  
  const salvarTudo = useCallback(async (novaConfig: Partial<ConfiguracoesApp>) => {
    try {
      for (const [k, v] of Object.entries(novaConfig)) {
        await Database.salvarConfiguracao(k, v);
      }
      setConfig(prev => ({ ...prev, ...novaConfig }));
      return true;
    } catch (e) {
      console.error('Erro ao salvar configurações:', e);
      return false;
    }
  }, []);
  
  useEffect(() => {
    carregar();
  }, [carregar]);
  
  return {
    config,
    carregando,
    salvar,
    salvarTudo,
    recarregar: carregar,
  };
};

// ========== HOOK DE ESTATÍSTICAS ==========

export const useEstatisticas = () => {
  const [stats, setStats] = useState<EstatisticasUsuario>({
    totalJogosGerados: 0,
    totalGasto: 0,
    totalPremios: 0,
    melhorAcerto: 0,
    concursosParticipados: 0,
    formulasCriadas: 0,
    sequenciaAtual: 0,
  });
  const [carregando, setCarregando] = useState(true);
  
  const carregar = useCallback(async () => {
    try {
      const dados = await Database.buscarEstatisticas();
      setStats(dados);
    } catch (e) {
      console.error('Erro ao carregar estatísticas:', e);
    } finally {
      setCarregando(false);
    }
  }, []);
  
  const atualizar = useCallback(async (updates: Partial<EstatisticasUsuario>) => {
    try {
      await Database.atualizarEstatisticas(updates);
      setStats(prev => ({ ...prev, ...updates }));
    } catch (e) {
      console.error('Erro ao atualizar estatísticas:', e);
    }
  }, []);
  
  const incrementarJogos = useCallback(async (qtd: number, custo: number) => {
    await atualizar({
      totalJogosGerados: stats.totalJogosGerados + qtd,
      totalGasto: stats.totalGasto + custo,
    });
  }, [stats, atualizar]);
  
  const registrarPremio = useCallback(async (acertos: number, premio: number) => {
    await atualizar({
      totalPremios: stats.totalPremios + premio,
      melhorAcerto: Math.max(stats.melhorAcerto, acertos),
    });
  }, [stats, atualizar]);
  
  useEffect(() => {
    carregar();
  }, [carregar]);
  
  return {
    stats,
    carregando,
    carregar,
    atualizar,
    incrementarJogos,
    registrarPremio,
  };
};

// ========== HOOK DE NOTIFICAÇÕES ==========

export const useNotificacoes = () => {
  const [permissao, setPermissao] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  
  const solicitarPermissao = useCallback(async () => {
    try {
      const { status } = await import('expo-notifications').then(m => m.getPermissionsAsync());
      setPermissao(status);
      if (status !== 'granted') {
        const { status: newStatus } = await import('expo-notifications').then(m => m.requestPermissionsAsync());
        setPermissao(newStatus);
      }
      return status === 'granted';
    } catch (e) {
      console.error('Erro ao solicitar permissão:', e);
      return false;
    }
  }, []);
  
  const agendarLembrete = useCallback(async (
    titulo: string, 
    corpo: string, 
    data: Date
  ) => {
    try {
      const { scheduleNotificationAsync } = await import('expo-notifications');
      await scheduleNotificationAsync({
        content: { title: titulo, body: corpo, sound: true },
        trigger: { type: 'date', date: data.getTime() },
      });
    } catch (e) {
      console.error('Erro ao agendar notificação:', e);
    }
  }, []);
  
  const cancelarTodas = useCallback(async () => {
    try {
      const { cancelAllScheduledNotificationsAsync } = await import('expo-notifications');
      await cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.error('Erro ao cancelar notificações:', e);
    }
  }, []);
  
  return {
    permissao,
    solicitarPermissao,
    agendarLembrete,
    cancelarTodas,
  };
};

// ========== HOOK DE TEMA/ACESSIBILIDADE ==========

export const useTema = (config: ConfiguracoesApp) => {
  const tema = config.tema;
  const tamanhoFonte = config.tamanhoFonte;
  const vozAtivada = config.vozAtivada;
  const vibracaoAtivada = config.vibracaoAtivada;
  
  const falar = useCallback(async (texto: string) => {
    if (!vozAtivada) return;
    try {
      const { speak } = await import('expo-speech');
      await speak(texto, { language: 'pt-BR', pitch: 1.0, rate: 0.9 });
    } catch (e) {
      console.error('Erro na síntese de voz:', e);
    }
  }, [vozAtivada]);
  
  const vibrar = useCallback(async (tipo: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if (!vibracaoAtivada) return;
    try {
      const { impactAsync, notificationAsync } = await import('expo-haptics');
      switch (tipo) {
        case 'light': await impactAsync('light'); break;
        case 'medium': await impactAsync('medium'); break;
        case 'heavy': await impactAsync('heavy'); break;
        case 'success': await notificationAsync('success'); break;
        case 'warning': await notificationAsync('warning'); break;
        case 'error': await notificationAsync('error'); break;
      }
    } catch (e) {
      console.error('Erro no feedback tátil:', e);
    }
  }, [vibracaoAtivada]);
  
  return {
    tema,
    tamanhoFonte,
    vozAtivada,
    vibracaoAtivada,
    falar,
    vibrar,
  };
};