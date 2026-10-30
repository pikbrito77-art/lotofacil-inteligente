// Tela de Meus Jogos - Geração e Conferência
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Modal, Platform } from 'react-native';
import { useFormulas } from '@/hooks';
import { useJogos } from '@/hooks';
import { useConcursos } from '@/hooks';
import { useAnalise } from '@/hooks';
import { useTema } from '@/hooks';
import { useConfiguracoes } from '@/hooks';
import { 
  Box, Texto, Titulo, Subtitulo, Botao, Card, Badge, Separador, Linha, Coluna, Icones, Input, SafeArea, Scroll 
} from '@/components/ui';
import { LOTOFACIL_CONFIG, FECHAMENTOS_PREDEFINIDOS } from '@/constants';
import { formatarData, formatarMoeda, getCorAcertos, getLabelAcertos, gerarTextoCompartilhamento } from '@/utils';
import { uuidv4 } from '@/utils';
import * as Analysis from '@/services/analysis';
import * as Database from '@/services/database';

export default function JogosScreen() {
  const { formulaAtiva, formulas } = useFormulas();
  const { jogos, carregando, gerarEconomicos, conferir, carregarPorConcurso, carregarTodos } = useJogos();
  const { concursos, ultimoConcurso, verificarNovos } = useConcursos();
  const { analise } = useAnalise(concursos);
  const { config } = useConfiguracoes();
  const { tema, falar, vibrar } = useTema();
  const cores = TEMA_CORES[tema];
  
  const [qtdJogos, setQtdJogos] = useState(1);
  const [tipoFechamento, setTipoFechamento] = useState('fechamento-18-24');
  const [mostrarConferencia, setMostrarConferencia] = useState<{ jogo: any; resultado: number[] } | null>(null);
  const [gerando, setGerando] = useState(false);
  
  const fechamentoSelecionado = FECHAMENTOS_PREDEFINIDOS.find(f => f.id === tipoFechamento);
  const concursoAlvo = ultimoConcurso?.proxConcurso || (ultimoConcurso?.numero || 0) + 1;
  const custoUnitario = LOTOFACIL_CONFIG.CUSTO_APOSTA_SIMPLES;
  const custoTotal = qtdJogos * custoUnitario;
  
  // Carrega jogos do concurso alvo ao abrir
  useEffect(() => {
    if (concursoAlvo) {
      carregarPorConcurso(concursoAlvo);
    }
  }, [concursoAlvo, carregarPorConcurso]);
  
  const handleGerarJogos = async () => {
    if (!formulaAtiva) {
      Alert.alert('Aviso', 'Crie ou selecione uma fórmula ativa primeiro');
      return;
    }
    if (!analise) {
      Alert.alert('Aviso', 'Aguardando análise estatística...');
      return;
    }
    
    setGerando(true);
    vibrar('medium');
    
    try {
      const novosJogos = await gerarEconomicos(formulaAtiva, analise, concursoAlvo, qtdJogos);
      
      if (novosJogos.length > 0) {
        vibrar('success');
        falar(`${novosJogos.length} jogo${novosJogos.length > 1 ? 's' : ''} gerado${novosJogos.length > 1 ? 's' : ''} com sucesso`);
        Alert.alert(
          'Jogos Gerados! ✅',
          `${novosJogos.length} jogo${novosJogos.length > 1 ? 's' : ''} criado${novosJogos.length > 1 ? 's' : ''} para o concurso ${concursoAlvo}.\n\nCusto total: ${formatarMoeda(custoTotal)}`
        );
      } else {
        Alert.alert('Atenção', 'Nenhum jogo válido gerado. Ajuste os filtros da fórmula.');
      }
    } catch (e) {
      console.error('Erro ao gerar jogos:', e);
      Alert.alert('Erro', 'Falha ao gerar jogos');
    } finally {
      setGerando(false);
    }
  };
  
  const handleConferir = async (jogo: any) => {
    if (!ultimoConcurso) {
      Alert.alert('Aviso', 'Aguardando resultado do último concurso...');
      return;
    }
    
    if (jogo.conferido) {
      Alert.alert('Já Conferido', `Este jogo já foi conferido: ${getLabelAcertos(jogo.acertos || 0)}`);
      return;
    }
    
    const { acertos, premio } = Analysis.conferirJogo(jogo.dezenas, ultimoConcurso.dezenas);
    
    await conferir(jogo.id, ultimoConcurso.dezenas);
    
    setMostrarConferencia({ jogo: { ...jogo, acertos, premio }, resultado: ultimoConcurso.dezenas });
    vibrar(acertos >= 11 ? 'success' : 'light');
    
    if (acertos >= 11) {
      falar(`Parabéns! Você fez ${acertos} pontos! Prêmio estimado: ${formatarMoeda(premio)}`);
    }
  };
  
  const handleCompartilhar = (jogo: any) => {
    const texto = gerarTextoCompartilhamento(jogo.dezenas, concursoAlvo, formulaAtiva?.nome);
    // Aqui integraria com Share API do React Native
    Alert.alert('Compartilhar', texto, [{ text: 'Copiar', onPress: () => {} }, { text: 'Cancelar' }]);
  };
  
  const renderJogo = (jogo: any, index: number) => {
    const { pares, impares } = Analysis.calcularParesImpares(jogo.dezenas);
    const soma = Analysis.calcularSoma(jogo.dezenas);
    
    return (
      <Card key={jogo.id} style={{ marginBottom: 10 }}>
        <Linha alinhamento="space-between" style={{ marginBottom: 10 }}>
          <Linha alinhamento="center" style={{ gap: 8 }}>
            <Badge variant={jogo.conferido ? 'success' : 'info'} tamanho="pequeno">
              Jogo #{index + 1}
            </Badge>
            {jogo.conferido && (
              <Badge 
                variant={jogo.acertos && jogo.acertos >= 11 ? 'success' : 'default'} 
                tamanho="pequeno"
                style={{ backgroundColor: jogo.acertos && jogo.acertos >= 11 ? '#E8F5E9' : '#FFF3E0' }}
              >
                {getLabelAcertos(jogo.acertos || 0)}
              </Badge>
            )}
          </Linha>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Botao variant="outline" tamanho="pequeno" onPress={() => handleConferir(jogo)} desabilitado={jogo.conferido || !ultimoConcurso}>
              {jogo.conferido ? 'Conferido' : 'Conferir'}
            </Botao>
            <Botao variant="outline" tamanho="pequeno" onPress={() => handleCompartilhar(jogo)} iconeEsquerda={<Icones.Compartilhar size={16} />}>
              Compartilhar
            </Botao>
          </View>
        </Linha>
        
        {/* Dezenas do jogo */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
          {jogo.dezenas.map((dezena: number, i: number) => (
            <Icones.Numero 
              key={i} 
              numero={dezena} 
              size={32} 
              status={jogo.conferido && ultimoConcurso?.dezenas.includes(dezena) ? 'quente' : undefined}
            />
          ))}
        </View>
        
        {/* Info do jogo */}
        <Linha alinhamento="space-around" style={{ paddingTop: 8, borderTopWidth: 1, borderColor: '#eee' }}>
          <Coluna alinhamento="center">
            <Texto tamanho="xs" cor="#888">Pares/Ímpares</Texto>
            <Texto peso="bold">{pares}P / {impares}I</Texto>
          </Coluna>
          <Coluna alinhamento="center">
            <Texto tamanho="xs" cor="#888">Soma</Texto>
            <Texto peso="bold">{soma}</Texto>
          </Coluna>
          <Coluna alinhamento="center">
            <Texto tamanho="xs" cor="#888">Linhas</Texto>
            <Texto peso="bold">{Analysis.agruparPorLinha(jogo.dezenas).filter(l => l.length > 0).length}/5</Texto>
          </Coluna>
          <Coluna alinhamento="center">
            <Texto tamanho="xs" cor="#888">Colunas</Texto>
            <Texto peso="bold">{Analysis.agruparPorColuna(jogo.dezenas).filter(c => c.length > 0).length}/5</Texto>
          </Coluna>
        </Linha>
        
        {jogo.conferido && jogo.premio && (
          <View style={{ marginTop: 8, padding: 8, backgroundColor: '#E8F5E9', borderRadius: 8 }}>
            <Linha alinhamento="center" style={{ gap: 8 }}>
              <Icones.Premio size={20} />
              <Texto peso="bold" cor="#2E7D32">
                Prêmio estimado: {formatarMoeda(jogo.premio)}
              </Texto>
            </Linha>
          </View>
        )}
      </Card>
    );
  };
  
  if (carregando && jogos.length === 0) {
    return (
      <SafeArea>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Icones.Jogos size={60} color={cores.primario} />
          <Texto tamanho="lg" peso="medium" style={{ marginTop: 16 }}>
            Carregando seus jogos...
          </Texto>
        </View>
      </SafeArea>
    );
  }
  
  return (
    <SafeArea>
      <Scroll contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}>
        {/* Cabeçalho */}
        <Linha alinhamento="space-between" style={{ marginBottom: 16 }}>
          <View>
            <Titulo nivel={2}>Meus Jogos</Titulo>
            <Subtitulo>Concurso alvo: {concursoAlvo} • {jogos.length} jogo{jogos.length !== 1 ? 's' : ''} gerado{jogos.length !== 1 ? 's' : ''}</Subtitle>
          </View>
          <Botao 
            variant="outline" 
            tamanho="pequeno" 
            onPress={() => { verificarNovos(); carregarPorConcurso(concursoAlvo); }}
            iconeEsquerda={<Icones.Atualizar size={18} />}
          >
            Atualizar
          </Botao>
        </Linha>
        
        {/* Painel de Geração */}
        {!formulaAtiva ? (
          <Card style={{ marginBottom: 16, padding: 20, alignItems: 'center', backgroundColor: '#FFF3E0' }}>
            <Icones.Alerta size={48} color="#F57F17" />
            <Texto tamanho="lg" peso="bold" style={{ marginTop: 12, textAlign: 'center' }}>
              Nenhuma Fórmula Ativa
            </Texto>
            <Texto tamanho="md" cor="#666" style={{ marginTop: 8, textAlign: 'center' }}>
              Vá em "Minhas Fórmulas" e crie/ative uma para gerar jogos
            </Texto>
            <Botao variant="primario" tamanho="medio" style={{ marginTop: 16, minWidth: 200 }} onPress={() => {}}>
              Ir para Fórmulas
            </Botao>
          </Card>
        ) : (
          <Card style={{ marginBottom: 16 }}>
            <Titulo nivel={3} style={{ marginBottom: 12 }}>Gerar Novos Jogos</Titulo>
            
            <Linha alinhamento="space-between" style={{ marginBottom: 12 }}>
              <View>
                <Texto tamanho="sm" cor="#666">Fórmula Ativa</Texto>
                <Texto peso="bold">{formulaAtiva.nome}</Texto>
              </View>
              {formulaAtiva.ativa && <Badge variant="success" tamanho="pequeno">Ativa</Badge>}
            </Linha>
            
            {/* Seleção de fechamento */}
            <Texto tamanho="sm" cor="#666" style={{ marginBottom: 8 }}>Tipo de Fechamento</Texto>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {FECHAMENTOS_PREDEFINIDOS.map(f => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => { setTipoFechamento(f.id); vibrar('light'); }}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: tipoFechamento === f.id ? cores.primario : cores.borda,
                    backgroundColor: tipoFechamento === f.id ? `${cores.primario}20` : cores.superficieVariante,
                    minWidth: 140,
                    flex: 1,
                  }}
                >
                  <Texto tamanho="xs" peso="bold" cor={tipoFechamento === f.id ? cores.primario : cores.texto}>
                    {f.nome}
                  </Texto>
                  <Texto tamanho="xs" cor="#888" style={{ marginTop: 2 }}>
                    {f.quantidadeJogos} jogos • {f.garantia}
                  </Texto>
                  <Texto tamanho="xs" cor="#666" style={{ marginTop: 2 }}>
                    Custo: {formatarMoeda(f.quantidadeJogos * f.custoPorJogo)}
                  </Texto>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Quantidade de jogos (para fechamentos que permitem múltiplos) */}
            <Linha alinhamento="center" style={{ gap: 16, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Texto tamanho="sm" cor="#666">Quantidade de Jogos</Texto>
                <Linha alinhamento="center" style={{ gap: 10, marginTop: 4 }}>
                  <Botao variant="outline" tamanho="medio" onPress={() => setQtdJogos(Math.max(1, qtdJogos - 1))}>-</Botao>
                  <Texto tamanho="xl" peso="bold" style={{ minWidth: 50, textAlign: 'center' }}>{qtdJogos}</Texto>
                  <Botao variant="primario" tamanho="medio" onPress={() => setQtdJogos(qtdJogos + 1)}>+</Botao>
                </Linha>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Texto tamanho="sm" cor="#666">Custo Estimado</Texto>
                <Texto tamanho="xl" peso="bold" cor={cores.primario}>{formatarMoeda(custoTotal)}</Texto>
              </View>
            </Linha>
            
            <Botao 
              variant="primario" 
              tamanho="grande" 
              larguraTotal
              onPress={handleGerarJogos}
              desabilitado={gerando}
              carregando={gerando}
              iconeEsquerda={<Icones.Jogos size={22} />}
            >
              {gerando ? 'Gerando...' : `Gerar ${qtdJogos} Jogo${qtdJogos > 1 ? 's' : ''}`}
            </Botao>
          </Card>
        )}
        
        {/* Último resultado para conferência */}
        {ultimoConcurso && (
          <Card style={{ marginBottom: 16, backgroundColor: '#E8F5E9' }}>
            <Linha alinhamento="space-between" style={{ marginBottom: 10 }}>
              <Linha alinhamento="center" style={{ gap: 8 }}>
                <Icones.Verificado size={22} color="#2E7D32" />
                <Texto tamanho="md" peso="bold" cor="#2E7D32">Último Resultado Disponível</Texto>
              </Linha>
              <Badge variant="info">Concurso {ultimoConcurso.numero}</Badge>
            </Linha>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
              {ultimoConcurso.dezenas.map((d, i) => (
                <Icones.Numero key={i} numero={d} size={32} />
              ))}
            </View>
            <Texto tamanho="xs" cor="#666" alinhamento="center">
              Data: {formatarData(ultimoConcurso.data)} • {ultimoConcurso.premiacoes.find(p => p.faixa === 15)?.ganhadores || 0} ganhador(es) 15 pts
            </Texto>
          </Card>
        )}
        
        {/* Lista de jogos */}
        <Linha alinhamento="space-between" style={{ marginBottom: 12 }}>
          <Titulo nivel={3}>Jogos Gerados</Titulo>
          {jogos.length > 0 && (
            <Botao variant="outline" tamanho="pequeno" onPress={carregarTodos}>
              Ver Todos
            </Botao>
          )}
        </Linha>
        
        {jogos.length === 0 ? (
          <Card style={{ padding: 30, alignItems: 'center' }}>
            <Icones.Jogos size={64} color="#ccc" />
            <Texto tamanho="lg" peso="medium" style={{ marginTop: 16, textAlign: 'center' }}>
              Nenhum jogo gerado ainda
            </Texto>
            <Texto tamanho="md" cor="#888" style={{ marginTop: 8, textAlign: 'center' }}>
              Configure sua fórmula e gere seus primeiros jogos
            </Texto>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {jogos.slice(0, 20).map((jogo, index) => renderJogo(jogo, index))}
            {jogos.length > 20 && (
              <Card style={{ alignItems: 'center', padding: 16 }}>
                <Texto tamanho="sm" cor="#666">E mais {jogos.length - 20} jogo{jogos.length - 20 > 1 ? 's' : ''}...</Texto>
                <Botao variant="outline" tamanho="pequeno" style={{ marginTop: 8, minWidth: 150 }} onPress={carregarTodos}>
                  Carregar Todos
                </Botao>
              </Card>
            )}
          </View>
        )}
        
        <View style={{ marginTop: 30, paddingVertical: 20, alignItems: 'center' }}>
          <Texto tamanho="xs" cor="#999" alinhamento="center">
            Jogue com responsabilidade • Proibido para menores de 18 anos
          </Texto>
        </View>
      </Scroll>
      
      {/* Modal de Conferência */}
      {mostrarConferencia && (
        <Modal visible={true} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ margin: 20, borderRadius: 16, backgroundColor: '#fff', padding: 24 }}>
              <Linha alinhamento="space-between" style={{ marginBottom: 16 }}>
                <Titulo nivel={3}>Resultado da Conferência</Titulo>
                <Botao variant="outline" tamanho="pequeno" onPress={() => setMostrarConferencia(null)}>
                  <Icones.Fechar size={20} />
                </Botao>
              </Linha>
              
              <View style={{ alignItems: 'center', gap: 12 }}>
                <Texto tamanho="sm" cor="#666">Seu Jogo</Texto>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  {mostrarConferencia.jogo.dezenas.map((d: number, i: number) => (
                    <Icones.Numero 
                      key={i} 
                      numero={d} 
                      size={36} 
                      status={mostrarConferencia.resultado.includes(d) ? 'quente' : undefined}
                    />
                  ))}
                </View>
                
                <Texto tamanho="sm" cor="#666" style={{ marginTop: 16 }}>Resultado Oficial</Texto>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  {mostrarConferencia.resultado.map((d: number, i: number) => (
                    <Icones.Numero key={i} numero={d} size={36} />
                  ))}
                </View>
                
                <View style={{ marginTop: 20, padding: 16, borderRadius: 12, backgroundColor: '#E8F5E9' }}>
                  <Texto tamanho="xl" peso="bold" cor={getCorAcertos(mostrarConferencia.jogo.acertos || 0)} alinhamento="center">
                    {getLabelAcertos(mostrarConferencia.jogo.acertos || 0)}
                  </Texto>
                  {mostrarConferencia.jogo.premio && (
                    <Texto tamanho="lg" peso="bold" cor="#2E7D32" alinhamento="center" style={{ marginTop: 4 }}>
                      Prêmio: {formatarMoeda(mostrarConferencia.jogo.premio)}
                    </Texto>
                  )}
                </View>
              </View>
              
              <Botao variant="primario" larguraTotal tamanho="grande" style={{ marginTop: 16 }} onPress={() => setMostrarConferencia(null)}>
                Fechar
              </Botao>
            </View>
          </View>
        </Modal>
      )}
    </SafeArea>
  );
}

import { TEMA_CORES } from '@/constants';