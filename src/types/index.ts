// Tipos principais do aplicativo Lotofácil Inteligente

export interface Concurso {
  id: number;
  numero: number;
  data: string; // ISO 8601
  dezenas: number[]; // 15 números sorteados (1-25)
  premiacoes: Premiacao[];
  acumulou: boolean;
  valorAcumulado: number;
  proxConcurso: number;
  dataProxConcurso: string;
  valorEstimadoProx: number;
}

export interface Premiacao {
  faixa: number; // 11, 12, 13, 14, 15
  ganhadores: number;
  valor: number;
}

export interface FrequenciaDezena {
  dezena: number; // 1-25
  frequencia: number;
  atraso: number; // concursos desde última saída
  ultimasOcorrencias: number[]; // números dos concursos
  percentual: number; // % de aparição nos últimos N concursos
  status: 'quente' | 'morna' | 'fria';
}

export interface AnaliseEstatistica {
  concursoBase: number; // último concurso analisado
  totalConcursosAnalisados: number; // padrão: 12
  frequencias: FrequenciaDezena[];
  paresImpares: {
    mediaPares: number;
    mediaImpares: number;
    distribuicao: { pares: number; impares: number; count: number }[];
    recomendacao: { pares: number; impares: number };
  };
  somaTotal: {
    media: number;
    min: number;
    max: number;
    recomendacao: { min: number; max: number };
  };
  dezenasPorLinha: {
    linha1: number[]; // 1-5
    linha2: number[]; // 6-10
    linha3: number[]; // 11-15
    linha4: number[]; // 16-20
    linha5: number[]; // 21-25
  };
  dezenasPorColuna: {
    col1: number[]; // 1,6,11,16,21
    col2: number[]; // 2,7,12,17,22
    col3: number[]; // 3,8,13,18,23
    col4: number[]; // 4,9,14,19,24
    col5: number[]; // 5,10,15,20,25
  };
  ultimasDezenas: number[][]; // últimas N dezenas por concurso
  repeticoes: {
    dezena: number;
    count: number;
  }[];
}

export interface Fechamento {
  id: string;
  nome: string;
  numerosBase: number[]; // 16-18 números escolhidos
  quantidadeJogos: number;
  matriz: number[][]; // cada jogo com 15 números
  garantia: string; // ex: "14 pontos se 15∈18"
  custoTotal: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface FormulaUsuario {
  id: string;
  nome: string;
  descricao: string;
  // Regras da fórmula
  usarFrequencia: boolean;
  pesoQuentes: number; // 0-100
  pesoFrias: number; // 0-100
  pesoAtrasadas: number; // 0-100
  qtdQuentes: number;
  qtdFrias: number;
  qtdAleatorias: number;
  qtdFavoritas: number;
  numerosFavoritos: number[]; // fixos do usuário
  // Filtros
  faixaSomaMin: number;
  faixaSomaMax: number;
  qtdParesMin: number;
  qtdParesMax: number;
  qtdImparesMin: number;
  qtdImparesMax: number;
  // Linhas/Colunas
  maxPorLinha: number;
  maxPorColuna: number;
  // Exclusões
  excluirDezenas: number[]; // dezenas que nunca saem juntas
  exigirDezenas: number[]; // dezenas obrigatórias
  // Metadados
  ativa: boolean;
  criadaEm: string;
  atualizadaEm: string;
  vezesUsada: number;
  ultimosResultados?: { concurso: number; acertos: number }[];
}

export interface JogoGerado {
  id: string;
  formulaId: string;
  formulaNome: string;
  dezenas: number[];
  concursoAlvo: number;
  dataGeracao: string;
  conferido: boolean;
  acertos?: number;
  premio?: number;
}

export interface ConfiguracoesApp {
  // Tema e acessibilidade
  tema: 'claro' | 'escuro' | 'alto-contraste';
  tamanhoFonte: 'normal' | 'grande' | 'extra-grande';
  vozAtivada: boolean;
  vibracaoAtivada: boolean;
  // Notificações
  notifResultados: boolean;
  notifDicas: boolean;
  notifLembreteJogo: boolean;
  horarioLembrete: string; // HH:mm
  diasLembrete: number[]; // 0-6 (dom-sab)
  // Dados
  autoAtualizar: boolean;
  qtdConcursosAnalise: number; // padrão 12
  // Backup
  backupAutomatico: boolean;
  ultimaSincronizacao?: string;
}

export interface EstatisticasUsuario {
  totalJogosGerados: number;
  totalGasto: number;
  totalPremios: number;
  melhorAcerto: number;
  concursosParticipados: number;
  formulasCriadas: number;
  sequenciaAtual: number; // dias consecutivos usando o app
}

export type TipoTela = 'home' | 'analysis' | 'formulas' | 'results' | 'history' | 'settings';

export interface NavegacaoParams {
  home: undefined;
  analysis: { concursoId?: number } | undefined;
  formulas: { formulaId?: string } | undefined;
  results: { concursoId?: number } | undefined;
  history: undefined;
  settings: undefined;
}