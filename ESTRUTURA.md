# Estrutura do Projeto — app-financas

Este documento descreve a organização de pastas do app, criado com Expo (React Native) + Expo Router.

## Visão geral

```
app-financas/
├── app/                    # Telas do app (roteamento por arquivo)
│   ├── (tabs)/
│   │   ├── index.tsx       # Tela inicial
│   │   └── explore.tsx     # Segunda aba (padrão do template)
│   ├── _layout.tsx         # Layout raiz / navegação geral
│   └── +not-found.tsx      # Tela de erro 404
├── assets/                 # Imagens, ícones, fontes
├── components/             # Componentes reutilizáveis (botões, cards, listas)
├── constants/               # Cores, valores fixos, tema
├── hooks/                   # Funções reutilizáveis (ex: useColorScheme)
├── app.json                 # Configurações do app (nome, ícone, splash)
├── package.json              # Dependências do projeto
└── tsconfig.json             # Configuração do TypeScript
```

## Detalhamento das pastas principais

### `app/`
Cada arquivo dentro dessa pasta vira uma tela/rota automaticamente (Expo Router, no estilo do Next.js).
Exemplo: criar `app/adicionar-gasto.tsx` gera a rota `/adicionar-gasto` sem configuração extra.

### `app/(tabs)/`
Pasta especial — os parênteses fazem o nome não aparecer na URL/rota. Define as abas do menu inferior do app.

**Plano para o app-financas:** substituir as abas padrão (`index`, `explore`) por:
- **Início** — visão geral (saldo, últimos lançamentos)
- **Lançar Gasto** — formulário de novo gasto/receita
- **Dinheiro Guardado** — reservas e metas
- **Perfil** — configurações e login

### `app/_layout.tsx`
Controla a estrutura geral de navegação (abas, cabeçalhos, telas empilhadas).

### `components/`
Pedaços de interface reutilizados em várias telas. Exemplo: um "cartão de transação" usado tanto na tela Início quanto no histórico.

### `constants/`
Valores fixos do app — paleta de cores, espaçamentos, categorias padrão de gastos.

### `hooks/`
Funções React reutilizáveis. Futuramente vamos adicionar hooks para autenticação (Firebase Auth) e leitura de dados (Firestore).

### `assets/`
Ícone do app, splash screen, fontes customizadas.

## Arquivos de configuração

| Arquivo | Função |
|---|---|
| `app.json` | Nome do app, ícone, splash screen, permissões |
| `package.json` | Lista de dependências (bibliotecas usadas) |
| `tsconfig.json` | Configuração do TypeScript |

## Próximos módulos a adicionar

- `services/` — funções de conexão com o Firebase (Firestore, Auth)
- `types/` — tipos TypeScript (Transação, Categoria, Meta)
