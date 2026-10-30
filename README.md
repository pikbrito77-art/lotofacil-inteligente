# Lotofácil Inteligente - App Completo

Aplicativo móvel (Android/iOS) para análise estatística da Lotofácil, baseado nas técnicas do vídeo "Nova TÉCNICA na LOTOFÁCIL: Usei o CHATGPT!" do canal Curso de Excel Online.

## 🎯 Funcionalidades Principais

### 📊 Análise Estatística Completa
- **Frequência de dezenas** (quentes/mornas/frias) baseada nos últimos 12 concursos
- **Distribuição Pares/Ímpares** com recomendações baseadas no histórico
- **Análise de Soma Total** com faixa ideal calculada via desvio padrão
- **Repetições consecutivas** - dezenas que saem em sorteios seguidos
- **Visualização por linhas e colunas** do volante

### 🧮 Fórmulas Personalizadas (Método 5-5-5-3)
- **5 dezenas quentes** (maior frequência)
- **5 dezenas frias/atrasadas** (lei dos grandes números)
- **5 dezenas aleatórias** (entropia)
- **3 dezenas favoritas** (números pessoais, datas)
- **Filtros avançados**: soma, pares/ímpares, limites por linha/coluna
- **Dezenas obrigatórias e excluídas**

### 🎫 Geração de Jogos com Fechamentos Matemáticos
- **Fechamento 16 números → 8 jogos** (garantia 13 pts se 15∈16)
- **Fechamento 17 números → 16 jogos** (garantia 13 pts se 15∈17)
- **Fechamento 18 números → 24 jogos** (garantia 14 pts se 15∈18) ⭐ *Mais popular*
- **Fechamento 19 números → 48 jogos** (garantia 14 pts se 15∈19)
- **Fechamento 20 números → 96 jogos** (garantia 14 pts se 15∈20)

### ✅ Conferência Automática
- Busca resultados oficiais da Caixa (APIs redundantes)
- Conferência instantânea dos jogos gerados
- Cálculo de prêmios estimados por faixa (11 a 15 pontos)
- Notificações push de resultados

### 👴 Interface Adaptada para Idosos (Aposentados)
- **3 tamanhos de fonte** (Normal, Grande, Extra Grande)
- **3 temas visuais** (Claro, Escuro, Alto Contraste)
- **Leitura por voz** (Text-to-Speech em português)
- **Feedback tátil** (vibração em ações importantes)
- **Botões grandes** com espaçamento generoso
- **Cores de alto contraste** para daltonismo
- **Navegação simples** com abas fixas na parte inferior

### 💾 Dados Offline-First
- Banco SQLite local (expo-sqlite)
- Sincronização automática com APIs da Caixa
- Backup/Restore completo em JSON
- Funciona 100% offline após primeira sincronização

## 🛠 Tecnologias

- **React Native** com **Expo Router** (navegação baseada em arquivos)
- **TypeScript** tipagem forte
- **expo-sqlite** para banco de dados local
- **expo-notifications** para alertas push
- **expo-speech** para síntese de voz (PT-BR)
- **expo-haptics** para feedback tátil
- **axios** para requisições HTTP
- **date-fns** para manipulação de datas
- **AsyncStorage** para configurações persistentes

## 📱 Telas do App

| Aba | Função |
|-----|--------|
| 🏠 **Início** | Próximo sorteio, último resultado, ações rápidas, dicas |
| 📊 **Análise** | Estatísticas completas dos últimos 12 concursos |
| 🧮 **Fórmulas** | Criar/editar fórmulas personalizadas (wizard 4 passos) |
| 🎫 **Meus Jogos** | Gerar jogos com fechamentos, conferir resultados |
| ✅ **Resultados** | Selecionar concurso, conferir todos os jogos de uma vez |
| 📋 **Histórico** | Estatísticas globais, desempenho por fórmula, exportar |
| ⚙️ **Configurações** | Tema, fonte, voz, vibração, notificações, backup, zona de perigo |

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Expo CLI: `npm install -g @expo/cli`
- Android Studio (para emulador Android) ou Xcode (para iOS)

### Instalação

```bash
# 1. Entre na pasta do projeto
cd lotofacil-app

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm start

# 4. Escolha a plataforma:
#    - Pressione 'a' para Android
#    - Pressione 'i' para iOS
#    - Pressione 'w' para Web
#    - Escaneie o QR code com o app Expo Go no celular
```

### Build para Produção

```bash
# Android (APK/AAB)
eas build --platform android

# iOS (IPA)
eas build --platform ios

# Ambos
eas build --platform all
```

## 📦 Estrutura do Projeto

```
lotofacil-app/
├── app/                    # Rotas (Expo Router)
│   ├── _layout.tsx         # Stack principal
│   ├── (tabs)/             # Abas inferiores
│   │   ├── _layout.tsx     # Configuração das tabs
│   │   ├── index.tsx       # Home
│   │   ├── analysis.tsx    # Análise estatística
│   │   ├── formulas.tsx    # Fórmulas personalizadas
│   │   ├── jogos.tsx       # Meus jogos
│   │   ├── results.tsx     # Resultados/Conferência
│   │   ├── history.tsx     # Histórico/Estatísticas
│   │   └── settings.tsx    # Configurações
│   └── +not-found.tsx      # 404
├── src/
│   ├── components/         # Componentes React
│   │   └── ui/             # UI base (Button, Card, Input, etc.)
│   ├── hooks/              # Custom hooks (useConcursos, useFormulas, etc.)
│   ├── services/           # Serviços (API, Database, Analysis)
│   │   ├── api.ts          # APIs da Caixa (com fallback)
│   │   ├── database.ts     # SQLite CRUD completo
│   │   └── analysis.ts     # Motor estatístico
│   ├── utils/              # Utilitários (formatação, validação, etc.)
│   ├── types/              # TypeScript interfaces
│   └── constants/          # Constantes e configurações
├── assets/                 # Ícones, splash, fontes
├── package.json
├── app.json               # Config Expo
├── tsconfig.json
└── README.md
```

## 🔌 APIs Utilizadas

### Primária
- **Loterias Caixa API** (Heroku): `https://loteriascaixa-api.herokuapp.com/api/lotofacil`

### Fallback
- **BR-API**: `https://br-api.com/api/lotofacil`

Ambas fornecem:
- Último concurso
- Concurso por número
- Últimos N concursos
- Premiações por faixa
- Próximo concurso estimado

## 🎨 Personalização Visual

### Temas Disponíveis
```typescript
// src/constants/index.ts
TEMA_CORES = {
  claro: { fundo: '#FAFAFA', primario: '#1B5E20', ... },
  escuro: { fundo: '#121212', primario: '#4CAF50', ... },
  'alto-contraste': { fundo: '#000000', primario: '#FFFF00', ... }
}
```

### Tamanhos de Fonte
```typescript
TAMANHOS_FONTE = {
  normal: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28, xxxl: 36 },
  grande: { xs: 14, sm: 16, md: 18, lg: 22, xl: 26, xxl: 32, xxxl: 42 },
  'extra-grande': { xs: 16, sm: 18, md: 22, lg: 26, xl: 32, xxl: 40, xxxl: 48 }
}
```

## 🔔 Notificações Configuráveis

- **Resultados**: Aviso imediato quando novo concurso sai
- **Dicas Semanais**: Sugestões baseadas na análise (segundas-feiras)
- **Lembrete de Jogo**: Dias/horários personalizáveis (padrão: Seg/Qua/Sex às 18h)

## 💾 Backup e Restauração

O backup exporta TUDO em um único JSON:
```json
{
  "versao": "1.0",
  "exportadoEm": "2024-01-15T10:30:00.000Z",
  "concursos": [...],
  "formulas": [...],
  "jogos": [...],
  "configuracoes": {...},
  "estatisticas": {...}
}
```

## ⚠️ Avisos Importantes

1. **Jogue com responsabilidade** - Este app é uma ferramenta de análise, não garante prêmios
2. **Proibido para menores de 18 anos**
3. **Dados oficiais da Caixa** - O app apenas consome APIs públicas
4. **Sem garantia de ganhos** - A loteria é jogo de azar; a análise apenas inclina probabilidades
5. **Gerencie sua banca** - Nunca aposte dinheiro que fará falta

## 📄 Licença

MIT License - Livre para uso pessoal e comercial.

## 🤝 Contribuição

PRs são bem-vindos! Áreas prioritárias:
- Mais fechamentos matemáticos
- Integração com mais APIs de loteria
- Testes automatizados
- Internacionalização (EN/ES)
- Widgets para tela inicial

## 📞 Suporte

- Email: suporte@lotofacilinteligente.app
- Issues: GitHub Issues
- Documentação: `/docs` (a criar)

---

**Desenvolvido com ❤️ para a comunidade apostadora brasileira**

*Baseado nas técnicas do vídeo "Nova TÉCNICA na LOTOFÁCIL: Usei o CHATGPT!" - Curso de Excel Online*