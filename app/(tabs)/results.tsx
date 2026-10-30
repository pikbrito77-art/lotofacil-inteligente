// Tela de Resultados e Conferência
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Modal, Platform } from 'react-native';
import { useConcursos } from '@/hooks';
import { useJogos } from '@/hooks';
import { useTema } from '@/hooks';
import { 
  Box, Texto, Titulo, Subtitulo, Botao, Card, Badge, Separador, Linha, Coluna, Icones, Input, SafeArea, Scroll 
} from '@/components/ui';
import { formatarData, formatarMoeda, getCorAcertos, getLabelAcertos } from '@/utils';
import * as Analysis from '@/services/analysis';

export default function ResultsScreen() {
  const { concursos, ultimoConcurso, carregando: carregandoConcursos, verificarNovos } = useConcursos();
  const { jogos, carregarPorConcurso, conferir } = useJogos();
  const { tema, falar, vibrar } = useTema();
  const cores = TEMA_CORES[tema];
  
  const [concursoSelecionado, setConcursoSelecionado] = useState<number | null>(ultimoConcurso?.numero || null);
  const [jogosConcurso, setJogosConcurso] = useState<any[]>([]);
  const [mostrarDetalhes, setMostrarDetalhes] = useState<{ jogo: any; resultado: number[] } | null>(null);
  
  // Carrega jogos do concurso selecionado
  useEffect(() => {
    if (concursoSelecionado) {
      carregarPorConcurso(concursoSelecionado).then(j => setJogosConcurso(j));
    }
  }, [concursoSelecionado, carregarPorConcurso]);
  
  // Verifica novos ao abrir
  useEffect(() => {
    verificarNovos();
  }, [verificarNovos]);
  
  const handleConferirTodos = async () => {
    if (!concursoSelecionado) return;
    const concurso = concursos.find(c => c.numero === concursoSelecionado);
    if (!concurso) return;
    
    let conferidos = 0;
    let premiados = 0;
    
    for (const jogo of jogosConcurso) {
      if (!jogo.conferido) {
        const { acertos, premio } = Analysis.conferirJogo(jogo.dezenas, concurso.dezenas);
        await conferir(jogo.id, acertos, premio);
        conferidos++;
        if (acertos >= 11) premiados++;
      }
    }
    
    // Recarrega
    const atualizados = await carregarPorConcurso(concursoSelecionado!);
    setJogosConcurso(atualizados);
    
    vibrar(premiados > 0 ? 'success' : 'light');
    if (premiados > 0) {
      falar(`Parabéns! ${premiados} jogo${premiados > 1 ? 's' : ''} premiado${premiados > 1 ? 's' : ''}!`);
    }
    
    Alert.alert(
      'Conferência Concluída',
      `${conferidos} jogo${conferidos > 1 ? 's' : ''} conferido${conferidos > 1 ? 's' : ''}.\n${premiados > 0 ? `🎉 ${premiados} premiado${premiados > 1 ? 's' : ''}!` : 'Nenhum prêmio desta vez.'}`
    );
  };
  
  const handleConferirJogo = async (jogo: any) => {
    const concurso = concursos.find(c => c.numero === concursoSelecionado);
    if (!concurso) return;
    
    if (jogo.conferido) {
      Alert.alert('Já Conferido', `${getLabelAcertos(jogo.acertos || 0)} • Prêmio: ${formatarMoeda(jogo.premio || 0)}`);
      return;
    }
    
    const { acertos, premio } = Analysis.conferirJogo(jogo.dezenas, concurso.dezenas);
    await conferir(jogo.id, acertos, premio);
    
    const atualizados = await carregarPorConcurso(concursoSelecionado!);
    setJogosConcurso(atualizados);
    
    setMostrarDetalhes({ jogo: { ...jogo, acertos, premio }, resultado: concurso.dezenas });
    vibrar(acertos >= 11 ? 'success' : 'light');
    
    if (acertos >= 11) {
      falar(`Parabéns! ${acertos} pontos! Prêmio: ${formatarMoeda(premio)}`);
    }
  };
  
  if (carregandoConcursos && concursos.length === 0) {
    return (
      <SafeArea>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Icones.Sincronizar size={60} color={cores.primario} />
          <Texto tamanho="lg" peso="medium" style={{ marginTop: 16 }}>
            Carregando resultados...
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
            <Titulo nivel={2}>Resultados & Conferência</Titulo>
            <Subtitulo>Confira seus jogos contra os resultados oficiais</Subtitle>
          </View>
          <Botao variant="outline" tamanho="pequeno" onPress={verificarNovos} iconeEsquerda={<Icones.Atualizar size={18} />}>
            Atualizar
          </Botao>
        </Linha>
        
        {/* Seletor de Concurso */}
        <Card style={{ marginBottom: 16 }}>
          <Texto tamanho="sm" cor="#666" style={{ marginBottom: 8 }}>Selecionar Concurso</Texto>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {concursos.slice(0, 20).map(c => (
              <TouchableOpacity
                key={c.numero}
                onPress={() => { setConcursoSelecionado(c.numero); vibrar('light'); }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: concursoSelecionado === c.numero ? cores.primario : cores.borda,
                  backgroundColor: concursoSelecionado === c.numero ? `${cores.primario}20` : cores.superficieVariante,
                }}
              >
                <Linha alinhamento="center" style={{ gap: 6 }}>
                  <Texto peso="bold" cor={concursoSelecionado === c.numero ? cores.primario : cores.texto}>
                    #{c.numero}
                  </Texto>
                  <Texto tamanho="xs" cor={concursoSelecionado === c.numero ? cores.primario : '#888'}>
                    {formatarData(c.data).split('/').slice(0,2).join('/')}
                  </Texto>
                </Linha>
              </TouchableOpacity>
            ))}
            {concursos.length > 20 && (
              <TouchableOpacity
                onPress={() => Alert.alert('Histórico Completo', 'Use a tela de Histórico para ver todos os concursos')}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: cores.borda,
                  backgroundColor: cores.superficieVariante,
                }}
              >
                <Linha alinhamento="center" style={{ gap: 6 }}>
                  <Icones.Historico size={18} color={cores.primario} />
                  <Texto tamanho="sm" cor={cores.primario}>Ver mais ({concursos.length})</Texto>
                </Linha>
              </TouchableOpacity>
            )}
          </View>
        </Card>
        
        {/* Resultado do Concurso Selecionado */}
        {concursoSelecionado && (
          <>
            {(() => {
              const concurso = concursos.find(c => c.numero === concursoSelecionado);
              if (!concurso) return null;
              
              return (
                <Card style={{ marginBottom: 16, backgroundColor: '#E8F5E9' }}>
                  <Linha alinhamento="space-between" style={{ marginBottom: 12 }}>
                    <Linha alinhamento="center" style={{ gap: 8 }}>
                      <Icones.Calendario size={22} color="#2E7D32" />
                      <Titulo nivel={3}>Concurso {concurso.numero}</Titulo>
                    </Linha>
                    <Badge variant="info">{formatarData(concurso.data)}</Badge>
                  </Linha>
                  
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                    {concurso.dezenas.map((d, i) => (
                      <Icones.Numero key={i} numero={d} size={40} />
                    ))}
                  </View>
                  
                  <Separador />
                  
                  <Texto tamanho="sm" peso="medium" style={{ marginBottom: 8 }}>Premiação</Texto>
                  <View style={{ gap: 6 }}>
                    {concurso.premiacoes
                      .filter(p => p.faixa >= 11)
                      .sort((a, b) => b.faixa - a.faixa)
                      .map(p => (
                        <Linha key={p.faixa} alinhamento="space-between" style={{ paddingVertical: 4 }}>
                          <Linha alinhamento="center" style={{ gap: 8 }}>
                            <Badge variant={p.faixa === 15 ? 'success' : p.faixa >= 13 ? 'warning' : 'info'} tamanho="pequeno">
                              {p.faixa} Pontos
                            </Badge>
                            <Texto tamanho="sm">{p.ganhadores} ganhador{p.ganhadores !== 1 ? 'es' : ''}</Texto>
                          </Linha>
                          <Texto peso="bold" cor={p.faixa === 15 ? '#2E7D32' : cores.texto}>
                            {formatarMoeda(p.valor)}
                          </Texto>
                        </Linha>
                      ))}
                  </View>
                  
                  {concurso.acumulou && (
                    <View style={{ marginTop: 12, padding: 10, backgroundColor: '#FFF3E0', borderRadius: 8 }}>
                      <Linha alinhamento="center" style={{ gap: 8 }}>
                        <Icones.Fogo size={20} color="#F57F17" />
                        <Texto peso="bold" cor="#E65100">
                          ACUMULOU! Próximo: {formatarMoeda(concurso.valorEstimadoProx || 0)}
                        </Texto>
                      </Linha>
                    </View>
                  )}
                </Card>
              );
            })()}
            
            {/* Jogos do Concurso */}
            <Linha alinhamento="space-between" style={{ marginBottom: 12 }}>
              <Titulo nivel={3}>Meus Jogos neste Concurso</Titulo>
              {jogosConcurso.length > 0 && (
                <Botao variant="primario" tamanho="pequeno" onPress={handleConferirTodos} iconeEsquerda={<Icones.Verificado size={16} />}>
                  Conferir Todos ({jogosConcurso.filter(j => !j.conferido).length})
                </Botao>
              )}
            </Linha>
            
            {jogosConcurso.length === 0 ? (
              <Card style={{ padding: 30, alignItems: 'center' }}>
                <Icones.Jogos size={64} color="#ccc" />
                <Texto tamanho="lg" peso="medium" style={{ marginTop: 16, textAlign: 'center' }}>
                  Nenhum jogo para este concurso
                </Texto>
                <Texto tamanho="md" cor="#888" style={{ marginTop: 8, textAlign: 'center' }}>
                  Gere jogos na aba "Meus Jogos" para este concurso
                </Texto>
              </Card>
            ) : (
              <View style={{ gap: 10 }}>
                {jogosConcurso.map((jogo, index) => (
                  <Card key={jogo.id} style={{ marginBottom: 10 }}>
                    <Linha alinhamento="space-between" style={{ marginBottom: 8 }}>
                      <Linha alinhamento="center" style={{ gap: 8 }}>
                        <Badge variant={jogo.conferido ? 'success' : 'info'} tamanho="pequeno">
                          Jogo #{index + 1}
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
                      <Botao 
                        variant={jogo.conferido ? 'outline' : 'primario'} 
                        tamanho="pequeno" 
                        onPress={() => handleConferirJogo(jogo)}
                        desabilitado={jogo.conferido}
                        style={{ minWidth: 100 }}
                      >
                        {jogo.conferido ? 'Conferido' : 'Conferir'}
                      </Botao>
                    </Linha>
                    
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginBottom: 8 }}>
                      {jogo.dezenas.map((d: number, i: number) => (
                        <Icones.Numero 
                          key={i} 
                          numero={d} 
                          size={28} 
                          status={jogo.conferido && concursoSelecionado && concursos.find(c => c.numero === concursoSelecionado)?.dezenas.includes(d) ? 'quente' : undefined}
                        />
                      ))}
                    </View>
                    
                    {jogo.conferido && (
                      <Linha alinhamento="space-around" style={{ paddingTop: 8, borderTopWidth: 1, borderColor: '#eee' }}>
                        <Coluna alinhamento="center">
                          <Texto tamanho="xs" cor="#888">Acertos</Texto>
                          <Texto tamanho="lg" peso="bold" cor={getCorAcertos(jogo.acertos || 0)}>
                            {jogo.acertos}
                          </Texto>
                        </Coluna>
                        <Coluna alinhamento="center">
                          <Texto tamanho="xs" cor="#888">Soma</Texto>
                          <Texto tamanho="lg" peso="bold">{Analysis.calcularSoma(jogo.dezenas)}</Texto>
                        </Coluna>
                        <Coluna alinhamento="center">
                          <Texto tamanho="xs" cor="#888">Pares/Ímpares</Texto>
                          <Texto tamanho="lg" peso="bold">
                            {Analysis.calcularParesImpares(jogo.dezenas).pares}P/{Analysis.calcularParesImpares(jogo.dezenas).impares}I
                          </Texto>
                        </Coluna>
                        {jogo.premio && (
                          <Coluna alinhamento="center">
                            <Texto tamanho="xs" cor="#888">Prêmio</Texto>
                            <Texto tamanho="lg" peso="bold" cor="#2E7D32">{formatarMoeda(jogo.premio)}</Texto>
                          </Coluna>
                        )}
                      </Linha>
                    )}
                  </Card>
                ))}
              </View>
            )}
            
            {/* Modal de Detalhes */}
            {mostrarDetalhes && (
              <Modal visible={true} animationType="slide" transparent>
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <View style={{ margin: 20, borderRadius: 16, backgroundColor: '#fff', padding: 24 }}>
                    <Titulo nivel={3} alinhamento="center" style={{ marginBottom: 16 }}>Detalhes da Conferência</Titulo>
                    
                    <View style={{ alignItems: 'center', gap: 12 }}>
                      <Texto tamanho="sm" cor="#666">Seu Jogo</Texto>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                        {mostrarDetalhes.jogo.dezenas.map((d: number, i: number) => (
                          <Icones.Numero key={i} numero={d} size={36} status={mostrarDetalhes.resultado.includes(d) ? 'quente' : undefined} />
                        ))}
                      </View>
                      
                      <Texto tamanho="sm" cor="#666" style={{ marginTop: 16 }}>Resultado Oficial</Texto>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                        {mostrarDetalhes.resultado.map((d: number, i: number) => (
                          <Icones.Numero key={i} numero={d} size={36} />
                        ))}
                      </View>
                      
                      <View style={{ marginTop: 20, padding: 16, borderRadius: 12, backgroundColor: '#E8F5E9' }}>
                        <Texto tamanho="xl" peso="bold" cor={getCorAcertos(mostrarDetalhes.jogo.acertos || 0)} alinhamento="center">
                          {getLabelAcertos(mostrarDetalhes.jogo.acertos || 0)}
                        </Texto>
                        {mostrarDetalhes.jogo.premio && (
                          <Texto tamanho="lg" peso="bold" cor="#2E7D32" alinhamento="center" style={{ marginTop: 4 }}>
                            Prêmio: {formatarMoeda(mostrarDetalhes.jogo.premio)}
                          </Texto>
                        )}
                      </View>
                    </View>
                    
                    <Botao variant="primario" larguraTotal tamanho="grande" style={{ marginTop: 16 }} onPress={() => setMostrarDetalhes(null)}>
                      Fechar
                    </Botao>
                  </View>
                </View>
              </Modal>
            )}
          </>
        )}
      </Scroll>
    </SafeArea>
  );
}

import { TEMA_CORES } from '@/constants';