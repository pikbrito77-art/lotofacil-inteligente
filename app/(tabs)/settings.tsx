// Tela de Configurações
import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, Alert, Modal, Switch, Platform, Linking 
} from 'react-native';
import { useConfiguracoes } from '@/hooks';
import { useTema } from '@/hooks';
import { useNotificacoes } from '@/hooks';
import { useEstatisticas } from '@/hooks';
import { useConcursos } from '@/hooks';
import { 
  Box, Texto, Titulo, Subtitulo, Botao, Card, Badge, Separador, Linha, Coluna, Icones, Input, SafeArea, Scroll 
} from '@/components/ui';
import { TEMA_CORES, TAMANHOS_FONTE, DIAS_SEMANA, CONFIG_PADRAO } from '@/constants';
import { formatarMoeda, exportarDados as exportarDadosUtil } from '@/utils';
import * as Database from '@/services/database';
import { uuidv4 } from '@/utils';

export default function SettingsScreen() {
  const { config, salvar, salvarTudo, carregando: carregandoConfig } = useConfiguracoes();
  const { tema: temaHook, tamanhoFonte, vozAtivada, vibracaoAtivada, falar, vibrar } = useTema();
  const { solicitarPermissao, agendarLembrete, cancelarTodas } = useNotificacoes();
  const { stats, resetarEstatisticas } = useEstatisticas();
  const { sincronizar, ultimaAtualizacao, concursos } = useConcursos();
  const { tema } = useTema();
  const cores = TEMA_CORES[tema];
  
  const [mostrarBackup, setMostrarBackup] = useState(false);
  const [dadosBackup, setDadosBackup] = useState('');
  const [importarArquivo, setImportarArquivo] = useState(false);
  const [testeVoz, setTesteVoz] = useState(false);
  
  const handleMudarTema = async (novoTema: 'claro' | 'escuro' | 'alto-contraste') => {
    await salvar('tema', novoTema);
    vibrar('success');
  };
  
  const handleMudarFonte = async (novoTamanho: 'normal' | 'grande' | 'extra-grande') => {
    await salvar('tamanhoFonte', novoTamanho);
    vibrar('success');
  };
  
  const handleToggleVoz = async (ativo: boolean) => {
    await salvar('vozAtivada', ativo);
    if (ativo) {
      falar('Voz ativada. O app vai ler informações importantes para você.');
    }
    vibrar('success');
  };
  
  const handleToggleVibracao = async (ativo: boolean) => {
    await salvar('vibracaoAtivada', ativo);
    if (ativo) vibrar('medium');
  };
  
  const handleToggleNotif = async (tipo: 'notifResultados' | 'notifDicas' | 'notifLembreteJogo', ativo: boolean) => {
    await salvar(tipo, ativo);
    if (ativo && tipo === 'notifLembreteJogo') {
      const permissao = await solicitarPermissao();
      if (!permissao) {
        Alert.alert('Permissão Necessária', 'Para receber lembretes, permita notificações nas configurações do sistema.');
        // Reverte
        await salvar(tipo, false);
      }
    }
    vibrar('light');
  };
  
  const handleHorarioLembrete = async (horario: string) => {
    await salvar('horarioLembrete', horario);
    // Reagenda
    if (config.notifLembreteJogo) {
      await cancelarTodas();
      const [h, m] = horario.split(':').map(Number);
      config.diasLembrete.forEach(dia => {
        const data = new Date();
        data.setHours(h, m, 0, 0);
        const diff = (dia - data.getDay() + 7) % 7;
        data.setDate(data.getDate() + (diff === 0 ? 7 : diff));
        agendarLembrete('Hora de jogar! 🍀', 'Não esqueça de fazer sua aposta na Lotofácil!', data);
      });
    }
  };
  
  const handleDiasLembrete = async (dia: number, ativo: boolean) => {
    const novosDias = ativo 
      ? [...config.diasLembrete, dia].sort((a, b) => a - b)
      : config.diasLembrete.filter(d => d !== dia);
    await salvar('diasLembrete', novosDias);
  };
  
  const handleQtdConcursos = async (qtd: number) => {
    await salvar('qtdConcursosAnalise', qtd);
  };
  
  const handleSincronizar = async () => {
    await sincronizar(50);
    vibrar('success');
    falar('Sincronização concluída');
  };
  
  const handleExportar = async () => {
    try {
      const json = await exportarDadosUtil();
      setDadosBackup(json);
      setMostrarBackup(true);
    } catch (e) {
      Alert.alert('Erro', 'Falha ao exportar');
    }
  };
  
  const handleImportar = () => {
    // Em produção, usaria DocumentPicker
    Alert.alert(
      'Importar Backup',
      'Esta função abriria o seletor de arquivos para escolher um backup .json.\n\nPor enquanto, cole o JSON abaixo:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Colar JSON', 
          onPress: () => setImportarArquivo(true)
        }
      ]
    );
  };
  
  const handleConfirmarImportar = async (json: string) => {
    try {
      await Database.importarDados(json);
      Alert.alert('Sucesso', 'Backup importado! O app será reiniciado.');
      // Força recarregamento
      setImportarArquivo(false);
    } catch (e) {
      Alert.alert('Erro', 'JSON inválido ou corrompido');
    }
  };
  
  const handleResetarDados = () => {
    Alert.alert(
      '⚠️ Apagar TODOS os Dados?',
      'Esta ação é IRREVERSÍVEL. Serão apagados:\n• Todas as fórmulas\n• Todos os jogos gerados\n• Histórico de concursos\n• Estatísticas\n• Configurações (voltam ao padrão)\n\nTem certeza absoluta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'APAGAR TUDO', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmação Final',
              'Última chance. Digite "APAGAR" para confirmar:',
              [
                { text: 'Cancelar', style: 'cancel' },
                { 
                  text: 'Confirmar', 
                  onPress: async () => {
                    await Database.resetarEstatisticas();
                    // Limpar outras tabelas...
                    Alert.alert('Concluído', 'Dados apagados. Reinicie o app.');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };
  
  const testarVozCompleta = () => {
    falar('Teste de voz funcionando. O aplicativo lerá resultados, dicas e alertas para você.');
    vibrar('success');
  };
  
  if (carregandoConfig) {
    return (
      <SafeArea>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Icones.Configuracoes size={60} color={cores.primario} />
          <Texto tamanho="lg" peso="medium" style={{ marginTop: 16 }}>
            Carregando configurações...
          </Texto>
        </View>
      </SafeArea>
    );
  }
  
  return (
    <SafeArea>
      <Scroll contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}>
        {/* Cabeçalho */}
        <Titulo nivel={2} style={{ marginBottom: 4 }}>Configurações</Titulo>
        <Subtitulo style={{ marginBottom: 20 }}>Personalize o app para suas necessidades</Subtitle>
        
        {/* ===== ACESSIBILIDADE ===== */}
        <Card style={{ marginBottom: 16 }}>
          <Linha alinhamento="center" style={{ gap: 10, marginBottom: 16 }}>
            <Icones.Acessibilidade size={24} color={cores.primario} />
            <Titulo nivel={3}>Acessibilidade</Titulo>
          </Linha>
          
          {/* Tema */}
          <View style={{ marginBottom: 16 }}>
            <Linha alinhamento="space-between" style={{ marginBottom: 12 }}>
              <Linha alinhamento="center" style={{ gap: 10 }}>
                <Icones.Tema size={22} color={cores.primario} />
                <Coluna>
                  <Texto peso="medium">Tema Visual</Texto>
                  <Texto tamanho="xs" cor="#888">Escolha a aparência do app</Texto>
                </Coluna>
              </Linha>
            </Linha>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['claro', 'escuro', 'alto-contraste'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => handleMudarTema(t)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: config.tema === t ? cores.primario : cores.borda,
                    backgroundColor: config.tema === t ? `${cores.primario}20` : cores.superficieVariante,
                    alignItems: 'center',
                  }}
                >
                  <Texto tamanho="sm" peso={config.tema === t ? 'bold' : 'normal'} 
                    cor={config.tema === t ? cores.primario : cores.texto}>
                    {t === 'claro' ? '☀️ Claro' : t === 'escuro' ? '🌙 Escuro' : '☀️ Alto Contraste'}
                  </Texto>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Tamanho da Fonte */}
          <View style={{ marginBottom: 16 }}>
            <Linha alinhamento="space-between" style={{ marginBottom: 12 }}>
              <Linha alinhamento="center" style={{ gap: 10 }}>
                <Icones.Fonte size={22} color={cores.primario} />
                <Coluna>
                  <Texto peso="medium">Tamanho do Texto</Texto>
                  <Texto tamanho="xs" cor="#888">Ajuste para melhor leitura</Texto>
                </Coluna>
              </Linha>
            </Linha>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['normal', 'grande', 'extra-grande'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => handleMudarFonte(t)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: config.tamanhoFonte === t ? cores.primario : cores.borda,
                    backgroundColor: config.tamanhoFonte === t ? `${cores.primario}20` : cores.superficieVariante,
                    alignItems: 'center',
                  }}
                >
                  <Texto 
                    tamanho={t === 'normal' ? 'sm' : t === 'grande' ? 'md' : 'lg'} 
                    peso={config.tamanhoFonte === t ? 'bold' : 'normal'} 
                    cor={config.tamanhoFonte === t ? cores.primario : cores.texto}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Texto>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Voz e Vibração */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Card style={{ flex: 1, padding: 16 }}>
              <Linha alinhamento="center" style={{ gap: 10, marginBottom: 12 }}>
                <Icones.Voz size={24} color={vozAtivada ? cores.sucesso : cores.textoSecundario} />
                <Texto peso="medium">Leitura por Voz</Texto>
              </Linha>
              <Linha alinhamento="space-between">
                <Texto tamanho="sm" cor="#666">Lê resultados, dicas e alertas</Texto>
                <Switch
                  value={vozAtivada}
                  onValueChange={handleToggleVoz}
                  trackColor={{ false: '#ccc', true: cores.sucesso }}
                  thumbColor={cores.sucesso}
                />
              </Linha>
              {vozAtivada && (
                <Botao variant="outline" tamanho="pequeno" style={{ marginTop: 8, minWidth: '100%' }} onPress={testarVozCompleta} iconeEsquerda={<Icones.Voz size={16} />}>
                  Testar Voz
                </Botao>
              )}
            </Card>
            
            <Card style={{ flex: 1, padding: 16 }}>
              <Linha alinhamento="center" style={{ gap: 10, marginBottom: 12 }}>
                <Icones.Vibracao size={24} color={vibracaoAtivada ? cores.primario : cores.textoSecundario} />
                <Texto peso="medium">Feedback Tátil</Texto>
              </Linha>
              <Linha alinhamento="space-between">
                <Texto tamanho="sm" cor="#666">Vibra em botões e ações importantes</Texto>
                <Switch
                  value={vibracaoAtivada}
                  onValueChange={handleToggleVibracao}
                  trackColor={{ false: '#ccc', true: cores.primario }}
                  thumbColor={cores.primario}
                />
              </Linha>
            </Card>
          </View>
        </Card>
        
        {/* ===== NOTIFICAÇÕES ===== */}
        <Card style={{ marginBottom: 16 }}>
          <Linha alinhamento="center" style={{ gap: 10, marginBottom: 16 }}>
            <Icones.Alerta size={24} color={cores.secundario} />
            <Titulo nivel={3}>Notificações</Titulo>
          </Linha>
          
          <View style={{ gap: 12 }}>
            {[
              { key: 'notifResultados', label: 'Resultados', desc: 'Aviso quando sair novo resultado', icon: Icones.Verificado },
              { key: 'notifDicas', label: 'Dicas Semanais', desc: 'Sugestões de números baseadas na análise', icon: Icones.Fogo },
              { key: 'notifLembreteJogo', label: 'Lembrete de Jogo', desc: 'Avisa nos dias de sorteio para não esquecer', icon: Icones.Calendario },
            ].map(item => (
              <Card key={item.key} style={{ padding: 14 }}>
                <Linha alinhamento="space-between">
                  <Linha alinhamento="center" style={{ gap: 10, flex: 1 }}>
                    <item.icon size={22} color={cores.secundario} />
                    <Coluna>
                      <Texto peso="medium">{item.label}</Texto>
                      <Texto tamanho="xs" cor="#888">{item.desc}</Texto>
                    </Coluna>
                  </Linha>
                  <Switch
                    value={config[item.key as keyof typeof config] as boolean}
                    onValueChange={(v) => handleToggleNotif(item.key as any, v)}
                    trackColor={{ false: '#ccc', true: cores.secundario }}
                    thumbColor={cores.secundario}
                  />
                </Linha>
              </Card>
            ))}
            
            {/* Configuração do lembrete */}
            {config.notifLembreteJogo && (
              <Card style={{ padding: 14, backgroundColor: '#FFF8E1' }}>
                <Linha alinhamento="center" style={{ gap: 10, marginBottom: 12 }}>
                  <Icones.Relogio size={22} color="#F57F17" />
                  <Texto peso="medium" cor="#F57F17">Horário do Lembrete</Texto>
                </Linha>
                <Linha alinhamento="center" style={{ gap: 12 }}>
                  <Input
                    label="Horário"
                    value={config.horarioLembrete}
                    onChangeText={handleHorarioLembrete}
                    placeholder="18:00"
                    keyboardType="numeric"
                    style={{ width: 120 }}
                  />
                  <Texto tamanho="sm" cor="#666">(Formato 24h: HH:MM)</Texto>
                </Linha>
                
                <Texto tamanho="xs" cor="#888" style={{ marginTop: 8, marginBottom: 8 }}>Dias da Semana</Texto>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {DIAS_SEMANA.map(d => (
                    <TouchableOpacity
                      key={d.valor}
                      onPress={() => handleDiasLembrete(d.valor, !config.diasLembrete.includes(d.valor))}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 20,
                        borderWidth: 2,
                        borderColor: config.diasLembrete.includes(d.valor) ? cores.secundario : cores.borda,
                        backgroundColor: config.diasLembrete.includes(d.valor) ? `${cores.secundario}20` : cores.superficieVariante,
                      }}
                    >
                      <Texto 
                        tamanho="sm" 
                        peso={config.diasLembrete.includes(d.valor) ? 'bold' : 'normal'} 
                        cor={config.diasLembrete.includes(d.valor) ? cores.secundario : cores.texto}
                      >
                        {d.curto}
                      </Texto>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            )}
          </View>
        </Card>
        
        {/* ===== DADOS E ANÁLISE ===== */}
        <Card style={{ marginBottom: 16 }}>
          <Linha alinhamento="center" style={{ gap: 10, marginBottom: 16 }}>
            <Icones.Grafico size={24} color="#2E7D32" />
            <Titulo nivel={3}>Dados & Análise</Titulo>
          </Linha>
          
          <View style={{ gap: 12 }}>
            <Card>
              <Linha alinhamento="space-between" style={{ marginBottom: 8 }}>
                <Linha alinhamento="center" style={{ gap: 10 }}>
                  <Icones.Atualizar size={22} color="#2E7D32" />
                  <Coluna>
                    <Texto peso="medium">Concursos para Análise</Texto>
                    <Texto tamanho="xs" cor="#888">Quantos últimos concursos usar nas estatísticas</Texto>
                  </Coluna>
                </Linha>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <Botao variant="outline" tamanho="pequeno" onPress={() => handleQtdConcursos(Math.max(6, config.qtdConcursosAnalise - 6))}>-</Botao>
                  <Texto tamanho="lg" peso="bold" style={{ minWidth: 40, textAlign: 'center' }}>
                    {config.qtdConcursosAnalise}
                  </Texto>
                  <Botao variant="primario" tamanho="pequeno" onPress={() => handleQtdConcursos(Math.min(50, config.qtdConcursosAnalise + 6))}>+</Botao>
                </View>
              </Linha>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, height: 6, backgroundColor: '#eee', borderRadius: 3 }}>
                  <View 
                    style={{ 
                      width: `${((config.qtdConcursosAnalise - 6) / 44) * 100}%`, 
                      height: '100%', 
                      backgroundColor: '#2E7D32', 
                      borderRadius: 3 
                    }} 
                  />
                </View>
                <Texto tamanho="xs" cor="#888">6 a 50 concursos</Texto>
              </View>
            </Card>
            
            <Card>
              <Linha alinhamento="space-between">
                <Linha alinhamento="center" style={{ gap: 10 }}>
                  <Icones.Sincronizar size={22} color="#2E7D32" />
                  <Coluna>
                    <Texto peso="medium">Atualização Automática</Texto>
                    <Texto tamanho="xs" cor="#888">Busca novos resultados ao abrir o app</Texto>
                  </Coluna>
                </Linha>
                <Switch
                  value={config.autoAtualizar}
                  onValueChange={v => salvar('autoAtualizar', v)}
                  trackColor={{ false: '#ccc', true: '#2E7D32' }}
                  thumbColor='#2E7D32'
                />
              </Linha>
            </Card>
            
            <Card>
              <Linha alinhamento="center" style={{ gap: 10 }}>
                <Icones.Calendario size={22} color="#2E7D32" />
                <Texto peso="medium">Última Sincronização</Texto>
              </Linha>
              <Texto tamanho="sm" cor="#666" style={{ marginTop: 4 }}>
                {ultimaAtualizacao ? formatarData(ultimaAtualizacao) : 'Nunca'}
              </Texto>
            </Card>
            
            <Botao variant="primario" larguraTotal onPress={handleSincronizar} iconeEsquerda={<Icones.Sincronizar size={20} />}>
              Sincronizar Agora ({concursos.length} concursos)
            </Botao>
          </View>
        </Card>
        
        {/* ===== BACKUP E RESTAURAÇÃO ===== */}
        <Card style={{ marginBottom: 16 }}>
          <Linha alinhamento="center" style={{ gap: 10, marginBottom: 16 }}>
            <Icones.Backup size={24} color="#6A1B9A" />
            <Titulo nivel={3}>Backup & Restauração</Titulo>
          </Linha>
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Botao variant="secundario" larguraTotal onPress={handleExportar} iconeEsquerda={<Icones.Backup size={20} />}>
              Exportar Backup
            </Botao>
            <Botao variant="outline" larguraTotal onPress={handleImportar} iconeEsquerda={<Icones.Restaurar size={20} />}>
              Importar Backup
            </Botao>
          </View>
          
          <Texto tamanho="xs" cor="#888" style={{ marginTop: 8, textAlign: 'center' }}>
            O backup inclui: fórmulas, jogos, concursos, configurações e estatísticas
          </Texto>
        </Card>
        
        {/* ===== ESTATÍSTICAS DO APP ===== */}
        <Card style={{ marginBottom: 16 }}>
          <Linha alinhamento="center" style={{ gap: 10, marginBottom: 16 }}>
            <Icones.Grafico size={24} color="#00BCD4" />
            <Titulo nivel={3}>Estatísticas do App</Titulo>
          </Linha>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <Card style={{ flex: 1, minWidth: '45%', padding: 12, alignItems: 'center' }}>
              <Texto tamanho="xs" cor="#888">Jogos Gerados</Texto>
              <Texto tamanho="xl" peso="bold">{stats.totalJogosGerados}</Texto>
            </Card>
            <Card style={{ flex: 1, minWidth: '45%', padding: 12, alignItems: 'center' }}>
              <Texto tamanho="xs" cor="#888">Concursos</Texto>
              <Texto tamanho="xl" peso="bold">{stats.concursosParticipados}</Texto>
            </Card>
            <Card style={{ flex: 1, minWidth: '45%', padding: 12, alignItems: 'center' }}>
              <Texto tamanho="xs" cor="#888">Fórmulas</Texto>
              <Texto tamanho="xl" peso="bold">{stats.formulasCriadas}</Texto>
            </Card>
            <Card style={{ flex: 1, minWidth: '45%', padding: 12, alignItems: 'center' }}>
              <Texto tamanho="xs" cor="#888">Sequência</Texto>
              <Texto tamanho="xl" peso="bold" cor="#F57F17">{stats.sequenciaAtual} dias</Texto>
            </Card>
          </View>
        </Card>
        
        {/* ===== ZONA DE PERIGO ===== */}
        <Card style={{ marginBottom: 16, borderWidth: 2, borderColor: '#FFEBEE' }}>
          <Linha alinhamento="center" style={{ gap: 10, marginBottom: 16 }}>
            <Icones.Alerta size={24} color="#C62828" />
            <Titulo nivel={3} cor="#C62828">Zona de Perigo</Titulo>
          </Linha>
          
          <Botao variant="perigo" larguraTotal onPress={handleResetarDados} iconeEsquerda={<Icones.Deletar size={20} />}>
            Apagar TODOS os Dados do App
          </Botao>
          
          <Texto tamanho="xs" cor="#C62828" style={{ marginTop: 8, textAlign: 'center' }}>
            Irreversível • Use apenas se quiser começar do zero
          </Texto>
        </Card>
        
        {/* ===== SOBRE ===== */}
        <Card>
          <Linha alinhamento="center" style={{ gap: 10, marginBottom: 16 }}>
            <Icones.Sobre size={24} color={cores.primario} />
            <Titulo nivel={3}>Sobre o App</Titulo>
          </Linha>
          
          <View style={{ gap: 12, alignItems: 'center' }}>
            <Texto tamanho="lg" peso="bold" alinhamento="center">Lotofácil Inteligente</Texto>
            <Texto tamanho="md" cor="#666" alinhamento="center">Versão 1.0.0</Texto>
            <Texto tamanho="sm" cor="#888" alinhamento="center" style={{ marginTop: 8 }}>
              Análise estatística para apostas conscientes na Lotofácil\nBaseado em dados oficiais da Caixa Econômica Federal
            </Texto>
            
            <Separador />
            
            <View style={{ gap: 8, alignItems: 'center' }}>
              <Linha alinhamento="center" style={{ gap: 10 }}>
                <Icones.Verificado size={18} color="#2E7D32" />
                <Texto tamanho="sm">Dados oficiais da Caixa</Texto>
              </Linha>
              <Linha alinhamento="center" style={{ gap: 10 }}>
                <Icones.Verificado size={18} color="#2E7D32" />
                <Texto tamanho="sm">100% Offline após sincronizar</Texto>
              </Linha>
              <Linha alinhamento="center" style={{ gap: 10 }}>
                <Icones.Verificado size={18} color="#2E7D32" />
                <Texto tamanho="sm">Sem anúncios • Sem coleta de dados</Texto>
              </Linha>
              <Linha alinhamento="center" style={{ gap: 10 }}>
                <Icones.Verificado size={18} color="#2E7D32" />
                <Texto tamanho="sm">Interface adaptada para idosos</Texto>
              </Linha>
            </View>
            
            <Separador />
            
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
              <Botao variant="outline" tamanho="pequeno" onPress={() => Linking.openURL('https://www.caixa.gov.br/loterias')}>
                Site da Caixa
              </Botao>
              <Botao variant="outline" tamanho="pequeno" onPress={() => Alert.alert('Suporte', 'suporte@lotofacilinteligente.app')}>
                Suporte
              </Botao>
            </View>
            
            <Texto tamanho="xs" cor="#999" alinhamento="center" style={{ marginTop: 16 }}>
              Jogue com responsabilidade • Proibido para menores de 18 anos\nDesenvolvido com ❤️ para a comunidade apostadora brasileira
            </Texto>
          </View>
        </Card>
        
        <View style={{ marginTop: 30, paddingVertical: 20, alignItems: 'center' }}>
          <Texto tamanho="xs" cor="#999" alinhamento="center">
            Lotofácil Inteligente v1.0.0 • Build 2024
          </Texto>
        </View>
      </Scroll>
      
      {/* Modal Backup */}
      {mostrarBackup && (
        <Modal visible={true} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ margin: 20, borderRadius: 16, backgroundColor: '#fff', padding: 24, maxHeight: '80%' }}>
              <Titulo nivel={3} alinhamento="center" style={{ marginBottom: 16 }}>Backup Exportado (JSON)</Titulo>
              <Texto tamanho="xs" cor="#666" style={{ marginBottom: 12, textAlign: 'center' }}>
                Copie e salve em arquivo .json para backup seguro
              </Texto>
              <Scroll style={{ maxHeight: 300 }}>
                <Texto tamanho="xs" style={{ fontFamily: 'monospace', lineHeight: 18 }}>
                  {dadosBackup}
                </Texto>
              </Scroll>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <Botao variant="outline" larguraTotal onPress={() => setMostrarBackup(false)}>
                  Fechar
                </Botao>
                <Botao variant="primario" larguraTotal onPress={() => { vibrar('success'); }}>Copiar</Botao>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Modal Importar */}
      {importarArquivo && (
        <Modal visible={true} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ margin: 20, borderRadius: 16, backgroundColor: '#fff', padding: 24 }}>
              <Titulo nivel={3} alinhamento="center" style={{ marginBottom: 16 }}>Importar Backup</Titulo>
              <Texto tamanho="sm" cor="#666" style={{ marginBottom: 12, textAlign: 'center' }}>
                Cole o conteúdo do arquivo .json de backup abaixo
              </Texto>
              <Input
                label="JSON do Backup"
                value=""
                onChangeText={setDadosBackup}
                placeholder='{"versao":"1.0",...}'
                multiline
                numberOfLines={10}
              />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <Botao variant="outline" larguraTotal onPress={() => setImportarArquivo(false)}>
                  Cancelar
                </Botao>
                <Botao variant="perigo" larguraTotal onPress={() => handleConfirmarImportar(dadosBackup)}>
                  Importar
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