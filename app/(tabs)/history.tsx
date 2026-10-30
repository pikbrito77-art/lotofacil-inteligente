// Tela de Histórico e Estatísticas
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Modal } from 'react-native';
import { useJogos } from '@/hooks';
import { useEstatisticas } from '@/hooks';
import { useConcursos } from '@/hooks';
import { useFormulas } from '@/hooks';
import { useTema } from '@/hooks';
import { useConfiguracoes } from '@/hooks';
import { 
  Box, Texto, Titulo, Subtitulo, Botao, Card, Badge, Separador, Linha, Coluna, Icones, SafeArea, Scroll 
} from '@/components/ui';
import { formatarData, formatarMoeda, getCorAcertos, getLabelAcertos, exportarDados as exportarDadosUtil } from '@/utils';
import * as Database from '@/services/database';

export default function HistoryScreen() {
  const { jogos, carregarTodos } = useJogos();
  const { stats, carregar: carregarStats } = useEstatisticas();
  const { concursos } = useConcursos();
  const { formulas } = useFormulas();
  const { config } = useConfiguracoes();
  const { tema, falar, vibrar } = useTema();
  const cores = TEMA_CORES[tema];
  
  const [mostrarExportar, setMostrarExportar] = useState(false);
  const [dadosExportados, setDadosExportados] = useState('');
  const [filtroFormula, setFiltroFormula] = useState<string>('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState<'todos' | 'mes' | 'ano'>('todos');
  
  useEffect(() => {
    carregarTodos();
    carregarStats();
  }, [carregarTodos, carregarStats]);
  
  // Filtra jogos
  const jogosFiltrados = jogos.filter(j => {
    if (filtroFormula !== 'todas' && j.formulaId !== filtroFormula) return false;
    // Filtro de período poderia ser implementado aqui
    return true;
  });
  
  // Estatísticas por fórmula
  const statsPorFormula = formulas.map(f => {
    const jogosFormula = jogos.filter(j => j.formulaId === f.id);
    const conferidos = jogosFormula.filter(j => j.conferido);
    const acertos = conferidos.reduce((acc, j) => acc + (j.acertos || 0), 0);
    const premios = conferidos.reduce((acc, j) => acc + (j.premio || 0), 0);
    const custo = jogosFormula.length * 3.00;
    
    return {
      formula: f,
      totalJogos: jogosFormula.length,
      conferidos: conferidos.length,
      mediaAcertos: conferidos.length > 0 ? acertos / conferidos.length : 0,
      totalPremios: premios,
      custoTotal: custo,
      roi: custo > 0 ? ((premios - custo) / custo) * 100 : 0,
      melhorAcerto: Math.max(...conferidos.map(j => j.acertos || 0), 0),
    };
  }).filter(s => s.totalJogos > 0);
  
  const handleExportar = async () => {
    try {
      const json = await exportarDadosUtil();
      setDadosExportados(json);
      setMostrarExportar(true);
    } catch (e) {
      Alert.alert('Erro', 'Falha ao exportar dados');
    }
  };
  
  const handleCompartilharRelatorio = () => {
    const texto = `📊 RELATÓRIO LOTOFÁCIL INTELIGENTE\n\n` +
      `📈 Total de Jogos: ${stats.totalJogosGerados}\n` +
      `💰 Total Investido: ${formatarMoeda(stats.totalGasto)}\n` +
      `🏆 Total em Prêmios: ${formatarMoeda(stats.totalPremios)}\n` +
      `📊 ROI: ${stats.totalGasto > 0 ? (((stats.totalPremios - stats.totalGasto) / stats.totalGasto) * 100).toFixed(1) : 0}%\n` +
      `⭐ Melhor Acerto: ${stats.melhorAcerto} pontos\n` +
      `📅 Concursos Participados: ${stats.concursosParticipados}\n` +
      `🧮 Fórmulas Criadas: ${stats.formulasCriadas}\n\n` +
      `📱 Gerado por: Lotofácil Inteligente`;
    
    Alert.alert('Relatório', texto, [{ text: 'Copiar', onPress: () => {} }, { text: 'Fechar' }]);
  };
  
  return (
    <SafeArea>
      <Scroll contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}>
        {/* Cabeçalho */}
        <Linha alinhamento="space-between" style={{ marginBottom: 16 }}>
          <View>
            <Titulo nivel={2}>Histórico & Estatísticas</Titulo>
            <Subtitulo>Acompanhe seu desempenho ao longo do tempo</Subtitle>
          </View>
          <Botao variant="outline" tamanho="pequeno" onPress={handleCompartilharRelatorio} iconeEsquerda={<Icones.Compartilhar size={18} />}>
            Relatório
          </Botao>
        </Linha>
        
        {/* Cards de Resumo Geral */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <Card style={{ flex: 1, minWidth: '45%', padding: 16 }}>
            <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
              <Icones.Jogos size={24} color={cores.primario} />
              <Texto tamanho="sm" cor="#666">Total de Jogos</Texto>
            </Linha>
            <Texto tamanho="xxl" peso="bold" alinhamento="center" style={{ marginTop: 4 }}>
              {stats.totalJogosGerados}
            </Texto>
          </Card>
          
          <Card style={{ flex: 1, minWidth: '45%', padding: 16 }}>
            <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
              <Icones.Dinheiro size={24} color="#C62828" />
              <Texto tamanho="sm" cor="#666">Investido</Texto>
            </Linha>
            <Texto tamanho="xxl" peso="bold" cor="#C62828" alinhamento="center" style={{ marginTop: 4 }}>
              {formatarMoeda(stats.totalGasto)}
            </Texto>
          </Card>
          
          <Card style={{ flex: 1, minWidth: '45%', padding: 16 }}>
            <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
              <Icones.Premio size={24} color="#2E7D32" />
              <Texto tamanho="sm" cor="#666">Prêmios</Texto>
            </Linha>
            <Texto tamanho="xxl" peso="bold" cor="#2E7D32" alinhamento="center" style={{ marginTop: 4 }}>
              {formatarMoeda(stats.totalPremios)}
            </Texto>
          </Card>
          
          <Card style={{ flex: 1, minWidth: '45%', padding: 16 }}>
            <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
              <Icones.Grafico size={24} color="#6A1B9A" />
              <Texto tamanho="sm" cor="#666">ROI</Texto>
            </Linha>
            <Texto tamanho="xxl" peso="bold" cor={stats.totalPremios >= stats.totalGasto ? '#2E7D32' : '#C62828'} alinhamento="center" style={{ marginTop: 4 }}>
              {stats.totalGasto > 0 ? (((stats.totalPremios - stats.totalGasto) / stats.totalGasto) * 100).toFixed(1) : 0}%
            </Texto>
          </Card>
          
          <Card style={{ flex: 1, minWidth: '45%', padding: 16 }}>
            <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
              <Icones.Estrella size={24} color="#F57F17" />
              <Texto tamanho="sm" cor="#666">Melhor Acerto</Texto>
            </Linha>
            <Texto tamanho="xxl" peso="bold" cor="#F57F17" alinhamento="center" style={{ marginTop: 4 }}>
              {stats.melhorAcerto} pts
            </Texto>
          </Card>
          
          <Card style={{ flex: 1, minWidth: '45%', padding: 16 }}>
            <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
              <Icones.Formula size={24} color="#00BCD4" />
              <Texto tamanho="sm" cor="#666">Fórmulas</Texto>
            </Linha>
            <Texto tamanho="xxl" peso="bold" cor="#00BCD4" alinhamento="center" style={{ marginTop: 4 }}>
              {stats.formulasCriadas}
            </Texto>
          </Card>
        </View>
        
        {/* Desempenho por Fórmula */}
        {statsPorFormula.length > 0 && (
          <>
            <Separador />
            <Titulo nivel={3} style={{ marginBottom: 12 }}>Desempenho por Fórmula</Titulo>
            
            <View style={{ gap: 10 }}>
              {statsPorFormula.map(s => (
                <Card key={s.formula.id} style={{ padding: 16 }}>
                  <Linha alinhamento="space-between" style={{ marginBottom: 12 }}>
                    <Texto tamanho="md" peso="bold">{s.formula.nome}</Texto>
                    <Badge variant={s.roi >= 0 ? 'success' : 'error'} tamanho="pequeno">
                      ROI: {s.roi >= 0 ? '+' : ''}{s.roi.toFixed(1)}%
                    </Badge>
                  </Linha>
                  
                  <Linha alinhamento="space-around">
                    <Coluna alinhamento="center">
                      <Texto tamanho="xs" cor="#888">Jogos</Texto>
                      <Texto peso="bold">{s.totalJogos}</Texto>
                    </Coluna>
                    <Coluna alinhamento="center">
                      <Texto tamanho="xs" cor="#888">Conferidos</Texto>
                      <Texto peso="bold">{s.conferidos}</Texto>
                    </Coluna>
                    <Coluna alinhamento="center">
                      <Texto tamanho="xs" cor="#888">Média Pts</Texto>
                      <Texto peso="bold">{s.mediaAcertos.toFixed(1)}</Texto>
                    </Coluna>
                    <Coluna alinhamento="center">
                      <Texto tamanho="xs" cor="#888">Melhor</Texto>
                      <Texto peso="bold" cor={getCorAcertos(s.melhorAcerto)}>{s.melhorAcerto} pts</Texto>
                    </Coluna>
                    <Coluna alinhamento="center">
                      <Texto tamanho="xs" cor="#888">Prêmios</Texto>
                      <Texto peso="bold" cor="#2E7D32">{formatarMoeda(s.totalPremios)}</Texto>
                    </Coluna>
                    <Coluna alinhamento="center">
                      <Texto tamanho="xs" cor="#888">Custo</Texto>
                      <Texto peso="bold" cor="#C62828">{formatarMoeda(s.custoTotal)}</Texto>
                    </Coluna>
                  </Linha>
                </Card>
              ))}
            </View>
          </>
        )}
        
        {/* Filtros */}
        <Separador />
        <Titulo nivel={3} style={{ marginBottom: 12 }}>Histórico de Jogos</Titulo>
        
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Botao 
            variant={filtroFormula === 'todas' ? 'primario' : 'outline'} 
            tamanho="pequeno"
            onPress={() => setFiltroFormula('todas')}
          >
            Todas Fórmulas
          </Botao>
          {formulas.map(f => (
            <Botao 
              key={f.id}
              variant={filtroFormula === f.id ? 'primario' : 'outline'} 
              tamanho="pequeno"
              onPress={() => setFiltroFormula(f.id)}
            >
              {f.nome}
            </Botao>
          ))}
        </View>
        
        {/* Lista de Jogos */}
        {jogosFiltrados.length === 0 ? (
          <Card style={{ padding: 30, alignItems: 'center' }}>
            <Icones.Historico size={64} color="#ccc" />
            <Texto tamanho="lg" peso="medium" style={{ marginTop: 16, textAlign: 'center' }}>
              {jogos.length === 0 ? 'Nenhum jogo gerado ainda' : 'Nenhum jogo com este filtro'}
            </Texto>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {jogosFiltrados.slice(0, 50).map((jogo, index) => (
              <Card key={jogo.id} style={{ marginBottom: 10 }}>
                <Linha alinhamento="space-between" style={{ marginBottom: 8 }}>
                  <Linha alinhamento="center" style={{ gap: 8 }}>
                    <Badge variant="info" tamanho="pequeno">
                      #{index + 1}
                    </Badge>
                    <Badge variant={jogo.conferido ? 'success' : 'default'} tamanho="pequeno">
                      {jogo.formulaNome}
                    </Badge>
                    {jogo.conferido && (
                      <Badge 
                        variant={jogo.acertos && jogo.acertos >= 11 ? 'success' : 'default'} 
                        tamanho="pequeno"
                      >
                        {getLabelAcertos(jogo.acertos || 0)}
                      </Badge>
                    )}
                  </Linha>
                  <Texto tamanho="xs" cor="#888">
                    Concurso {jogo.concursoAlvo} • {formatarData(jogo.dataGeracao)}
                  </Texto>
                </Linha>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginBottom: 8 }}>
                  {jogo.dezenas.map((d: number, i: number) => (
                    <Icones.Numero key={i} numero={d} size={26} />
                  ))}
                </View>
                
                {jogo.conferido && (
                  <Linha alinhamento="space-around" style={{ paddingTop: 8, borderTopWidth: 1, borderColor: '#eee' }}>
                    <Coluna alinhamento="center">
                      <Texto tamanho="xs" cor="#888">Acertos</Texto>
                      <Texto tamanho="md" peso="bold" cor={getCorAcertos(jogo.acertos || 0)}>
                        {jogo.acertos}
                      </Texto>
                    </Coluna>
                    <Coluna alinhamento="center">
                      <Texto tamanho="xs" cor="#888">Soma</Texto>
                      <Texto tamanho="md" peso="bold">{Analysis.calcularSoma(jogo.dezenas)}</Texto>
                    </Coluna>
                    <Coluna alinhamento="center">
                      <Texto tamanho="xs" cor="#888">P/I</Texto>
                      <Texto tamanho="md" peso="bold">
                        {Analysis.calcularParesImpares(jogo.dezenas).pares}P/{Analysis.calcularParesImpares(jogo.dezenas).impares}I
                      </Texto>
                    </Coluna>
                    {jogo.premio && (
                      <Coluna alinhamento="center">
                        <Texto tamanho="xs" cor="#888">Prêmio</Texto>
                        <Texto tamanho="md" peso="bold" cor="#2E7D32">{formatarMoeda(jogo.premio)}</Texto>
                      </Coluna>
                    )}
                  </Linha>
                )}
              </Card>
            ))}
            {jogosFiltrados.length > 50 && (
              <Card style={{ alignItems: 'center', padding: 16 }}>
                <Texto tamanho="sm" cor="#666">Mostrando 50 de {jogosFiltrados.length} jogos</Texto>
              </Card>
            )}
          </View>
        )}
        
        {/* Ações */}
        <Separador />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Botao variant="secundario" larguraTotal onPress={handleExportar} iconeEsquerda={<Icones.Backup size={20} />}>
            Exportar Dados (JSON)
          </Botao>
          <Botao variant="outline" larguraTotal onPress={handleCompartilharRelatorio} iconeEsquerda={<Icones.Compartilhar size={20} />}>
            Compartilhar Relatório
          </Botao>
        </View>
        
        <View style={{ marginTop: 30, paddingVertical: 20, alignItems: 'center' }}>
          <Texto tamanho="xs" cor="#999" alinhamento="center">
            Última atualização: {formatarData(new Date().toISOString())}
          </Texto>
        </View>
      </Scroll>
      
      {/* Modal Exportar */}
      {mostrarExportar && (
        <Modal visible={true} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ margin: 20, borderRadius: 16, backgroundColor: '#fff', padding: 24, maxHeight: '80%' }}>
              <Titulo nivel={3} alinhamento="center" style={{ marginBottom: 16 }}>Dados Exportados (JSON)</Titulo>
              <Texto tamanho="xs" cor="#666" style={{ marginBottom: 12, textAlign: 'center' }}>
                Copie este conteúdo e salve em um arquivo .json para backup
              </Texto>
              <Scroll style={{ maxHeight: 300 }}>
                <Texto tamanho="xs" estilo={{ fontFamily: 'monospace', lineHeight: 18 }}>
                  {dadosExportados}
                </Texto>
              </Scroll>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <Botao variant="outline" larguraTotal onPress={() => setMostrarExportar(false)}>
                  Fechar
                </Botao>
                <Botao variant="primario" larguraTotal onPress={() => { /* Copiar para clipboard */ vibrar('success'); }}>
                  Copiar
                </Botao>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeArea>
  );
}

import { TEMA_CORES } from '@/constants';
import * as Analysis from '@/services/analysis';