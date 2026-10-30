// Tela de Análise Estatística
import React, { useMemo } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useConcursos } from '@/hooks';
import { useAnalise } from '@/hooks';
import { useTema } from '@/hooks';
import { 
  Box, Texto, Titulo, Subtitulo, Botao, Card, Badge, Separador, Linha, Coluna, Icones, SafeArea, Scroll 
} from '@/components/ui';
import { formatarMoeda } from '@/utils';
import { LINHAS_VOLANTE, COLUNAS_VOLANTE, CORES_DEZENAS } from '@/constants';

export default function AnalysisScreen() {
  const { concursos, sincronizar, carregando: carregandoConcursos } = useConcursos();
  const { 
    analise, 
    carregando, 
    quentes, 
    frias, 
    mornas, 
    frequencias, 
    paresImpares, 
    somaTotal, 
    repeticoes 
  } = useAnalise(concursos);
  const { tema, falar, vibrar } = useTema();
  const cores = TEMA_CORES[tema];
  
  if (carregandoConcursos && concursos.length === 0) {
    return (
      <SafeArea>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Icones.Sincronizar size={60} color={cores.primario} />
          <Texto tamanho="lg" peso="medium" style={{ marginTop: 16 }}>
            Carregando dados para análise...
          </Texto>
        </View>
      </SafeArea>
    );
  }
  
  if (carregando || !analise) {
    return (
      <SafeArea>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Icones.Grafico size={60} color={cores.primario} />
          <Texto tamanho="lg" peso="medium" style={{ marginTop: 16 }}>
            Gerando análise estatística...
          </Texto>
          <Texto tamanho="sm" cor="#888" style={{ marginTop: 8 }}>
            Processando {analise?.totalConcursosAnalisados || 12} últimos concursos
          </Texto>
        </View>
      </SafeArea>
    );
  }
  
  const falarResumo = () => {
    const texto = `Análise baseada em ${analise.totalConcursosAnalisados} concursos. 
      ${quentes.length} dezenas quentes, ${frias.length} frias, ${mornas.length} mornos. 
      Recomendação: ${paresImpares?.recomendacao.pares} pares e ${paresImpares?.recomendacao.impares} ímpares. 
      Soma ideal entre ${somaTotal?.recomendacao.min} e ${somaTotal?.recomendacao.max}.`;
    falar(texto);
    vibrar('success');
  };
  
  return (
    <SafeArea>
      <Scroll contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}>
        {/* Cabeçalho */}
        <Linha alinhamento="space-between" style={{ marginBottom: 16 }}>
          <View>
            <Titulo nivel={2}>Análise Estatística</Titulo>
            <Subtitulo>Baseada nos {analise.totalConcursosAnalisados} últimos concursos</Subtitulo>
          </View>
          <Box style={{ flexDirection: 'row', gap: 8 }}>
            <Botao 
              variant="outline" 
              tamanho="pequeno" 
              onPress={() => sincronizar(20)}
              iconeEsquerda={<Icones.Atualizar size={18} />}
            >
              Atualizar
            </Botao>
            <Botao 
              variant="secundario" 
              tamanho="pequeno" 
              onPress={falarResumo}
              iconeEsquerda={<Icones.Voz size={18} />}
            >
              Ouvir Resumo
            </Botao>
          </Box>
        </Linha>
        
        {/* Cards de resumo */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <Card style={{ flex: 1, minWidth: '45%', padding: 14 }}>
            <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
              <Icones.Fogo size={22} color="#C62828" />
              <Texto tamanho="md" peso="bold" cor="#C62828">Quentes</Texto>
            </Linha>
            <Texto tamanho="xl" peso="bold" cor="#C62828" alinhamento="center" style={{ marginTop: 4 }}>
              {quentes.length}
            </Texto>
            <Texto tamanho="xs" cor="#888" alinhamento="center">
              Acima da média esperada
            </Texto>
          </Card>
          
          <Card style={{ flex: 1, minWidth: '45%', padding: 14 }}>
            <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
              <Icones.Neve size={22} color="#1565C0" />
              <Texto tamanho="md" peso="bold" cor="#1565C0">Frias</Texto>
            </Linha>
            <Texto tamanho="xl" peso="bold" cor="#1565C0" alinhamento="center" style={{ marginTop: 4 }}>
              {frias.length}
            </Texto>
            <Texto tamanho="xs" cor="#888" alinhamento="center">
              Atrasadas / Baixa frequência
            </Texto>
          </Card>
          
          <Card style={{ flex: 1, minWidth: '45%', padding: 14 }}>
            <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
              <Icones.Coracao size={22} color="#E91E63" />
              <Texto tamanho="md" peso="bold" cor="#E91E63">Pares/Ímpares</Texto>
            </Linha>
            <Texto tamanho="xl" peso="bold" cor="#E91E63" alinhamento="center" style={{ marginTop: 4 }}>
              {paresImpares?.recomendacao.pares}P / {paresImpares?.recomendacao.impares}I
            </Texto>
            <Texto tamanho="xs" cor="#888" alinhamento="center">
              Combinação mais frequente
            </Texto>
          </Card>
          
          <Card style={{ flex: 1, minWidth: '45%', padding: 14 }}>
            <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
              <Icones.Dinheiro size={22} color="#2E7D32" />
              <Texto tamanho="md" peso="bold" cor="#2E7D32">Soma Ideal</Texto>
            </Linha>
            <Texto tamanho="xl" peso="bold" cor="#2E7D32" alinhamento="center" style={{ marginTop: 4 }}>
              {somaTotal?.recomendacao.min} - {somaTotal?.recomendacao.max}
            </Texto>
            <Texto tamanho="xs" cor="#888" alinhamento="center">
              Média: {somaTotal?.media}
            </Texto>
          </Card>
        </View>
        
        {/* Dezenas Quentes */}
        {quentes.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Linha alinhamento="space-between" style={{ marginBottom: 12 }}>
              <Linha alinhamento="center" style={{ gap: 8 }}>
                <Icones.Fogo size={24} color="#C62828" />
                <Titulo nivel={3}>Dezenas Quentes ({quentes.length})</Titulo>
              </Linha>
              <Badge variant="success" tamanho="pequeno">Alta frequência</Badge>
            </Linha>
            <Texto tamanho="xs" cor="#888" style={{ marginBottom: 10 }}>
              Saíram mais que a média nos últimos {analise.totalConcursosAnalisados} concursos
            </Texto>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {quentes.map(f => (
                <View key={f.dezena} style={{ alignItems: 'center', minWidth: 50 }}>
                  <Icones.Numero 
                    numero={f.dezena} 
                    size={44} 
                    status="quente"
                  />
                  <Texto tamanho="xs" peso="bold" cor="#C62828" style={{ marginTop: 2 }}>
                    {f.frequencia}x
                  </Texto>
                  <Texto tamanho="xs" cor="#888">
                    {f.percentual}%
                  </Texto>
                </View>
              ))}
            </View>
          </Card>
        )}
        
        {/* Dezenas Frias */}
        {frias.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Linha alinhamento="space-between" style={{ marginBottom: 12 }}>
              <Linha alinhamento="center" style={{ gap: 8 }}>
                <Icones.Neve size={24} color="#1565C0" />
                <Titulo nivel={3}>Dezenas Frias / Atrasadas ({frias.length})</Titulo>
              </Linha>
              <Badge variant="info" tamanho="pequeno">Atraso ≥ 5 ou baixa freq.</Badge>
            </Linha>
            <Texto tamanho="xs" cor="#888" style={{ marginBottom: 10 }}>
              Não saem há vários concursos ou frequência abaixo da média
            </Texto>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {frias.map(f => (
                <View key={f.dezena} style={{ alignItems: 'center', minWidth: 50 }}>
                  <Icones.Numero 
                    numero={f.dezena} 
                    size={44} 
                    status="fria"
                  />
                  <Texto tamanho="xs" peso="bold" cor="#1565C0" style={{ marginTop: 2 }}>
                    Atraso: {f.atraso}
                  </Texto>
                  <Texto tamanho="xs" cor="#888">
                    {f.frequencia}x ({f.percentual}%)
                  </Texto>
                </View>
              ))}
            </View>
          </Card>
        )}
        
        {/* Dezenas Mornas */}
        {mornas.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Linha alinhamento="space-between" style={{ marginBottom: 12 }}>
              <Linha alinhamento="center" style={{ gap: 8 }}>
                <Icones.Estrella size={24} color="#F57F17" />
                <Titulo nivel={3}>Dezenas Mornas ({mornas.length})</Titulo>
              </Linha>
              <Badge variant="warning" tamanho="pequeno">Frequência na média</Badge>
            </Linha>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {mornas.map(f => (
                <Icones.Numero 
                  key={f.dezena} 
                  numero={f.dezena} 
                  size={36} 
                  status="morna"
                />
              ))}
            </View>
          </Card>
        )}
        
        {/* Pares/Ímpares Detalhado */}
        {paresImpares && (
          <Card style={{ marginBottom: 16 }}>
            <Titulo nivel={3} style={{ marginBottom: 12 }}>
              <Linha alinhamento="center" style={{ gap: 8 }}>
                <Icones.Coracao size={22} color="#E91E63" />
                <Texto>Distribuição Pares/Ímpares</Texto>
              </Linha>
            </Titulo>
            <Texto tamanho="xs" cor="#888" style={{ marginBottom: 10 }}>
              Média: {paresImpares.mediaPares} pares / {paresImpares.mediaImpares} ímpares por concurso
            </Texto>
            <View style={{ gap: 6 }}>
              {paresImpares.distribuicao.slice(0, 5).map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                  <View style={{ width: 80, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Texto tamanho="sm" peso="medium">{item.pares}P / {item.impares}I</Texto>
                    <Texto tamanho="sm" cor="#666">{item.count}x</Texto>
                  </View>
                  <View style={{ flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, marginHorizontal: 10 }}>
                    <View 
                      style={{ 
                        width: `${(item.count / analise.totalConcursosAnalisados) * 100}%`, 
                        height: '100%', 
                        backgroundColor: '#E91E63', 
                        borderRadius: 4 
                      }} 
                    />
                  </View>
                  <Texto tamanho="xs" peso="bold" cor="#E91E63" style={{ width: 40, textAlign: 'right' }}>
                    {item.percentual}%
                  </Texto>
                </View>
              ))}
            </View>
          </Card>
        )}
        
        {/* Soma Total */}
        {somaTotal && (
          <Card style={{ marginBottom: 16 }}>
            <Titulo nivel={3} style={{ marginBottom: 12 }}>
              <Linha alinhamento="center" style={{ gap: 8 }}>
                <Icones.Dinheiro size={22} color="#2E7D32" />
                <Texto>Análise de Soma Total</Texto>
              </Linha>
            </Titulo>
            <Linha alinhamento="space-around" style={{ marginBottom: 12 }}>
              <Coluna alinhamento="center">
                <Texto tamanho="xs" cor="#888">Média</Texto>
                <Texto tamanho="lg" peso="bold">{somaTotal.media}</Texto>
              </Coluna>
              <Coluna alinhamento="center">
                <Texto tamanho="xs" cor="#888">Mínima</Texto>
                <Texto tamanho="lg" peso="bold">{somaTotal.min}</Texto>
              </Coluna>
              <Coluna alinhamento="center">
                <Texto tamanho="xs" cor="#888">Máxima</Texto>
                <Texto tamanho="lg" peso="bold">{somaTotal.max}</Texto>
              </Coluna>
              <Coluna alinhamento="center">
                <Texto tamanho="xs" cor="#888">Desvio</Texto>
                <Texto tamanho="lg" peso="bold">{somaTotal.desvio}</Texto>
              </Coluna>
            </Linha>
            <View style={{ paddingVertical: 8 }}>
              <Texto tamanho="sm" peso="medium" style={{ marginBottom: 6 }}>
                Faixa Recomendada: {somaTotal.recomendacao.min} a {somaTotal.recomendacao.max}
              </Texto>
              <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4 }}>
                <View 
                  style={{ 
                    height: '100%', 
                    backgroundColor: '#2E7D32', 
                    borderRadius: 4,
                    // Position based on range
                  }} 
                />
              </View>
            </View>
          </Card>
        )}
        
        {/* Repetições */}
        {repeticoes.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Titulo nivel={3} style={{ marginBottom: 12 }}>
              <Linha alinhamento="center" style={{ gap: 8 }}>
                <Icones.Atualizar size={22} color="#6A1B9A" />
                <Texto>Dezenas que se Repetiram</Texto>
              </Linha>
            </Titulo>
            <Texto tamanho="xs" cor="#888" style={{ marginBottom: 10 }}>
              Quantas vezes cada dezena saiu em concursos consecutivos
            </Texto>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {repeticoes.slice(0, 10).map(r => (
                <View key={r.dezena} style={{ 
                  padding: 8, 
                  backgroundColor: '#F3E5F5', 
                  borderRadius: 8,
                  minWidth: 60,
                  alignItems: 'center'
                }}>
                  <Icones.Numero numero={r.dezena} size={32} />
                  <Texto tamanho="xs" peso="bold" cor="#6A1B9A">
                    {r.count}x consecutivas
                  </Texto>
                </View>
              ))}
            </View>
          </Card>
        )}
        
        {/* Tabela completa de frequência */}
        <Card>
          <Titulo nivel={3} style={{ marginBottom: 12 }}>Tabela Completa de Frequência</Titulo>
          <Texto tamanho="xs" cor="#888" style={{ marginBottom: 10 }}>
            Ordenadas: Quentes (vermelho) → Frias (azul) → Mornas (âmbar)
          </Texto>
          <View style={{ gap: 4 }}>
            {frequencias.map(f => (
              <View key={f.dezena} style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: f.status === 'quente' ? '#FFEBEE' : f.status === 'fria' ? '#E3F2FD' : '#FFF8E1',
                borderRadius: 8,
                marginBottom: 4,
              }}>
                <Icones.Numero numero={f.dezena} size={36} status={f.status} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Linha alinhamento="space-between">
                    <Texto peso="medium" cor={CORES_DEZENAS[f.status]}>
                      {f.status === 'quente' ? '🔥 Quente' : f.status === 'fria' ? '❄️ Fria' : '🟡 Morna'}
                    </Texto>
                    <Texto tamanho="sm" cor="#666">Atraso: {f.atraso} concursos</Texto>
                  </Linha>
                  <Linha alinhamento="space-between" style={{ marginTop: 2 }}>
                    <Texto tamanho="sm">Frequência: {f.frequencia}x ({f.percentual}%)</Texto>
                    <Texto tamanho="xs" cor="#888">Última: Concurso {f.ultimasOcorrencias[0] || 'N/A'}</Texto>
                  </Linha>
                </View>
              </View>
            ))}
          </View>
        </Card>
        
        <View style={{ marginTop: 30, paddingVertical: 20, alignItems: 'center' }}>
          <Texto tamanho="xs" cor="#999" alinhamento="center">
            Dados: Caixa Econômica Federal • Atualizado: {formatarData(new Date().toISOString())}
          </Texto>
        </View>
      </Scroll>
    </SafeArea>
  );
}

import { TEMA_CORES } from '@/constants';