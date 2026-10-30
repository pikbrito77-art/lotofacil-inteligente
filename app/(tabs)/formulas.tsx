// Tela de Fórmulas do Usuário
import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useFormulas } from '@/hooks';
import { useAnalise } from '@/hooks';
import { useConcursos } from '@/hooks';
import { useTema } from '@/hooks';
import { useConfiguracoes } from '@/hooks';
import { 
  Box, Texto, Titulo, Subtitulo, Botao, Card, Badge, Separador, Linha, Coluna, Icones, Input, SafeArea, Scroll 
} from '@/components/ui';
import { FORMULA_PADRAO, LOTOFACIL_CONFIG } from '@/constants';
import { uuidv4, validarFormula } from '@/utils';
import { formatarData } from '@/utils';

export default function FormulasScreen() {
  const { formulas, formulaAtiva, carregando, salvar, deletar, duplicar, carregar } = useFormulas();
  const { concursos } = useConcursos();
  const { analise } = useAnalise(concursos);
  const { config } = useConfiguracoes();
  const { tema, falar, vibrar } = useTema();
  const cores = TEMA_CORES[tema];
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState<typeof formulas[0] | null>(null);
  const [formData, setFormData] = useState<Partial<typeof FORMULA_PADRAO>>({});
  const [erros, setErros] = useState<string[]>([]);
  const [passoAtual, setPassoAtual] = useState(0);
  
  const passos = [
    { id: 'basico', titulo: 'Básico', icone: '📝' },
    { id: 'numeros', titulo: 'Números', icone: '🔢' },
    { id: 'filtros', titulo: 'Filtros', icone: '🔍' },
    { id: 'avancado', titulo: 'Avançado', icone: '⚙️' },
  ];
  
  // Inicializa formulário
  const inicializarForm = (formula?: typeof formulas[0]) => {
    const base = formula || { ...FORMULA_PADRAO, id: uuidv4(), nome: '', criadaEm: new Date().toISOString(), atualizadaEm: new Date().toISOString(), vezesUsada: 0 };
    setFormData({
      id: base.id,
      nome: base.nome,
      descricao: base.descricao,
      usarFrequencia: base.usarFrequencia,
      pesoQuentes: base.pesoQuentes,
      pesoFrias: base.pesoFrias,
      pesoAtrasadas: base.pesoAtrasadas,
      qtdQuentes: base.qtdQuentes,
      qtdFrias: base.qtdFrias,
      qtdAleatorias: base.qtdAleatorias,
      qtdFavoritas: base.qtdFavoritas,
      numerosFavoritos: [...base.numerosFavoritos],
      faixaSomaMin: base.faixaSomaMin,
      faixaSomaMax: base.faixaSomaMax,
      qtdParesMin: base.qtdParesMin,
      qtdParesMax: base.qtdParesMax,
      qtdImparesMin: base.qtdImparesMin,
      qtdImparesMax: base.qtdImparesMax,
      maxPorLinha: base.maxPorLinha,
      maxPorColuna: base.maxPorColuna,
      excluirDezenas: [...base.excluirDezenas],
      exigirDezenas: [...base.exigirDezenas],
      ativa: base.ativa,
    });
    setErros([]);
    setPassoAtual(0);
  };
  
  const handleChange = (campo: string, valor: any) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    if (erros.length > 0) setErros([]);
  };
  
  const handleArrayChange = (campo: string, valor: number, adicionar: boolean) => {
    const arr = [...(formData[campo as keyof typeof formData] as number[] || [])];
    if (adicionar && !arr.includes(valor) && arr.length < 10) {
      arr.push(valor);
      arr.sort((a, b) => a - b);
    } else if (!adicionar) {
      const idx = arr.indexOf(valor);
      if (idx >= 0) arr.splice(idx, 1);
    }
    handleChange(campo, arr);
  };
  
  const validarPasso = (passo: number): boolean => {
    const novosErros: string[] = [];
    
    switch (passo) {
      case 0: // Básico
        if (!formData.nome || formData.nome.trim().length < 2) {
          novosErros.push('Nome deve ter pelo menos 2 caracteres');
        }
        break;
      case 1: // Números
        const total = (formData.qtdQuentes || 0) + (formData.qtdFrias || 0) + 
                     (formData.qtdAleatorias || 0) + (formData.qtdFavoritas || 0);
        if (total < 16) {
          novosErros.push('Total de números deve ser pelo menos 16 para fechamento');
        }
        if (total > 20) {
          novosErros.push('Máximo de 20 números base');
        }
        break;
      case 2: // Filtros
        if ((formData.faixaSomaMin || 0) >= (formData.faixaSomaMax || 0)) {
          novosErros.push('Soma mínima deve ser menor que a máxima');
        }
        if ((formData.qtdParesMin || 0) + (formData.qtdImparesMin || 0) > 15) {
          novosErros.push('Soma de pares + ímpares mínimos não pode exceder 15');
        }
        break;
    }
    
    setErros(novosErros);
    return novosErros.length === 0;
  };
  
  const proximoPasso = () => {
    if (validarPasso(passoAtual)) {
      setPassoAtual(p => Math.min(p + 1, passos.length - 1));
      vibrar('light');
    } else {
      vibrar('error');
    }
  };
  
  const passoAnterior = () => {
    setPassoAtual(p => Math.max(p - 1, 0));
    vibrar('light');
  };
  
  const salvarFormula = async () => {
    const { valido, erros: errosVal } = validarFormula(formData);
    if (!valido) {
      setErros(errosVal);
      vibrar('error');
      return;
    }
    
    const formula = {
      ...formData,
      id: formData.id || uuidv4(),
      nome: formData.nome!.trim(),
      descricao: formData.descricao || '',
      criadaEm: editando?.criadaEm || new Date().toISOString(),
      atualizadaEm: new Date().toISOString(),
      vezesUsada: editando?.vezesUsada || 0,
    } as typeof formulas[0];
    
    const ok = await salvar(formula);
    if (ok) {
      vibrar('success');
      falar(`Fórmula ${formula.nome} salva com sucesso`);
      setMostrarModal(false);
      setEditando(null);
    } else {
      vibrar('error');
      Alert.alert('Erro', 'Não foi possível salvar a fórmula');
    }
  };
  
  const confirmarDeletar = (formula: typeof formulas[0]) => {
    Alert.alert(
      'Excluir Fórmula',
      `Tem certeza que deseja excluir "${formula.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            await deletar(formula.id);
            vibrar('success');
          }
        },
      ]
    );
  };
  
  const testarFormula = async () => {
    if (!analise) {
      Alert.alert('Aviso', 'Aguardando análise estatística...');
      return;
    }
    
    const { valido, erros: errosVal } = validarFormula(formData);
    if (!valido) {
      Alert.alert('Complete a fórmula', errosVal.join('\n'));
      return;
    }
    
    const formulaTemp = { ...formData, id: 'temp', nome: 'Teste', criadaEm: new Date().toISOString(), atualizadaEm: new Date().toISOString(), vezesUsada: 0 } as typeof formulas[0];
    // Aqui você chamaria o gerador de jogos
    Alert.alert(
      'Teste da Fórmula',
      `Fórmula válida! Números base estimados: ~${(formData.qtdQuentes||0)+(formData.qtdFrias||0)+(formData.qtdAleatorias||0)+(formData.qtdFavoritas||0)} números.\n\nVá para "Meus Jogos" para gerar jogos reais.`
    );
    vibrar('success');
  };
  
  // Renderiza cada passo do formulário
  const renderPasso = () => {
    const f = formData;
    
    switch (passoAtual) {
      case 0: // Básico
        return (
          <View style={{ gap: 16 }}>
            <Input
              label="Nome da Fórmula *"
              value={f.nome || ''}
              onChangeText={v => handleChange('nome', v)}
              placeholder="Ex: Minha Fórmula da Sorte"
              helperText="Nome identificador para seus jogos"
            />
            <Input
              label="Descrição"
              value={f.descricao || ''}
              onChangeText={v => handleChange('descricao', v)}
              placeholder="Descreva sua estratégia..."
              multiline
              numberOfLines={3}
            />
            <Card>
              <Linha alinhamento="center" style={{ gap: 10, marginBottom: 10 }}>
                <Icones.Informacao size={20} color={cores.primario} />
                <Texto peso="medium">Usar análise de frequência</Texto>
              </Linha>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Texto>As dezenas quentes/frias/mornas da análise atual serão usadas</Texto>
                <Switch
                  value={f.usarFrequencia ?? true}
                  onValueChange={v => handleChange('usarFrequencia', v)}
                  trackColor={{ false: '#ccc', true: cores.primario }}
                  thumbColor={cores.primario}
                />
              </View>
            </Card>
          </View>
        );
      
      case 1: // Números
        return (
          <View style={{ gap: 16 }}>
            <Titulo nivel={3}>Distribuição dos 18-20 Números Base</Titulo>
            <Texto tamanho="sm" cor="#666" style={{ marginBottom: 8 }}>
              Baseado no método 5-5-5-3 do vídeo. Ajuste conforme sua estratégia.
            </Texto>
            
            <Card>
              <Linha alinhamento="space-between" style={{ marginBottom: 8 }}>
                <Linha alinhamento="center" style={{ gap: 8 }}>
                  <Icones.Fogo size={20} color="#C62828" />
                  <Texto peso="medium">Dezenas Quentes</Texto>
                </Linha>
                <Texto peso="bold" cor="#C62828">{f.qtdQuentes || 5}</Texto>
              </Linha>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Botao variant="outline" tamanho="pequeno" onPress={() => handleChange('qtdQuentes', Math.max(0, (f.qtdQuentes||0)-1))}>-</Botao>
                <Botao variant="primario" tamanho="pequeno" onPress={() => handleChange('qtdQuentes', (f.qtdQuentes||0)+1)}>+</Botao>
              </View>
              <Texto tamanho="xs" cor="#888">As que mais saíram (maior frequência)</Texto>
            </Card>
            
            <Card>
              <Linha alinhamento="space-between" style={{ marginBottom: 8 }}>
                <Linha alinhamento="center" style={{ gap: 8 }}>
                  <Icones.Neve size={20} color="#1565C0" />
                  <Texto peso="medium">Dezenas Frias/Atrasadas</Texto>
                </Linha>
                <Texto peso="bold" cor="#1565C0">{f.qtdFrias || 5}</Texto>
              </Linha>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Botao variant="outline" tamanho="pequeno" onPress={() => handleChange('qtdFrias', Math.max(0, (f.qtdFrias||0)-1))}>-</Botao>
                <Botao variant="primario" tamanho="pequeno" onPress={() => handleChange('qtdFrias', (f.qtdFrias||0)+1)}>+</Botao>
              </View>
              <Texto tamanho="xs" cor="#888">As mais atrasadas ou menor frequência</Texto>
            </Card>
            
            <Card>
              <Linha alinhamento="space-between" style={{ marginBottom: 8 }}>
                <Linha alinhamento="center" style={{ gap: 8 }}>
                  <Icones.Estrella size={20} color="#F57F17" />
                  <Texto peso="medium">Dezenas Aleatórias</Texto>
                </Linha>
                <Texto peso="bold" cor="#F57F17">{f.qtdAleatorias || 5}</Texto>
              </Linha>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Botao variant="outline" tamanho="pequeno" onPress={() => handleChange('qtdAleatorias', Math.max(0, (f.qtdAleatorias||0)-1))}>-</Botao>
                <Botao variant="primario" tamanho="pequeno" onPress={() => handleChange('qtdAleatorias', (f.qtdAleatorias||0)+1)}>+</Botao>
              </View>
              <Texto tamanho="xs" cor="#888">Sorteio aleatório para completar</Texto>
            </Card>
            
            <Card>
              <Linha alinhamento="space-between" style={{ marginBottom: 8 }}>
                <Linha alinhamento="center" style={{ gap: 8 }}>
                  <Icones.Coracao size={20} color="#E91E63" />
                  <Texto peso="medium">Dezenas Favoritas (Fixas)</Texto>
                </Linha>
                <Texto peso="bold" cor="#E91E63">{f.qtdFavoritas || 3}</Texto>
              </Linha>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Botao variant="outline" tamanho="pequeno" onPress={() => handleChange('qtdFavoritas', Math.max(0, (f.qtdFavoritas||0)-1))}>-</Botao>
                <Botao variant="primario" tamanho="pequeno" onPress={() => handleChange('qtdFavoritas', (f.qtdFavoritas||0)+1)}>+</Botao>
              </View>
              <Texto tamanho="xs" cor="#888">Seus números da sorte (datas, aniversários)</Texto>
            </Card>
            
            {/* Seleção de favoritos */}
            <Card>
              <Texto peso="medium" style={{ marginBottom: 8 }}>Seus Números Favoritos:</Texto>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {Array.from({ length: 25 }, (_, i) => i + 1).map(n => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => handleArrayChange('numerosFavoritos', n, !(f.numerosFavoritos||[]).includes(n))}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: (f.numerosFavoritos||[]).includes(n) ? '#E91E63' : '#f0f0f0',
                      borderWidth: 1,
                      borderColor: (f.numerosFavoritos||[]).includes(n) ? '#E91E63' : '#ddd',
                    }}
                  >
                    <Texto 
                      tamanho="sm" 
                      peso="bold" 
                      cor={(f.numerosFavoritos||[]).includes(n) ? '#fff' : '#333'}
                    >
                      {n.toString().padStart(2, '0')}
                    </Texto>
                  </TouchableOpacity>
                ))}
              </View>
              <Texto tamanho="xs" cor="#888" style={{ marginTop: 6 }}>
                Selecionados: {(f.numerosFavoritos||[]).length} / {f.qtdFavoritas || 3}
              </Texto>
            </Card>
            
            <Card style={{ backgroundColor: '#E8F5E9' }}>
              <Linha alinhamento="center" style={{ gap: 8 }}>
                <Icones.Verificado size={20} color="#2E7D32" />
                <Texto peso="bold" cor="#2E7D32">
                  Total: {(f.qtdQuentes||0)+(f.qtdFrias||0)+(f.qtdAleatorias||0)+(f.qtdFavoritas||0)} números base
                </Texto>
              </Linha>
            </Card>
          </View>
        );
      
      case 2: // Filtros
        return (
          <View style={{ gap: 16 }}>
            <Titulo nivel={3}>Filtros de Validação dos Jogos</Titulo>
            <Texto tamanho="sm" cor="#666" style={{ marginBottom: 8 }}>
              Apenas jogos que passarem por todos os filtros serão gerados.
            </Texto>
            
            <Card>
              <Titulo nivel={3} style={{ marginBottom: 12 }}>Faixa de Soma das 15 Dezenas</Titulo>
              <Linha alinhamento="center" style={{ gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Soma Mínima"
                    value={String(f.faixaSomaMin || 160)}
                    onChangeText={v => handleChange('faixaSomaMin', parseInt(v) || 0)}
                    keyboardType="numeric"
                    placeholder="160"
                  />
                </View>
                <View style={{ alignItems: 'center', paddingBottom: 24 }}>
                  <Texto peso="bold" tamanho="lg">até</Texto>
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Soma Máxima"
                    value={String(f.faixaSomaMax || 220)}
                    onChangeText={v => handleChange('faixaSomaMax', parseInt(v) || 0)}
                    keyboardType="numeric"
                    placeholder="220"
                  />
                </View>
              </Linha>
              <Texto tamanho="xs" cor="#888" alinhamento="center">
                Média histórica: ~195 • Range possível: 120 a 270
              </Texto>
            </Card>
            
            <Card>
              <Titulo nivel={3} style={{ marginBottom: 12 }}>Quantidade de Pares e Ímpares</Titulo>
              <Linha alinhamento="space-around">
                <View style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                  <Texto peso="medium" cor="#E91E63">PARES</Texto>
                  <Linha alinhamento="center" style={{ gap: 10 }}>
                    <Input
                      label="Mín"
                      value={String(f.qtdParesMin || 6)}
                      onChangeText={v => handleChange('qtdParesMin', parseInt(v) || 0)}
                      keyboardType="numeric"
                      style={{ width: 60 }}
                    />
                    <Input
                      label="Máx"
                      value={String(f.qtdParesMax || 9)}
                      onChangeText={v => handleChange('qtdParesMax', parseInt(v) || 0)}
                      keyboardType="numeric"
                      style={{ width: 60 }}
                    />
                  </Linha>
                </View>
                <View style={{ width: 1, height: 40, backgroundColor: '#ddd' }} />
                <View style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                  <Texto peso="medium" cor="#1565C0">ÍMPARES</Texto>
                  <Linha alinhamento="center" style={{ gap: 10 }}>
                    <Input
                      label="Mín"
                      value={String(f.qtdImparesMin || 6)}
                      onChangeText={v => handleChange('qtdImparesMin', parseInt(v) || 0)}
                      keyboardType="numeric"
                      style={{ width: 60 }}
                    />
                    <Input
                      label="Máx"
                      value={String(f.qtdImparesMax || 9)}
                      onChangeText={v => handleChange('qtdImparesMax', parseInt(v) || 0)}
                      keyboardType="numeric"
                      style={{ width: 60 }}
                    />
                  </Linha>
                </View>
              </Linha>
            </Card>
            
            <Card>
              <Titulo nivel={3} style={{ marginBottom: 12 }}>Limites por Linha e Coluna (Volante)</Titulo>
              <Linha alinhamento="space-around">
                <View style={{ flex: 1 }}>
                  <Input
                    label="Máx. por Linha"
                    value={String(f.maxPorLinha || 4)}
                    onChangeText={v => handleChange('maxPorLinha', parseInt(v) || 0)}
                    keyboardType="numeric"
                    helperText="5 linhas de 5 números"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Máx. por Coluna"
                    value={String(f.maxPorColuna || 4)}
                    onChangeText={v => handleChange('maxPorColuna', parseInt(v) || 0)}
                    keyboardType="numeric"
                    helperText="5 colunas de 5 números"
                  />
                </View>
              </Linha>
            </Card>
          </View>
        );
      
      case 3: // Avançado
        return (
          <View style={{ gap: 16 }}>
            <Titulo nivel={3}>Configurações Avançadas</Titulo>
            
            <Card>
              <Titulo nivel={3} style={{ marginBottom: 12 }}>Dezenas Obrigatórias</Titulo>
              <Texto tamanho="sm" cor="#666" style={{ marginBottom: 8 }}>
                Estas dezenas SEMPRE estarão em todos os jogos gerados.
              </Texto>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {Array.from({ length: 25 }, (_, i) => i + 1).map(n => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => handleArrayChange('exigirDezenas', n, !(f.exigirDezenas||[]).includes(n))}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: (f.exigirDezenas||[]).includes(n) ? '#2E7D32' : '#f0f0f0',
                      borderWidth: 1,
                      borderColor: (f.exigirDezenas||[]).includes(n) ? '#2E7D32' : '#ddd',
                    }}
                  >
                    <Texto 
                      tamanho="sm" 
                      peso="bold" 
                      cor={(f.exigirDezenas||[]).includes(n) ? '#fff' : '#333'}
                    >
                      {n.toString().padStart(2, '0')}
                    </Texto>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
            
            <Card>
              <Titulo nivel={3} style={{ marginBottom: 12 }}>Dezenas Excluídas</Titulo>
              <Texto tamanho="sm" cor="#666" style={{ marginBottom: 8 }}>
                Estas dezenas NUNCA aparecerão nos jogos gerados.
              </Texto>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {Array.from({ length: 25 }, (_, i) => i + 1).map(n => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => handleArrayChange('excluirDezenas', n, !(f.excluirDezenas||[]).includes(n))}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: (f.excluirDezenas||[]).includes(n) ? '#C62828' : '#f0f0f0',
                      borderWidth: 1,
                      borderColor: (f.excluirDezenas||[]).includes(n) ? '#C62828' : '#ddd',
                    }}
                  >
                    <Texto 
                      tamanho="sm" 
                      peso="bold" 
                      cor={(f.excluirDezenas||[]).includes(n) ? '#fff' : '#333'}
                    >
                      {n.toString().padStart(2, '0')}
                    </Texto>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
            
            <Card>
              <Linha alinhamento="center" style={{ gap: 10 }}>
                <Icones.Configuracoes size={20} color={cores.primario} />
                <Texto peso="medium">Fórmula Ativa</Texto>
              </Linha>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Texto>Será usada como padrão na geração de jogos</Texto>
                <Switch
                  value={f.ativa ?? true}
                  onValueChange={v => handleChange('ativa', v)}
                  trackColor={{ false: '#ccc', true: cores.primario }}
                  thumbColor={cores.primario}
                />
              </View>
            </Card>
          </View>
        );
      
      default:
        return null;
    }
  };
  
  if (carregando && formulas.length === 0) {
    return (
      <SafeArea>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Icones.Formula size={60} color={cores.primario} />
          <Texto tamanho="lg" peso="medium" style={{ marginTop: 16 }}>
            Carregando suas fórmulas...
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
            <Titulo nivel={2}>Minhas Fórmulas</Titulo>
            <Subtitulo>{formulas.length} fórmula{formulas.length !== 1 ? 's' : ''} salva{formulas.length !== 1 ? 's' : ''}</Subtitle>
          </View>
          <Botao 
            variant="primario" 
            tamanho="medio"
            onPress={() => { inicializarForm(); setMostrarModal(true); }}
            iconeEsquerda={<Icones.Adicionar size={20} />}
          >
            Nova Fórmula
          </Botao>
        </Linha>
        
        {/* Lista de fórmulas */}
        {formulas.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <Icones.Formula size={64} color="#ccc" />
            <Texto tamanho="lg" peso="medium" style={{ marginTop: 16, textAlign: 'center' }}>
              Nenhuma fórmula criada ainda
            </Texto>
            <Texto tamanho="md" cor="#888" style={{ marginTop: 8, textAlign: 'center' }}>
              Crie sua primeira fórmula baseada na análise estatística
            </Texto>
            <Botao 
              variant="primario" 
              tamanho="grande"
              style={{ marginTop: 16, minWidth: 200 }}
              onPress={() => { inicializarForm(); setMostrarModal(true); }}
              iconeEsquerda={<Icones.Adicionar size={20} />}
            >
              Criar Minha Fórmula
            </Botao>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {formulas.map(formula => (
              <Card key={formula.id} onPress={() => { setEditando(formula); inicializarForm(formula); setMostrarModal(true); }}>
                <Linha alinhamento="space-between">
                  <Coluna>
                    <Linha alinhamento="center" style={{ gap: 8, marginBottom: 4 }}>
                      {formula.ativa && <Badge variant="success" tamanho="pequeno">Ativa</Badge>}
                      <Texto tamanho="lg" peso="bold" style={{ flex: 1 }}>
                        {formula.nome}
                      </Texto>
                    </Linha>
                    {formula.descricao && <Texto tamanho="sm" cor="#666">{formula.descricao}</Texto>}
                    <Linha alinhamento="center" style={{ gap: 16, marginTop: 8 }}>
                      <Linha alinhamento="center" style={{ gap: 4 }}>
                        <Icones.Fogo size={16} color="#C62828" />
                        <Texto tamanho="xs">Quentes: {formula.qtdQuentes}</Texto>
                      </Linha>
                      <Linha alinhamento="center" style={{ gap: 4 }}>
                        <Icones.Neve size={16} color="#1565C0" />
                        <Texto tamanho="xs">Frias: {formula.qtdFrias}</Texto>
                      </Linha>
                      <Linha alinhamento="center" style={{ gap: 4 }}>
                        <Icones.Estrella size={16} color="#F57F17" />
                        <Texto tamanho="xs">Aleatórias: {formula.qtdAleatorias}</Texto>
                      </Linha>
                      <Linha alinhamento="center" style={{ gap: 4 }}>
                        <Icones.Coracao size={16} color="#E91E63" />
                        <Texto tamanho="xs">Favoritas: {formula.qtdFavoritas}</Texto>
                      </Linha>
                      <Linha alinhamento="center" style={{ gap: 4 }}>
                        <Icones.Verificado size={16} color="#2E7D32" />
                        <Texto tamanho="xs">Usada {formula.vezesUsada}x</Texto>
                      </Linha>
                    </Linha>
                  </Coluna>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Botao variant="outline" tamanho="pequeno" onPress={() => testarFormula()} style={{ minWidth: 80 }}>
                      Testar
                    </Botao>
                    <Botao variant="outline" tamanho="pequeno" onPress={() => duplicar(formula.id, `${formula.nome} (Cópia)`)} style={{ minWidth: 80 }}>
                      Copiar
                    </Botao>
                    <Botao variant="outline" tamanho="pequeno" onPress={() => confirmarDeletar(formula)} style={{ minWidth: 80 }}>
                      Excluir
                    </Botao>
                  </View>
                </Linha>
              </Card>
            ))}
          </View>
        )}
        
        {formulas.length > 0 && (
          <>
            <Separador />
            <Card style={{ padding: 16 }}>
              <Titulo nivel={3}>💡 Dicas para Boas Fórmulas</Titulo>
              <View style={{ gap: 8, marginTop: 8 }}>
                <Linha alinhamento="center" style={{ gap: 8 }}>
                  <Icones.Verificado size={18} color="#2E7D32" />
                  <Texto tamanho="sm">Use 16-20 números base para fechamentos eficazes</Texto>
                </Linha>
                <Linha alinhamento="center" style={{ gap: 8 }}>
                  <Icones.Verificado size={18} color="#2E7D32" />
                  <Texto tamanho="sm">Equilibre quentes (30%) + frias (25%) + aleatórias (25%) + favoritas (20%)</Texto>
                </Linha>
                <Linha alinhamento="center" style={{ gap: 8 }}>
                  <Icones.Verificado size={18} color="#2E7D32" />
                  <Texto tamanho="sm">Soma entre 160-220 cobre 80% dos resultados históricos</Texto>
                </Linha>
                <Linha alinhamento="center" style={{ gap: 8 }}>
                  <Icones.Verificado size={18} color="#2E7D32" />
                  <Texto tamanho="sm">6-9 pares e 6-9 ímpares é o padrão mais frequente</Texto>
                </Linha>
                <Linha alinhamento="center" style={{ gap: 8 }}>
                  <Icones.Verificado size={18} color="#2E7D32" />
                  <Texto tamanho="sm">Máximo 4 por linha/coluna evita concentração excessiva</Texto>
                </Linha>
              </View>
            </Card>
          </>
        )}
      </Scroll>
      
      {/* Modal de Criação/Edição */}
      <Modal visible={mostrarModal} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View style={{ 
            backgroundColor: cores.superficie, 
            borderTopLeftRadius: 20, 
            borderTopRightRadius: 20,
            maxHeight: '90%',
          }}>
            {/* Header do Modal */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderColor: cores.borda,
            }}>
              <Botao variant="outline" tamanho="pequeno" onPress={passoAnterior} desabilitado={passoAtual === 0}>
                <Icones.SetaDireita size={18} style={{ transform: [{ rotate: '180deg' }] }} />
              </Botao>
              <Texto tamanho="lg" peso="bold">
                {editando ? 'Editar Fórmula' : 'Nova Fórmula'}
              </Texto>
              <Botao variant="outline" tamanho="pequeno" onPress={() => setMostrarModal(false)}>
                <Icones.Fechar size={20} />
              </Botao>
            </View>
            
            {/* Indicador de passos */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, padding: 12 }}>
              {passos.map((passo, i) => (
                <View key={passo.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: i < passoAtual ? cores.sucesso : i === passoAtual ? cores.primario : cores.borda,
                  }}>
                    <Texto tamanho="xs" peso="bold" cor={i <= passoAtual ? '#fff' : cores.textoSecundario}>
                      {i + 1}
                    </Texto>
                  </View>
                  {i < passos.length - 1 && <View style={{ width: 30, height: 2, backgroundColor: i < passoAtual ? cores.sucesso : cores.borda }} />}
                </View>
              ))}
            </View>
            
            {/* Erros */}
            {erros.length > 0 && (
              <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                <Card style={{ backgroundColor: '#FFEBEE', padding: 12 }}>
                  <Linha alinhamento="center" style={{ gap: 8 }}>
                    <Icones.Alerta size={20} color="#C62828" />
                    <Coluna>
                      {erros.map((e, i) => <Texto key={i} tamanho="sm" cor="#C62828">• {e}</Texto>)}
                    </Coluna>
                  </Linha>
                </Card>
              </View>
            )}
            
            {/* Conteúdo do passo */}
            <Scroll style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
              {renderPasso()}
            </Scroll>
            
            {/* Botões de navegação */}
            <View style={{ 
              padding: 16, 
              borderTopWidth: 1, 
              borderColor: cores.borda,
              flexDirection: 'row',
              gap: 10,
            }}>
              {passoAtual > 0 && (
                <Botao variant="outline" larguraTotal onPress={passoAnterior}>
                  <Icones.SetaDireita size={18} style={{ transform: [{ rotate: '180deg' }] }} />
                  Voltar
                </Botao>
              )}
              <Botao 
                variant={passoAtual === passos.length - 1 ? 'primario' : 'primario'} 
                larguraTotal 
                onPress={passoAtual === passos.length - 1 ? salvarFormula : proximoPasso}
              >
                {passoAtual === passos.length - 1 ? 'Salvar Fórmula' : 'Próximo'}
                {passoAtual < passos.length - 1 && <Icones.SetaDireita size={18} />}
              </Botao>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeArea>
  );
}

import { TEMA_CORES } from '@/constants';