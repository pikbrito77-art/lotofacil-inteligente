// Utilitários diversos

// UUID v4 simples
export const uuidv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Formatação de data
export const formatarData = (dataISO: string, opcoes?: Intl.DateTimeFormatOptions): string => {
  try {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...opcoes,
    });
  } catch {
    return dataISO;
  }
};

export const formatarDataHora = (dataISO: string): string => {
  try {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dataISO;
  }
};

export const formatarDataCurta = (dataISO: string): string => {
  try {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return dataISO;
  }
};

// Formatação de moeda
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(valor);
};

export const formatarMoedaSimples = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

// Formatação de números
export const formatarNumero = (num: number): string => {
  return new Intl.NumberFormat('pt-BR').format(num);
};

export const formatarPercentual = (valor: number, decimais = 1): string => {
  return `${valor.toFixed(decimais)}%`;
};

// Cores
export const getCorStatus = (status: 'quente' | 'morna' | 'fria'): string => {
  switch (status) {
    case 'quente': return '#C62828';
    case 'fria': return '#1565C0';
    default: return '#F57F17';
  }
};

export const getCorFundoStatus = (status: 'quente' | 'morna' | 'fria'): string => {
  switch (status) {
    case 'quente': return '#FFEBEE';
    case 'fria': return '#E3F2FD';
    default: return '#FFF8E1';
  }
};

export const getCorAcertos = (acertos: number): string => {
  if (acertos >= 14) return '#2E7D32'; // Verde escuro
  if (acertos >= 13) return '#388E3C'; // Verde
  if (acertos >= 12) return '#1565C0'; // Azul
  if (acertos >= 11) return '#F57F17'; // Âmbar
  return '#757575'; // Cinza
};

export const getLabelAcertos = (acertos: number): string => {
  if (acertos >= 15) return '🏆 15 PONTOS - PRÊMIO MÁXIMO!';
  if (acertos === 14) return '🥈 14 PONTOS - ÓTIMO PRÊMIO!';
  if (acertos === 13) return '🥉 13 PONTOS - BOM PRÊMIO';
  if (acertos === 12) return '💰 12 PONTOS - PRÊMIO FIXO';
  if (acertos === 11) return '💵 11 PONTOS - PRÊMIO FIXO';
  return `${acertos} pontos`;
};

// Validações
export const validarDezenas = (dezenas: number[]): { valido: boolean; erro?: string } => {
  if (!Array.isArray(dezenas)) return { valido: false, erro: 'Dezenas deve ser um array' };
  if (dezenas.length !== 15) return { valido: false, erro: 'Deve ter exatamente 15 dezenas' };
  
  const unicas = new Set(dezenas);
  if (unicas.size !== 15) return { valido: false, erro: 'Dezenas não podem se repetir' };
  
  for (const d of dezenas) {
    if (!Number.isInteger(d) || d < 1 || d > 25) {
      return { valido: false, erro: 'Dezenas devem ser números inteiros entre 1 e 25' };
    }
  }
  
  return { valido: true };
};

export const validarFormula = (formula: any): { valido: boolean; erros: string[] } => {
  const erros: string[] = [];
  
  if (!formula.nome || formula.nome.trim().length < 2) {
    erros.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  const somaMin = formula.faixaSomaMin ?? 0;
  const somaMax = formula.faixaSomaMax ?? 0;
  if (somaMin >= somaMax) {
    erros.push('Soma mínima deve ser menor que a máxima');
  }
  if (somaMin < 120 || somaMax > 270) {
    erros.push('Faixa de soma deve estar entre 120 e 270');
  }
  
  if (formula.qtdParesMin > formula.qtdParesMax) {
    erros.push('Pares mínimo deve ser menor ou igual ao máximo');
  }
  if (formula.qtdImparesMin > formula.qtdImparesMax) {
    erros.push('Ímpares mínimo deve ser menor ou igual ao máximo');
  }
  
  const totalMin = formula.qtdParesMin + formula.qtdImparesMin;
  const totalMax = formula.qtdParesMax + formula.qtdImparesMax;
  if (totalMin > 15 || totalMax < 15) {
    erros.push('Soma de pares + ímpares deve permitir exatamente 15 números');
  }
  
  return { valido: erros.length === 0, erros };
};

// Ordenação
export const ordenarDezenas = (dezenas: number[]): number[] => {
  return [...dezenas].sort((a, b) => a - b);
};

export const agruparPorLinha = (dezenas: number[]): number[][] => {
  const linhas: number[][] = [[], [], [], [], []];
  dezenas.forEach(d => {
    const linha = Math.ceil(d / 5) - 1;
    if (linha >= 0 && linha < 5) linhas[linha].push(d);
  });
  return linhas.map(l => l.sort((a, b) => a - b));
};

export const agruparPorColuna = (dezenas: number[]): number[][] => {
  const colunas: number[][] = [[], [], [], [], []];
  dezenas.forEach(d => {
    const coluna = ((d - 1) % 5);
    colunas[coluna].push(d);
  });
  return colunas.map(c => c.sort((a, b) => a - b));
};

// Cálculos matemáticos
export const calcularSoma = (dezenas: number[]): number => {
  return dezenas.reduce((a, b) => a + b, 0);
};

export const calcularParesImpares = (dezenas: number[]): { pares: number; impares: number } => {
  const pares = dezenas.filter(d => d % 2 === 0).length;
  return { pares, impares: dezenas.length - pares };
};

export const calcularMedia = (valores: number[]): number => {
  if (valores.length === 0) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
};

export const calcularDesvioPadrao = (valores: number[]): number => {
  if (valores.length === 0) return 0;
  const media = calcularMedia(valores);
  const variancia = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / valores.length;
  return Math.sqrt(variancia);
};

// Compartilhamento
export const gerarTextoCompartilhamento = (
  jogo: number[], 
  concurso: number,
  formulaNome?: string
): string => {
  const dezenasStr = jogo.map(d => d.toString().padStart(2, '0')).join(' - ');
  let texto = `🍀 Lotofácil - Concurso ${concurso}\n`;
  texto += `${dezenasStr}\n\n`;
  if (formulaNome) texto += `📊 Fórmula: ${formulaNome}\n`;
  texto += `📱 Gerado por: Lotofácil Inteligente`;
  return texto;
};

export const gerarTextoResultado = (
  acertos: number,
  premio: number,
  concurso: number
): string => {
  let texto = `📊 Resultado do Concurso ${concurso}\n\n`;
  texto += `${getLabelAcertos(acertos)}\n`;
  if (premio > 0) {
    texto += `💰 Prêmio estimado: ${formatarMoeda(premio)}\n`;
  }
  texto += `\n📱 Conferido por: Lotofácil Inteligente`;
  return texto;
};

// Armazenamento seguro (wrapper para AsyncStorage)
export const storage = {
  async get<T>(chave: string, padrao: T): Promise<T> {
    try {
      const { getItem } = await import('@react-native-async-storage/async-storage');
      const valor = await getItem(chave);
      return valor ? JSON.parse(valor) : padrao;
    } catch {
      return padrao;
    }
  },
  
  async set(chave: string, valor: unknown): Promise<boolean> {
    try {
      const { setItem } = await import('@react-native-async-storage/async-storage');
      await setItem(chave, JSON.stringify(valor));
      return true;
    } catch {
      return false;
    }
  },
  
  async remove(chave: string): Promise<boolean> {
    try {
      const { removeItem } = await import('@react-native-async-storage/async-storage');
      await removeItem(chave);
      return true;
    } catch {
      return false;
    }
  },
};

// Debounce
export const debounce = <T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Throttle
export const throttle = <T extends (...args: any[]) => any>(
  fn: T, 
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep clone
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Sleep
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Capitalize primeira letra
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncar texto
export const truncar = (str: string, max: number): string => {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + '...';
};