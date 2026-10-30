// Componentes UI base - Estilo acessível para idosos
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  Platform,
  ActivityIndicator,
  Switch,
  Modal,
  Pressable,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTema } from '@/hooks';
import { TEMA_CORES, TAMANHOS_FONTE } from '@/constants';

// ========== TIPOS ==========

interface BoxProps {
  children: React.ReactNode;
  style?: any;
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: boolean;
}

interface TextProps {
  children: React.ReactNode;
  style?: any;
  tamanho?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  peso?: 'normal' | 'bold' | 'medium';
  cor?: string;
  alinhamento?: 'left' | 'center' | 'right';
  numeroLinhas?: number;
}

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variant?: 'primario' | 'secundario' | 'outline' | 'perigo' | 'sucesso';
  tamanho?: 'pequeno' | 'medio' | 'grande';
  desabilitado?: boolean;
  carregando?: boolean;
  iconeEsquerda?: React.ReactNode;
  iconeDireita?: React.ReactNode;
  estilo?: any;
  larguraTotal?: boolean;
}

interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  elevation?: number;
  padding?: number;
}

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  tamanho?: 'pequeno' | 'medio';
  style?: any;
}

interface SeparadorProps {
  style?: any;
  marginVertical?: number;
}

interface LoadingOverlayProps {
  visivel: boolean;
  mensagem?: string;
}

// ========== COMPONENTES BASE ==========

export const Box: React.FC<BoxProps> = ({ 
  children, 
  style, 
  padding = 0, 
  margin = 0,
  backgroundColor,
  borderRadius = 0,
  borderWidth = 0,
  borderColor,
  shadow = false,
}) => {
  const { tema } = useTema();
  const cores = TEMA_CORES[tema];
  
  return (
    <View
      style={[
        styles.box,
        { padding, margin },
        { backgroundColor: backgroundColor || cores.superficie },
        { borderRadius, borderWidth, borderColor: borderColor || cores.borda },
        shadow && styles.shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const Texto: React.FC<TextProps> = ({ 
  children, 
  style, 
  tamanho = 'md', 
  peso = 'normal', 
  cor, 
  alinhamento = 'left',
  numeroLinhas,
}) => {
  const { tamanhoFonte } = useTema();
  const fontes = TAMANHOS_FONTE[tamanhoFonte];
  const { tema } = useTema();
  const cores = TEMA_CORES[tema];
  
  return (
    <Text
      style={[
        styles.texto,
        { fontSize: fontes[tamanho] },
        { fontWeight: peso === 'bold' ? '700' : peso === 'medium' ? '500' : '400' },
        { color: cor || cores.texto },
        { textAlign: alinhamento },
        { numberOfLines: numeroLinhas },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const Titulo: React.FC<{ children: React.ReactNode; nivel?: 1 | 2 | 3; style?: any }> = ({ 
  children, 
  nivel = 1, 
  style 
}) => {
  const tamanhos = { 1: 'xxxl', 2: 'xxl', 3: 'xl' };
  return <Texto tamanho={tamanhos[nivel]} peso="bold" style={style}>{children}</Texto>;
};

export const Subtitulo: React.FC<{ children: React.ReactNode; style?: any }> = ({ 
  children, 
  style 
}) => {
  return <Texto tamanho="lg" peso="medium" cor="#666" style={style}>{children}</Subtitulo>;
};

export const Botao: React.FC<BotaoProps> = ({ 
  titulo, 
  onPress, 
  variant = 'primario', 
  tamanho = 'medio', 
  desabilitado = false, 
  carregando = false,
  iconeEsquerda,
  iconeDireita,
  estilo,
  larguraTotal = false,
}) => {
  const { tema, vibrar } = useTema();
  const cores = TEMA_CORES[tema];
  const fontes = TAMANHOS_FONTE[tema === 'alto-contraste' ? 'extra-grande' : 'grande'];
  
  const tamanhos = {
    pequeno: { paddingV: 10, paddingH: 16, fontSize: fontes.sm, borderRadius: 8 },
    medio: { paddingV: 14, paddingH: 24, fontSize: fontes.md, borderRadius: 10 },
    grande: { paddingV: 18, paddingH: 32, fontSize: fontes.lg, borderRadius: 12 },
  };
  
  const variacoes = {
    primario: { bg: cores.primario, text: '#fff', border: cores.primario },
    secundario: { bg: cores.secundario, text: '#000', border: cores.secundario },
    outline: { bg: 'transparent', text: cores.primario, border: cores.primario },
    perigo: { bg: cores.erro, text: '#fff', border: cores.erro },
    sucesso: { bg: cores.sucesso, text: '#fff', border: cores.sucesso },
  };
  
  const { paddingV, paddingH, fontSize, borderRadius } = tamanhos[tamanho];
  const { bg, text, border } = variacoes[variant];
  
  const handlePress = () => {
    if (!desabilitado && !carregando) {
      vibrar('light');
      onPress();
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.botao,
        { backgroundColor: desabilitado ? '#999' : bg },
        { borderColor: desabilitado ? '#999' : border },
        { borderWidth: variant === 'outline' ? 2 : 0 },
        { paddingVertical: paddingV, paddingHorizontal: paddingH },
        { borderRadius },
        { width: larguraTotal ? '100%' : 'auto' },
        { opacity: desabilitado || carregando ? 0.7 : 1 },
        estilo,
      ]}
      onPress={handlePress}
      disabled={desabilitado || carregando}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado || carregando }}
      accessibilityLabel={carregando ? 'Carregando' : titulo}
    >
      {carregando ? (
        <ActivityIndicator color={text} size="small" />
      ) : (
        <View style={styles.botaoConteudo}>
          {iconeEsquerda && <View style={styles.botaoIconeEsquerda}>{iconeEsquerda}</View>}
          <Texto 
            tamanho="md" 
            peso="bold" 
            cor={text} 
            style={{ fontSize, marginHorizontal: iconeEsquerda || iconeDireita ? 6 : 0 }}
          >
            {titulo}
          </Texto>
          {iconeDireita && <View style={styles.botaoIconeDireita}>{iconeDireita}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  onPress, 
  elevation = 2, 
  padding = 16 
}) => {
  const { tema } = useTema();
  const cores = TEMA_CORES[tema];
  
  const Component = onPress ? Pressable : View;
  
  return (
    <Component
      style={[
        styles.card,
        { backgroundColor: cores.superficie },
        { padding },
        { elevation: Platform.OS === 'android' ? elevation : 0 },
        { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
        style,
      ]}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { disabled: false } : undefined}
    >
      {children}
    </Component>
  );
};

export const Input: React.FC<InputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry = false, 
  keyboardType = 'default',
  error, 
  helperText, 
  leftIcon, 
  rightIcon, 
  disabled = false, 
  multiline = false, 
  numberOfLines = 4,
  style,
}) => {
  const { tema } = useTema();
  const cores = TEMA_CORES[tema];
  const fontes = TAMANHOS_FONTE[tema === 'alto-contraste' ? 'extra-grande' : 'grande'];
  
  return (
    <View style={[styles.inputContainer, style]}>
      {label && (
        <Texto tamanho="sm" peso="medium" style={styles.inputLabel}>
          {label}
        </Texto>
      )}
      <View style={[
        styles.inputWrapper, 
        { borderColor: error ? cores.erro : disabled ? '#ccc' : cores.borda },
        { backgroundColor: disabled ? '#f5f5f5' : cores.superficie },
      ]}>
        {leftIcon && <View style={styles.inputIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input, 
            { fontSize: fontes.md },
            { color: cores.texto },
            { paddingLeft: leftIcon ? 0 : undefined },
            { paddingRight: rightIcon ? 0 : undefined },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={cores.textoSecundario}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          disabled={disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="none"
          accessibilityLabel={label}
          accessibilityInvalid={!!error}
        />
        {rightIcon && <View style={styles.inputIcon}>{rightIcon}</View>}
      </View>
      {error && <Texto tamanho="xs" cor={cores.erro} style={styles.inputError}>{error}</Texto>}
      {helperText && !error && <Texto tamanho="xs" cor={cores.textoSecundario} style={styles.inputHelper}>{helperText}</Texto>}
    </View>
  );
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', tamanho = 'medio', style }) => {
  const { tema } = useTema();
  const cores = TEMA_CORES[tema];
  const fontes = TAMANHOS_FONTE[tema === 'alto-contraste' ? 'extra-grande' : 'grande'];
  
  const variacoes = {
    default: { bg: cores.borda, text: cores.texto },
    success: { bg: cores.sucesso + '20', text: cores.sucesso },
    warning: { bg: cores.aviso + '20', text: cores.aviso },
    error: { bg: cores.erro + '20', text: cores.erro },
    info: { bg: cores.primario + '20', text: cores.primario },
  };
  
  const { bg, text } = variacoes[variant];
  const paddingV = tamanho === 'pequeno' ? 2 : 4;
  const paddingH = tamanho === 'pequeno' ? 6 : 10;
  const fontSize = tamanho === 'pequeno' ? fontes.xs : fontes.sm;
  const borderRadius = tamanho === 'pequeno' ? 4 : 6;
  
  return (
    <View style={[
      styles.badge,
      { backgroundColor: bg },
      { paddingVertical: paddingV, paddingHorizontal: paddingH },
      { borderRadius },
      style,
    ]}>
      <Texto tamanho="xs" peso="medium" cor={text} style={{ fontSize }}>
        {children}
      </Texto>
    </View>
  );
};

export const Separador: React.FC<SeparadorProps> = ({ style, marginVertical = 16 }) => {
  const { tema } = useTema();
  const cores = TEMA_CORES[tema];
  
  return (
    <View style={[
      styles.separador,
      { borderColor: cores.borda },
      { marginVertical },
      style,
    ]} />
  );
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visivel, mensagem = 'Carregando...' }) => {
  if (!visivel) return null;
  
  const { tema } = useTema();
  const cores = TEMA_CORES[tema];
  
  return (
    <View style={[
      styles.loadingOverlay,
      { backgroundColor: tema === 'alto-contraste' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)' },
    ]}>
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={cores.primario} />
        <Texto tamanho="md" peso="medium" cor={cores.texto} style={{ marginTop: 16 }}>
          {mensagem}
        </Texto>
      </View>
    </View>
  );
};

export const SafeArea: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { tema } = useTema();
  const cores = TEMA_CORES[tema];
  
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: cores.fundo }, style]}>
      <StatusBar 
        barStyle={tema === 'escuro' || tema === 'alto-contraste' ? 'light-content' : 'dark-content'} 
        backgroundColor={cores.fundo}
      />
      {children}
    </SafeAreaView>
  );
};

export const Scroll: React.FC<{ children: React.ReactNode; style?: any; contentContainerStyle?: any }> = ({ 
  children, 
  style, 
  contentContainerStyle 
}) => {
  const { tema } = useTema();
  const cores = TEMA_CORES[tema];
  
  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: cores.fundo }, style]}
      contentContainerStyle={[{ paddingBottom: 40 }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
};

export const Linha: React.FC<{ children: React.ReactNode; style?: any; alinhamento?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' }> = ({ 
  children, 
  style, 
  alinhamento = 'start' 
}) => {
  return (
    <View style={[
      styles.linha,
      { justifyContent: alinhamento },
      style,
    ]}>
      {children}
    </View>
  );
};

export const Coluna: React.FC<{ children: React.ReactNode; style?: any; flex?: number }> = ({ 
  children, 
  style, 
  flex 
}) => {
  return (
    <View style={[
      styles.coluna,
      { flex: flex ?? 1 },
      style,
    ]}>
      {children}
    </View>
  );
};

// ========== ESTILOS ==========

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  texto: {},
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  botaoConteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoIconeEsquerda: {
    marginRight: 8,
  },
  botaoIconeDireita: {
    marginLeft: 8,
  },
  card: {
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 4,
  },
  inputContainer: {
    marginVertical: 6,
    width: '100%',
  },
  inputLabel: {
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 52,
  },
  inputIcon: {
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  inputError: {
    marginTop: 4,
    marginLeft: 4,
  },
  inputHelper: {
    marginTop: 4,
    marginLeft: 4,
  },
  badge: {
    borderRadius: 999,
  },
  separador: {
    borderBottomWidth: 1,
    width: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingBox: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  coluna: {
    flexDirection: 'column',
  },
});

// ========== ÍCONES SVG SIMPLES ==========

export const Icones = {
  Home: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🏠</Text>
    </View>
  ),
  Grafico: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>📊</Text>
    </View>
  ),
  Formula: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🧮</Text>
    </View>
  ),
  Jogos: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🎫</Text>
    </View>
  ),
  Historico: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>📋</Text>
    </View>
  ),
  Config: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>⚙️</Text>
    </View>
  ),
  Adicionar: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 1.2, color }}>➕</Text>
    </View>
  ),
  Editar: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>✏️</Text>
    </View>
  ),
  Deletar: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🗑️</Text>
    </View>
  ),
  Copiar: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>📋</Text>
    </View>
  ),
  Compartilhar: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>📤</Text>
    </View>
  ),
  Atualizar: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🔄</Text>
    </View>
  ),
  Sincronizar: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>☁️</Text>
    </View>
  ),
  Alerta: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🔔</Text>
    </View>
  ),
  Informacao: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>ℹ️</Text>
    </View>
  ),
  Verificado: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>✅</Text>
    </View>
  ),
  Estrella: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>⭐</Text>
    </View>
  ),
  Fogo: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🔥</Text>
    </View>
  ),
  Neve: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>❄️</Text>
    </View>
  ),
  Coracao: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>❤️</Text>
    </View>
  ),
  SetaDireita: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>▶️</Text>
    </View>
  ),
  SetaBaixo: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>▼</Text>
    </View>
  ),
  Fechar: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>✕</Text>
    </View>
  ),
  Lupa: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🔍</Text>
    </View>
  ),
  Calendario: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>📅</Text>
    </View>
  ),
  Relogio: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🕐</Text>
    </View>
  ),
  Dinheiro: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>💰</Text>
    </View>
  ),
  Premio: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🏆</Text>
    </View>
  ),
  Configuracoes: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>⚙️</Text>
    </View>
  ),
  Backup: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>💾</Text>
    </View>
  ),
  Restaurar: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>📥</Text>
    </View>
  ),
  Ajuda: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>❓</Text>
    </View>
  ),
  Sobre: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>ℹ️</Text>
    </View>
  ),
  Voz: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🔊</Text>
    </View>
  ),
  Vibracao: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>📳</Text>
    </View>
  ),
  Tema: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🎨</Text>
    </View>
  ),
  Fonte: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>🔤</Text>
    </View>
  ),
  Contraste: ({ size = 24, color = '#000' }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.9, color }}>☀️</Text>
    </View>
  ),
  Numero: ({ numero, size = 24, color = '#000', bg, status }) => {
    const { tema } = useTema();
    const cores = TEMA_CORES[tema];
    const fundo = bg || (status ? getCorFundoStatus(status) : cores.superficieVariante);
    const corTexto = color || (status ? getCorStatus(status) : cores.texto);
    
    return (
      <View style={[
        styles.numeroBadge,
        { width: size, height: size, backgroundColor: fundo },
        { borderRadius: size / 2 },
      ]}>
        <Texto 
          tamanho="sm" 
          peso="bold" 
          cor={corTexto} 
          alinhamento="center"
          style={{ fontSize: size * 0.35, lineHeight: size * 0.4 }}
        >
          {numero.toString().padStart(2, '0')}
        </Texto>
      </View>
    );
  },
};

// Adicionar estilo do numeroBadge
const numeroBadgeStyles = StyleSheet.create({
  numeroBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default styles;