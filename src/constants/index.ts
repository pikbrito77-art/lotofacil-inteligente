// Constantes e configurações do app

export const LOTOFACIL_CONFIG = {
  TOTAL_DEZENAS: 25,
  DEZENAS_POR_JOGO: 15,
  MIN_DEZENA: 1,
  MAX_DEZENA: 25,
  FAIXAS_PREMIO: [11, 12, 13, 14, 15],
  CUSTO_APOSTA_SIMPLES: 3.00,
  CONCURSOS_PADRAO_ANALISE: 12,
  MAX_CONCURSOS_HISTORICO: 100,
} as const;

export const LINHAS_VOLANTE = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25],
];

export const COLUNAS_VOLANTE = [
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [5, 10, 15, 20, 25],
];

export const CORES_DEZENAS = {
  quente: '#C62828',     // Vermelho escuro - alta frequência
  morna: '#F57F17',      // Âmbar - média frequência
  fria: '#1565C0',       // Azul - baixa frequência/atrasada
  favorita: '#2E7D32',   // Verde - números do usuário
  selecionada: '#6A1B9A', // Roxo - selecionada no jogo atual
  normal: '#424242',     // Cinza escuro - padrão
  fundoQuente: '#FFEBEE',
  fundoMorna: '#FFF8E1',
  fundoFria: '#E3F2FD',
  fundoFavorita: '#E8F5E9',
  fundoSelecionada: '#F3E5F5',
};

export const TEMA_CORES = {
  claro: {
    fundo: '#FAFAFA',
    superficie: '#FFFFFF',
    superficieVariante: '#F5F5F5',
    primario: '#1B5E20',
    primarioVariante: '#2E7D32',
    secundario: '#F57F17',
    texto: '#212121',
    textoSecundario: '#616161',
    borda: '#E0E0E0',
    erro: '#C62828',
    sucesso: '#2E7D32',
    aviso: '#F57F17',
    sombra: 'rgba(0,0,0,0.1)',
  },
  escuro: {
    fundo: '#121212',
    superficie: '#1E1E1E',
    superficieVariante: '#2C2C2C',
    primario: '#4CAF50',
    primarioVariante: '#66BB6A',
    secundario: '#FFB300',
    texto: '#FFFFFF',
    textoSecundario: '#B0B0B0',
    borda: '#333333',
    erro: '#EF5350',
    sucesso: '#66BB6A',
    aviso: '#FFB300',
    sombra: 'rgba(0,0,0,0.3)',
  },
  'alto-contraste': {
    fundo: '#000000',
    superficie: '#000000',
    superficieVariante: '#1A1A1A',
    primario: '#FFFF00',
    primarioVariante: '#FFEB3B',
    secundario: '#00FFFF',
    texto: '#FFFFFF',
    textoSecundario: '#CCCCCC',
    borda: '#FFFF00',
    erro: '#FF0000',
    sucesso: '#00FF00',
    aviso: '#FFFF00',
    sombra: 'none',
  },
};

export const TAMANHOS_FONTE = {
  normal: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28, xxxl: 36 },
  grande: { xs: 14, sm: 16, md: 18, lg: 22, xl: 26, xxl: 32, xxxl: 42 },
  'extra-grande': { xs: 16, sm: 18, md: 22, lg: 26, xl: 32, xxl: 40, xxxl: 48 },
};

export const API_ENDPOINTS = {
  CAIXA_BASE: 'https://loteriascaixa-api.herokuapp.com/api/lotofacil',
  CAIXA_RESULTADO_LATEST: 'https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest',
  CAIXA_RESULTADO_NUMERO: (n: number) => `https://loteriascaixa-api.herokuapp.com/api/lotofacil/${n}`,
  CAIXA_ULTIMOS: (qtd: number) => `https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest/${qtd}`,
  // Fallback APIs
  BR_API_BASE: 'https://br-api.com/api/lotofacil',
  BR_API_LATEST: 'https://br-api.com/api/lotofacil/latest',
  BR_API_NUMERO: (n: number) => `https://br-api.com/api/lotofacil/${n}`,
} as const;

export const CHAVES_STORAGE = {
  CONFIGURACOES: '@lotofacil:config',
  FORMULAS: '@lotofacil:formulas',
  JOGOS_GERADOS: '@lotofacil:jogos',
  CONCURSOS_CACHE: '@lotofacil:concursos',
  ESTATISTICAS: '@lotofacil:stats',
  ULTIMA_VERIFICACAO: '@lotofacil:ultima_verificacao',
  FAVORITOS: '@lotofacil:favoritos',
} as const;

export const FECHAMENTOS_PREDEFINIDOS = [
  {
    id: 'fechamento-18-24',
    nome: 'Fechamento 18 números → 24 jogos',
    numerosBase: 18,
    quantidadeJogos: 24,
    garantia: '14 pontos se 15∈18',
    descricao: 'Garante 14 pontos se os 15 sorteados estiverem entre seus 18 números',
    custoPorJogo: 3.00,
  },
  {
    id: 'fechamento-17-16',
    nome: 'Fechamento 17 números → 16 jogos',
    numerosBase: 17,
    quantidadeJogos: 16,
    garantia: '13 pontos se 15∈17',
    descricao: 'Garante 13 pontos se os 15 sorteados estiverem entre seus 17 números',
    custoPorJogo: 3.00,
  },
  {
    id: 'fechamento-16-8',
    nome: 'Fechamento 16 números → 8 jogos',
    numerosBase: 16,
    quantidadeJogos: 8,
    garantia: '13 pontos se 15∈16',
    descricao: 'Mais econômico, garante 13 pontos se 15∈16',
    custoPorJogo: 3.00,
  },
  {
    id: 'fechamento-19-48',
    nome: 'Fechamento 19 números → 48 jogos',
    numerosBase: 19,
    quantidadeJogos: 48,
    garantia: '14 pontos se 15∈19',
    descricao: 'Maior cobertura, garante 14 pontos se 15∈19',
    custoPorJogo: 3.00,
  },
  {
    id: 'fechamento-20-96',
    nome: 'Fechamento 20 números → 96 jogos',
    numerosBase: 20,
    quantidadeJogos: 96,
    garantia: '14 pontos se 15∈20',
    descricao: 'Máxima cobertura para 20 números',
    custoPorJogo: 3.00,
  },
];

export const FORMULA_PADRAO: Omit<import('../types').FormulaUsuario, 'id' | 'criadaEm' | 'atualizadaEm' | 'vezesUsada'> = {
  nome: 'Minha Fórmula Equilibrada',
  descricao: 'Baseada no método 5-5-5-3 do vídeo (5 quentes, 5 frias, 5 aleatórias, 3 favoritas)',
  usarFrequencia: true,
  pesoQuentes: 30,
  pesoFrias: 25,
  pesoAtrasadas: 25,
  qtdQuentes: 5,
  qtdFrias: 5,
  qtdAleatorias: 5,
  qtdFavoritas: 3,
  numerosFavoritos: [],
  faixaSomaMin: 160,
  faixaSomaMax: 220,
  qtdParesMin: 6,
  qtdParesMax: 9,
  qtdImparesMin: 6,
  qtdImparesMax: 9,
  maxPorLinha: 4,
  maxPorColuna: 4,
  excluirDezenas: [],
  exigirDezenas: [],
  ativa: true,
};

export const CONFIG_PADRAO: import('../types').ConfiguracoesApp = {
  tema: 'claro',
  tamanhoFonte: 'grande',
  vozAtivada: true,
  vibracaoAtivada: true,
  notifResultados: true,
  notifDicas: true,
  notifLembreteJogo: true,
  horarioLembrete: '18:00',
  diasLembrete: [1, 3, 5], // Seg, Qua, Sex
  autoAtualizar: true,
  qtdConcursosAnalise: 12,
  backupAutomatico: true,
};

export const DIAS_SEMANA = [
  { valor: 0, label: 'Domingo', curto: 'Dom' },
  { valor: 1, label: 'Segunda', curto: 'Seg' },
  { valor: 2, label: 'Terça', curto: 'Ter' },
  { valor: 3, label: 'Quarta', curto: 'Qua' },
  { valor: 4, label: 'Quinta', curto: 'Qui' },
  { valor: 5, label: 'Sexta', curto: 'Sex' },
  { valor: 6, label: 'Sábado', curto: 'Sáb' },
];

export const DIAS_SORTEIO_LOTOFACIL = [1, 3, 5]; // Seg, Qua, Sex