// Tela Principal (Home)
import React, { useEffect, useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Alert, Platform 
} from 'react-native';
import { useConcursos } from '@/hooks';
import { useConfiguracoes } from '@/hooks';
import { useNotificacoes } from '@/hooks';
import { useTema } from '@/hooks';
import { 
  Box, Texto, Titulo, Subtitulo, Botao, Card, Badge, Separador, Linha, Coluna, Icones, SafeArea, Scroll 
} from '@/components/ui';
import { formatarData, formatarMoeda } from '@/utils';
import { LOTOFACIL_CONFIG, DIAS_SORTEIO_LOTOFACIL } from '@/constants';

export default function HomeScreen() {
  const { 
    concursos, 
    carregando, 
    erro, 
    ultimaAtualizacao, 
    sincronizar, 
    verificarNovos,
    ultimoConcurso 
  } = useConcursos();
  
  const { config } = useConfiguracoes();
  const { solicitarPermissao, agendarLembrete } = useNotificacoes();
  const { tema, vibrar } = useTema();
  
  const [mostrarBoasVindas, setMostrarBoasVindas] = useState(false);
  const [proximoSorteio, setProximoSorteio] = useState<string>('');
  
  // Verifica se é primeiro acesso
  useEffect(() => {
    const verificarPrimeiroAcesso = async () => {
      const { getItem } = await import('@react-native-async-storage/async-storage');
      const jaAbriu = await getItem('@lotofacil:ja_abriu');
      if (!jaAbriu) {
        setMostrarBoasVindas(true);
        await import('@react-native-async-storage/async-storage').then(m => m.setItem('@lotofacil:ja_abriu', 'true'));
      }
    };
    verificarPrimeiroAcesso();
  }, []);
  
  // Calcula próximo sorteio
  useEffect(() => {
    if (ultimoConcurso?.dataProxConcurso) {
      setProximoSorteio(formatarData(ultimoConcurso.dataProxConcurso));
    }
  }, [ultimoConcurso]);
  
  // Verifica novos concursos ao abrir
  useEffect(() => {
    const check = async () => {
      await verificarNovos();
      // Agenda lembretes se ativados
      if (config.notifLembreteJogo && config.horarioLembrete) {
        const [h, m] = config.horarioLembrete.split(':').map(Number);
        const agora = new Date();
        const proxima = new Date();
        proxima.setHours(h, m, 0, 0);
        if (proxima <= agora) proxima.setDate(proxima.getDate() + 1);
        
        // Verifica se é dia de sorteio
        const diaSemana = proxima.getDay();
        if (config.diasLembrete.includes(diaSemana)) {
          await agendarLembrete(
            'Hora de jogar! 🍀',
            `Não esqueça de fazer sua aposta na Lotofácil. Boa sorte!`,
            proxima
          );
        }
      }
    };
    check();
  }, []);
  
  if (carregando && concursos.length === 0) {
    return (
      <SafeArea>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Icones.Sincronizar size={60} color={TEMA_CORES[tema].primario} />
          <Texto tamanho="lg" peso="medium" style={{ marginTop: 16 }}>
            Carregando dados...
          </Texto>
          <Texto tamanho="sm" cor="#888" style={{ marginTop: 8 }}>
            Buscando últimos resultados da Caixa
          </Texto>
        </View>
      </SafeArea>
    );
  }
  
  const proximoConcursoNum = ultimoConcurso?.proxConcurso || (ultimoConcurso?.numero || 0) + 1;
  const valorEstimado = ultimoConcurso?.valorEstimadoProx || 0;
  const acumulou = ultimoConcurso?.acumulou || false;
  
  return (
    <SafeArea>
      <Scroll contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}>
        {/* Cabeçalho */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View>
            <Titulo nivel={2}>Lotofácil Inteligente</Titulo>
            <Subtitulo>Análise estatística para apostas conscientes</Subtitulo>
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
              onPress={() => solicitarPermissao().then(() => Alert.alert('Permissão concedida!'))}
              iconeEsquerda={<Icones.Alerta size={18} />}
            >
              Alertas
            </Botao>
          </Box>
        </View>
        
        {/* Status do próximo sorteio - Card Principal */}
        <Card style={{ marginBottom: 16, backgroundColor: acumulou ? '#FFF3E0' : tema === 'alto-contraste' ? '#1A1A1A' : '#E8F5E9' }}>
          <Linha alinhamento="space-between">
            <Coluna>
              <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
                <Icones.Calendario size={28} color={acumulou ? '#F57F17' : '#2E7D32'} />
                <View>
                  <Texto tamanho="xl" peso="bold" cor={acumulou ? '#E65100' : '#1B5E20'}>
                    Próximo Sorteio: Concurso {proximoConcursoNum}
                  </Texto>
                  <Texto tamanho="md" cor={tema === 'alto-contraste' ? '#CCC' : '#666'}>
                    {proximoSorteio || 'Data a confirmar'}
                  </Texto>
                </View>
              </Linha>
              {acumulou && (
                <Linha alinhamento="center" style={{ gap: 8, marginTop: 8 }}>
                  <Icones.Fogo size={20} color="#F57F17" />
                  <Texto tamanho="md" peso="bold" cor="#E65100">
                    ACUMULOU! Prêmio estimado: {formatarMoeda(valorEstimado)}
                  </Texto>
                </Linha>
              )}
            </Coluna>
            <View style={{ alignItems: 'flex-end' }}>
              <Botao 
                variant={acumulou ? 'perigo' : 'primario'} 
                tamanho="grande" 
                larguraTotal
                onPress={() => {}}
              >
                Fazer Meus Jogos
              </Botao>
              <Texto tamanho="xs" cor={tema === 'alto-contraste' ? '#888' : '#999'} style={{ marginTop: 6, textAlign: 'right' }}>
                Sorteios: {DIAS_SORTEIO_LOTOFACIL.map(d => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d]).join(', ')}
              </Texto>
            </View>
          </Linha>
        </Card>
        
        {/* Último resultado */}
        {ultimoConcurso && (
          <Card style={{ marginBottom: 16 }}>
            <Linha alinhamento="space-between" style={{ marginBottom: 12 }}>
              <Texto tamanho="lg" peso="bold">Último Resultado</Texto>
              <Badge variant="info" tamanho="pequeno">Concurso {ultimoConcurso.numero}</Badge>
            </Linha>
            
            <Linha alinhamento="center" style={{ flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {ultimoConcurso.dezenas.map((dezena, i) => (
                <Icones.Numero 
                  key={i} 
                  numero={dezena} 
                  size={36} 
                  status={i < 5 ? 'quente' : undefined}
                />
              ))}
            </Linha>
            
            <Linha alinhamento="space-between" style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#eee' }}>
              <Coluna>
                <Texto tamanho="sm" cor="#888">Data do sorteio</Texto>
                <Texto tamanho="md" peso="medium">{formatarData(ultimoConcurso.data)}</Texto>
              </Coluna>
              <Coluna>
                <Texto tamanho="sm" cor="#888">Ganhadores 15 pts</Texto>
                <Texto tamanho="md" peso="medium">
                  {ultimoConcurso.premiacoes.find(p => p.faixa === 15)?.ganhadores || 0}
                </Texto>
              </Coluna>
              <Coluna>
                <Texto tamanho="sm" cor="#888">Prêmio 15 pts</Texto>
                <Texto tamanho="md" peso="medium" cor="#2E7D32">
                  {formatarMoeda(ultimoConcurso.premiacoes.find(p => p.faixa === 15)?.valor || 0)}
                </Texto>
              </Coluna>
            </Linha>
          </Card>
        )}
        
        {/* Ações rápidas */}
        <Titulo nivel={3} style={{ marginBottom: 12 }}>Ações Rápidas</Titulo>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <Botao 
            variant="primario" 
            tamanho="medio" 
            larguraTotal={false}
            style={{ flex: 1, minWidth: '45%' }}
            onPress={() => {}}
            iconeEsquerda={<Icones.Formula size={20} />}
          >
            Minhas Fórmulas
          </Botao>
          <Botao 
            variant="secundario" 
            tamanho="medio" 
            larguraTotal={false}
            style={{ flex: 1, minWidth: '45%' }}
            onPress={() => {}}
            iconeEsquerda={<Icones.Grafico size={20} />}
          >
            Análise Atual
          </Botao>
          <Botao 
            variant="outline" 
            tamanho="medio" 
            larguraTotal={false}
            style={{ flex: 1, minWidth: '45%' }}
            onPress={() => {}}
            iconeEsquerda={<Icones.Jogos size={20} />}
          >
            Meus Jogos
          </Botao>
          <Botao 
            variant="outline" 
            tamanho="medio" 
            larguraTotal={false}
            style={{ flex: 1, minWidth: '45%' }}
            onPress={() => {}}
            iconeEsquerda={<Icones.Historico size={20} />}
          >
            Histórico
          </Botao>
        </View>
        
        {/* Resumo das análises */}
        {concursos.length > 0 && (
          <>
            <Separador />
            <Titulo nivel={3} style={{ marginBottom: 12 }}>Resumo da Análise ({LOTOFACIL_CONFIG.CONCURSOS_PADRAO_ANALISE} últimos concursos)</Titulo>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              <Card style={{ flex: 1, minWidth: '45%', padding: 14 }}>
                <Linha alinhamento="center" style={{ gap: 8, marginBottom: 8 }}>
                  <Icones.Fogo size={24} color="#C62828" />
                  <Texto tamanho="md" peso="bold" cor="#C62828">Dezenas Quentes</Texto>
                </Linha>
                <Texto tamanho="sm" cor="#666">
                  As que mais saíram nos últimos concursos
                </Texto>
              </Card>
              
              <Card style={{ flex: 1, minWidth: '45%', padding: 14 }}>
                <Linha alinhamento="center" style={{ gap: 8, marginBottom: 8 }}>
                  <Icones.Neve size={24} color="#1565C0" />
                  <Texto tamanho="md" peso="bold" cor="#1565C0">Dezenas Frias</Texto>
                </Linha>
                <Texto tamanho="sm" cor="#666">
                  As mais atrasadas (podem sair em breve)
                </Texto>
              </Card>
              
              <Card style={{ flex: 1, minWidth: '45%', padding: 14 }}>
                <Linha alinhamento="center" style={{ gap: 8, marginBottom: 8 }}>
                  <Icones.Coracao size={24} color="#E91E63" />
                  <Texto tamanho="md" peso="bold" cor="#E91E63">Pares/Ímpares</Texto>
                </Linha>
                <Texto tamanho="sm" cor="#666">
                  Equilíbrio ideal para seus jogos
                </Texto>
              </Card>
              
              <Card style={{ flex: 1, minWidth: '45%', padding: 14 }}>
                <Linha alinhamento="center" style={{ gap: 8, marginBottom: 8 }}>
                  <Icones.Dinheiro size={24} color="#2E7D32" />
                  <Texto tamanho="md" peso="bold" cor="#2E7D32">Faixa de Soma</Texto>
                </Linha>
                <Texto tamanho="sm" cor="#666">
                  Soma total das 15 dezenas sorteadas
                </Texto>
              </Card>
            </View>
          </>
        )}
        
        {/* Dicas */}
        <Separador />
        <Titulo nivel={3} style={{ marginBottom: 12 }}>💡 Dicas da Semana</Titulo>
        
        <View style={{ gap: 10 }}>
          <Card>
            <Linha alinhamento="center" style={{ gap: 10 }}>
              <Icones.Informacao size={24} color="#1B5E20" />
              <Coluna>
                <Texto peso="medium">Use o método 5-5-5-3</Texto>
                <Texto tamanho="sm" cor="#666">
                  5 quentes + 5 frias + 5 aleatórias + 3 favoritas = 18 números base
                </Texto>
              </Coluna>
            </Linha>
          </Card>
          
          <Card>
            <Linha alinhamento="center" style={{ gap: 10 }}>
              <Icones.Premio size={24} color="#F57F17" />
              <Coluna>
                <Texto peso="medium">Gerencie sua banca</Texto>
                <Texto tamanho="sm" cor="#666">
                  Defina um valor mensal fixo. Nunca aposte dinheiro que fará falta.
                </Texto>
              </Coluna>
            </Linha>
          </Card>
          
          <Card>
            <Linha alinhamento="center" style={{ gap: 10 }}>
              <Icones.Verificado size={24} color="#2E7D32" />
              <Coluna>
                <Texto peso="medium">Conferia automática</Texto>
                <Texto tamanho="sm" cor="#666">
                  O app confere seus jogos assim que o resultado sai. Você recebe notificação.
                </Texto>
              </Coluna>
            </Linha>
          </Card>
        </View>
        
        {/* Rodapé */}
        <View style={{ marginTop: 30, paddingVertical: 20, alignItems: 'center' }}>
          <Texto tamanho="xs" cor="#999" alinhamento="center">
            Dados oficiais da Caixa Econômica Federal
          </Texto>
          <Texto tamanho="xs" cor="#999" alinhamento="center" style={{ marginTop: 4 }}>
            Jogue com responsabilidade. Proibido para menores de 18 anos.
          </Texto>
          <Texto tamanho="xs" cor="#999" alinhamento="center" style={{ marginTop: 8 }}>
            Versão 1.0.0 • Lotofácil Inteligente
          </Texto>
        </View>
      </Scroll>
      
      {/* Modal de boas-vindas */}
      {mostrarBoasVindas && (
        <Modal visible={true} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ margin: 20, borderRadius: 16, backgroundColor: '#fff', padding: 24 }}>
              <Titulo nivel={2} alinhamento="center">Bem-vindo! 🎉</Titulo>
              <Separador />
              <Texto tamanho="md" style={{ marginVertical: 12, lineHeight: 24 }}>
                Este app ajuda você a analisar a Lotofácil usando estatísticas reais dos sorteios da Caixa.
              </Texto>
              <View style={{ gap: 10, marginVertical: 16 }}>
                <Linha alinhamento="center" style={{ gap: 10 }}>
                  <Icones.Verificado size={20} color="#2E7D32" />
                  <Texto>Análise de frequência (quentes/frias)</Texto>
                </Linha>
                <Linha alinhamento="center" style={{ gap: 10 }}>
                  <Icones.Verificado size={20} color="#2E7D32" />
                  <Texto>Fórmulas personalizadas</Texto>
                </Linha>
                <Linha alinhamento="center" style={{ gap: 10 }}>
                  <Icones.Verificado size={20} color="#2E7D32" />
                  <Texto>Fechamentos matemáticos</Texto>
                </Linha>
                <Linha alinhamento="center" style={{ gap: 10 }}>
                  <Icones.Verificado size={20} color="#2E7D32" />
                  <Texto>Conferência automática de resultados</Texto>
                </Linha>
                <Linha alinhamento="center" style={{ gap: 10 }}>
                  <Icones.Verificado size={20} color="#2E7D32" />
                  <Texto>Interface adaptada para melhor visualização</Texto>
                </Linha>
              </View>
              <Botao 
                variant="primario" 
                larguraTotal 
                tamanho="grande"
                onPress={() => setMostrarBoasVindas(false)}
              >
                Começar Agora
              </Botao>
            </View>
          </View>
        </Modal>
      )}
    </SafeArea>
  );
}

// Import TEMA_CORES for loading screen
import { TEMA_CORES } from '@/constants';