// Serviço de banco de dados SQLite (expo-sqlite)
import * as SQLite from 'expo-sqlite';
import { Concurso, FormulaUsuario, JogoGerado, ConfiguracoesApp, FrequenciaDezena } from '@/types';
import { CHAVES_STORAGE } from '@/constants';

// Abre/cria o banco
const db = SQLite.openDatabaseSync('lotofacil.db');

// Inicialização das tabelas
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.execAsync(`
      -- Tabela de concursos
      CREATE TABLE IF NOT EXISTS concursos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero INTEGER UNIQUE NOT NULL,
        data TEXT NOT NULL,
        dezenas TEXT NOT NULL, -- JSON array
        premiacoes TEXT NOT NULL, -- JSON array
        acumulou INTEGER NOT NULL DEFAULT 0,
        valorAcumulado REAL NOT NULL DEFAULT 0,
        proxConcurso INTEGER,
        dataProxConcurso TEXT,
        valorEstimadoProx REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_concursos_numero ON concursos(numero DESC);
      CREATE INDEX IF NOT EXISTS idx_concursos_data ON concursos(data DESC);

      -- Tabela de fórmulas do usuário
      CREATE TABLE IF NOT EXISTS formulas (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT,
        config TEXT NOT NULL, -- JSON completo da FormulaUsuario
        ativa INTEGER NOT NULL DEFAULT 1,
        vezes_usada INTEGER NOT NULL DEFAULT 0,
        criada_em TEXT NOT NULL,
        atualizada_em TEXT NOT NULL
      );

      -- Tabela de jogos gerados
      CREATE TABLE IF NOT EXISTS jogos_gerados (
        id TEXT PRIMARY KEY,
        formula_id TEXT NOT NULL,
        formula_nome TEXT NOT NULL,
        dezenas TEXT NOT NULL, -- JSON array
        concurso_alvo INTEGER NOT NULL,
        data_geracao TEXT NOT NULL,
        conferido INTEGER NOT NULL DEFAULT 0,
        acertos INTEGER,
        premio REAL,
        FOREIGN KEY (formula_id) REFERENCES formulas(id)
      );

      CREATE INDEX IF NOT EXISTS idx_jogos_concurso ON jogos_gerados(concurso_alvo);
      CREATE INDEX IF NOT EXISTS idx_jogos_formula ON jogos_gerados(formula_id);

      -- Tabela de configurações
      CREATE TABLE IF NOT EXISTS configuracoes (
        chave TEXT PRIMARY KEY,
        valor TEXT NOT NULL
      );

      -- Tabela de estatísticas do usuário
      CREATE TABLE IF NOT EXISTS estatisticas (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        total_jogos_gerados INTEGER NOT NULL DEFAULT 0,
        total_gasto REAL NOT NULL DEFAULT 0,
        total_premios REAL NOT NULL DEFAULT 0,
        melhor_acerto INTEGER NOT NULL DEFAULT 0,
        concursos_participados INTEGER NOT NULL DEFAULT 0,
        formulas_criadas INTEGER NOT NULL DEFAULT 0,
        sequencia_atual INTEGER NOT NULL DEFAULT 0,
        ultimo_acesso TEXT,
        atualizado_em TEXT NOT NULL
      );

      -- Inserir configuração padrão se não existir
      INSERT OR IGNORE INTO estatisticas (id, atualizado_em) VALUES (1, datetime('now'));
    `).then(() => resolve()).catch(reject);
  });
};

// ========== CONCURSOS ==========

export const salvarConcurso = async (concurso: Concurso): Promise<void> => {
  await db.runAsync(
    `INSERT OR REPLACE INTO concursos 
     (numero, data, dezenas, premiacoes, acumulou, valorAcumulado, proxConcurso, dataProxConcurso, valorEstimadoProx)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      concurso.numero,
      concurso.data,
      JSON.stringify(concurso.dezenas),
      JSON.stringify(concurso.premiacoes),
      concurso.acumulou ? 1 : 0,
      concurso.valorAcumulado,
      concurso.proxConcurso || null,
      concurso.dataProxConcurso || null,
      concurso.valorEstimadoProx || null,
    ]
  );
};

export const salvarConcursos = async (concursos: Concurso[]): Promise<void> => {
  await db.withTransactionAsync(async () => {
    for (const c of concursos) {
      await salvarConcurso(c);
    }
  });
};

export const buscarConcurso = async (numero: number): Promise<Concurso | null> => {
  const result = await db.getFirstAsync<{
    numero: number;
    data: string;
    dezenas: string;
    premiacoes: string;
    acumulou: number;
    valorAcumulado: number;
    proxConcurso: number | null;
    dataProxConcurso: string | null;
    valorEstimadoProx: number | null;
  }>('SELECT * FROM concursos WHERE numero = ?', [numero]);
  
  if (!result) return null;
  
  return {
    id: result.numero,
    numero: result.numero,
    data: result.data,
    dezenas: JSON.parse(result.dezenas),
    premiacoes: JSON.parse(result.premiacoes),
    acumulou: !!result.acumulou,
    valorAcumulado: result.valorAcumulado,
    proxConcurso: result.proxConcurso || undefined,
    dataProxConcurso: result.dataProxConcurso || undefined,
    valorEstimadoProx: result.valorEstimadoProx || undefined,
  };
};

export const buscarUltimosConcursos = async (quantidade: number): Promise<Concurso[]> => {
  const rows = await db.getAllAsync<{
    numero: number;
    data: string;
    dezenas: string;
    premiacoes: string;
    acumulou: number;
    valorAcumulado: number;
    proxConcurso: number | null;
    dataProxConcurso: string | null;
    valorEstimadoProx: number | null;
  }>('SELECT * FROM concursos ORDER BY numero DESC LIMIT ?', [quantidade]);
  
  return rows.map(r => ({
    id: r.numero,
    numero: r.numero,
    data: r.data,
    dezenas: JSON.parse(r.dezenas),
    premiacoes: JSON.parse(r.premiacoes),
    acumulou: !!r.acumulou,
    valorAcumulado: r.valorAcumulado,
    proxConcurso: r.proxConcurso || undefined,
    dataProxConcurso: r.dataProxConcurso || undefined,
    valorEstimadoProx: r.valorEstimadoProx || undefined,
  }));
};

export const buscarTodosConcursos = async (): Promise<Concurso[]> => {
  const rows = await db.getAllAsync<{
    numero: number;
    data: string;
    dezenas: string;
    premiacoes: string;
    acumulou: number;
    valorAcumulado: number;
  }>('SELECT * FROM concursos ORDER BY numero DESC');
  
  return rows.map(r => ({
    id: r.numero,
    numero: r.numero,
    data: r.data,
    dezenas: JSON.parse(r.dezenas),
    premiacoes: JSON.parse(r.premiacoes),
    acumulou: !!r.acumulou,
    valorAcumulado: r.valorAcumulado,
  }));
};

export const buscarUltimoConcurso = async (): Promise<Concurso | null> => {
  const result = await db.getFirstAsync<{
    numero: number;
    data: string;
    dezenas: string;
    premiacoes: string;
    acumulou: number;
    valorAcumulado: number;
    proxConcurso: number | null;
    dataProxConcurso: string | null;
    valorEstimadoProx: number | null;
  }>('SELECT * FROM concursos ORDER BY numero DESC LIMIT 1');
  
  if (!result) return null;
  
  return {
    id: result.numero,
    numero: result.numero,
    data: result.data,
    dezenas: JSON.parse(result.dezenas),
    premiacoes: JSON.parse(result.premiacoes),
    acumulou: !!result.acumulou,
    valorAcumulado: result.valorAcumulado,
    proxConcurso: result.proxConcurso || undefined,
    dataProxConcurso: result.dataProxConcurso || undefined,
    valorEstimadoProx: result.valorEstimadoProx || undefined,
  };
};

export const contarConcursos = async (): Promise<number> => {
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM concursos');
  return result?.count || 0;
};

// ========== FÓRMULAS ==========

export const salvarFormula = async (formula: FormulaUsuario): Promise<void> => {
  await db.runAsync(
    `INSERT OR REPLACE INTO formulas 
     (id, nome, descricao, config, ativa, vezes_usada, criada_em, atualizada_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      formula.id,
      formula.nome,
      formula.descricao || '',
      JSON.stringify(formula),
      formula.ativa ? 1 : 0,
      formula.vezesUsada,
      formula.criadaEm,
      formula.atualizadaEm,
    ]
  );
};

export const buscarFormulas = async (apenasAtivas = false): Promise<FormulaUsuario[]> => {
  const sql = apenasAtivas 
    ? 'SELECT * FROM formulas WHERE ativa = 1 ORDER BY atualizada_em DESC'
    : 'SELECT * FROM formulas ORDER BY atualizada_em DESC';
  
  const rows = await db.getAllAsync<{
    id: string;
    nome: string;
    descricao: string;
    config: string;
    ativa: number;
    vezes_usada: number;
    criada_em: string;
    atualizada_em: string;
  }>(sql);
  
  return rows.map(r => JSON.parse(r.config));
};

export const buscarFormula = async (id: string): Promise<FormulaUsuario | null> => {
  const row = await db.getFirstAsync<{ config: string }>(
    'SELECT config FROM formulas WHERE id = ?', [id]
  );
  return row ? JSON.parse(row.config) : null;
};

export const deletarFormula = async (id: string): Promise<void> => {
  await db.runAsync('DELETE FROM formulas WHERE id = ?', [id]);
};

export const incrementarUsoFormula = async (id: string): Promise<void> => {
  await db.runAsync(
    'UPDATE formulas SET vezes_usada = vezes_usada + 1, atualizada_em = datetime("now") WHERE id = ?',
    [id]
  );
};

// ========== JOGOS GERADOS ==========

export const salvarJogo = async (jogo: JogoGerado): Promise<void> => {
  await db.runAsync(
    `INSERT OR REPLACE INTO jogos_gerados 
     (id, formula_id, formula_nome, dezenas, concurso_alvo, data_geracao, conferido, acertos, premio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      jogo.id,
      jogo.formulaId,
      jogo.formulaNome,
      JSON.stringify(jogo.dezenas),
      jogo.concursoAlvo,
      jogo.dataGeracao,
      jogo.conferido ? 1 : 0,
      jogo.acertos ?? null,
      jogo.premio ?? null,
    ]
  );
};

export const salvarJogos = async (jogos: JogoGerado[]): Promise<void> => {
  await db.withTransactionAsync(async () => {
    for (const j of jogos) {
      await salvarJogo(j);
    }
  });
};

export const buscarJogosPorConcurso = async (concurso: number): Promise<JogoGerado[]> => {
  const rows = await db.getAllAsync<{
    id: string;
    formula_id: string;
    formula_nome: string;
    dezenas: string;
    concurso_alvo: number;
    data_geracao: string;
    conferido: number;
    acertos: number | null;
    premio: number | null;
  }>('SELECT * FROM jogos_gerados WHERE concurso_alvo = ? ORDER BY data_geracao DESC', [concurso]);
  
  return rows.map(r => ({
    id: r.id,
    formulaId: r.formula_id,
    formulaNome: r.formula_nome,
    dezenas: JSON.parse(r.dezenas),
    concursoAlvo: r.concurso_alvo,
    dataGeracao: r.data_geracao,
    conferido: !!r.conferido,
    acertos: r.acertos ?? undefined,
    premio: r.premio ?? undefined,
  }));
};

export const buscarJogosPorFormula = async (formulaId: string): Promise<JogoGerado[]> => {
  const rows = await db.getAllAsync<{
    id: string;
    formula_id: string;
    formula_nome: string;
    dezenas: string;
    concurso_alvo: number;
    data_geracao: string;
    conferido: number;
    acertos: number | null;
    premio: number | null;
  }>('SELECT * FROM jogos_gerados WHERE formula_id = ? ORDER BY concurso_alvo DESC', [formulaId]);
  
  return rows.map(r => ({
    id: r.id,
    formulaId: r.formula_id,
    formulaNome: r.formula_nome,
    dezenas: JSON.parse(r.dezenas),
    concursoAlvo: r.concurso_alvo,
    dataGeracao: r.data_geracao,
    conferido: !!r.conferido,
    acertos: r.acertos ?? undefined,
    premio: r.premio ?? undefined,
  }));
};

export const buscarTodosJogos = async (): Promise<JogoGerado[]> => {
  const rows = await db.getAllAsync<{
    id: string;
    formula_id: string;
    formula_nome: string;
    dezenas: string;
    concurso_alvo: number;
    data_geracao: string;
    conferido: number;
    acertos: number | null;
    premio: number | null;
  }>('SELECT * FROM jogos_gerados ORDER BY data_geracao DESC');
  
  return rows.map(r => ({
    id: r.id,
    formulaId: r.formula_id,
    formulaNome: r.formula_nome,
    dezenas: JSON.parse(r.dezenas),
    concursoAlvo: r.concurso_alvo,
    dataGeracao: r.data_geracao,
    conferido: !!r.conferido,
    acertos: r.acertos ?? undefined,
    premio: r.premio ?? undefined,
  }));
};

export const conferirJogo = async (jogoId: string, acertos: number, premio: number): Promise<void> => {
  await db.runAsync(
    'UPDATE jogos_gerados SET conferido = 1, acertos = ?, premio = ? WHERE id = ?',
    [acertos, premio, jogoId]
  );
};

// ========== CONFIGURAÇÕES ==========

export const salvarConfiguracao = async (chave: string, valor: unknown): Promise<void> => {
  await db.runAsync(
    'INSERT OR REPLACE INTO configuracoes (chave, valor) VALUES (?, ?)',
    [chave, JSON.stringify(valor)]
  );
};

export const buscarConfiguracao = async <T>(chave: string, padrao: T): Promise<T> => {
  const row = await db.getFirstAsync<{ valor: string }>(
    'SELECT valor FROM configuracoes WHERE chave = ?', [chave]
  );
  return row ? JSON.parse(row.valor) : padrao;
};

export const buscarTodasConfiguracoes = async (): Promise<Record<string, unknown>> => {
  const rows = await db.getAllAsync<{ chave: string; valor: string }>('SELECT * FROM configuracoes');
  const result: Record<string, unknown> = {};
  for (const r of rows) {
    result[r.chave] = JSON.parse(r.valor);
  }
  return result;
};

// ========== ESTATÍSTICAS ==========

export const buscarEstatisticas = async (): Promise<{
  totalJogosGerados: number;
  totalGasto: number;
  totalPremios: number;
  melhorAcerto: number;
  concursosParticipados: number;
  formulasCriadas: number;
  sequenciaAtual: number;
  ultimoAcesso: string | null;
}> => {
  const row = await db.getFirstAsync<{
    total_jogos_gerados: number;
    total_gasto: number;
    total_premios: number;
    melhor_acerto: number;
    concursos_participados: number;
    formulas_criadas: number;
    sequencia_atual: number;
    ultimo_acesso: string | null;
  }>('SELECT * FROM estatisticas WHERE id = 1');
  
  return row ? {
    totalJogosGerados: row.total_jogos_gerados,
    totalGasto: row.total_gasto,
    totalPremios: row.total_premios,
    melhorAcerto: row.melhor_acerto,
    concursosParticipados: row.concursos_participados,
    formulasCriadas: row.formulas_criadas,
    sequenciaAtual: row.sequencia_atual,
    ultimoAcesso: row.ultimo_acesso,
  } : {
    totalJogosGerados: 0,
    totalGasto: 0,
    totalPremios: 0,
    melhorAcerto: 0,
    concursosParticipados: 0,
    formulasCriadas: 0,
    sequenciaAtual: 0,
    ultimoAcesso: null,
  };
};

export const atualizarEstatisticas = async (updates: Partial<{
  totalJogosGerados: number;
  totalGasto: number;
  totalPremios: number;
  melhorAcerto: number;
  concursosParticipados: number;
  formulasCriadas: number;
  sequenciaAtual: number;
  ultimoAcesso: string;
}>): Promise<void> => {
  const sets: string[] = [];
  const values: unknown[] = [];
  
  const map: Record<string, string> = {
    totalJogosGerados: 'total_jogos_gerados',
    totalGasto: 'total_gasto',
    totalPremios: 'total_premios',
    melhorAcerto: 'melhor_acerto',
    concursosParticipados: 'concursos_participados',
    formulasCriadas: 'formulas_criadas',
    sequenciaAtual: 'sequencia_atual',
    ultimoAcesso: 'ultimo_acesso',
  };
  
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && map[key]) {
      sets.push(`${map[key]} = ?`);
      values.push(value);
    }
  }
  
  if (sets.length === 0) return;
  
  sets.push('atualizado_em = datetime("now")');
  await db.runAsync(
    `UPDATE estatisticas SET ${sets.join(', ')} WHERE id = 1`,
    values
  );
};

export const resetarEstatisticas = async (): Promise<void> => {
  await db.runAsync(`
    UPDATE estatisticas SET 
      total_jogos_gerados = 0,
      total_gasto = 0,
      total_premios = 0,
      melhor_acerto = 0,
      concursos_participados = 0,
      formulas_criadas = 0,
      sequencia_atual = 0,
      atualizado_em = datetime("now")
    WHERE id = 1
  `);
};

// ========== UTILITÁRIOS ==========

export const limparCacheAntigo = async (diasManter = 90): Promise<void> => {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - diasManter);
  await db.runAsync(
    'DELETE FROM concursos WHERE data < ?',
    [dataLimite.toISOString()]
  );
};

export const exportarDados = async (): Promise<string> => {
  const [concursos, formulas, jogos, configs, stats] = await Promise.all([
    buscarTodosConcursos(),
    buscarFormulas(),
    buscarTodosJogos(),
    buscarTodasConfiguracoes(),
    buscarEstatisticas(),
  ]);
  
  return JSON.stringify({
    versao: '1.0',
    exportadoEm: new Date().toISOString(),
    concursos,
    formulas,
    jogos,
    configuracoes: configs,
    estatisticas: stats,
  }, null, 2);
};

export const importarDados = async (json: string): Promise<void> => {
  const data = JSON.parse(json);
  
  await db.withTransactionAsync(async () => {
    if (data.concursos) await salvarConcursos(data.concursos);
    if (data.formulas) {
      for (const f of data.formulas) await salvarFormula(f);
    }
    if (data.jogos) await salvarJogos(data.jogos);
    if (data.configuracoes) {
      for (const [k, v] of Object.entries(data.configuracoes)) {
        await salvarConfiguracao(k, v);
      }
    }
    if (data.estatisticas) await atualizarEstatisticas(data.estatisticas);
  });
};