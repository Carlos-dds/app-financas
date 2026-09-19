# Diretrizes de Desenvolvimento React Native & Expo

## Stack e Convenções
- Utilize **Expo** (versão mais recente do SDK) para gerenciar o projeto, builds e atualizações OTA (EAS).
- Para estilização, priorize folhas de estilo nativas (`StyleSheet.create`) ou bibliotecas de design system aprovadas (como NativeWind / Tailwind CSS se configurado).
- Evite componentes nativos puros do React Native se houver equivalentes modernos e otimizados no `@expo/ui`.

## Boas Práticas de UI/UX Mobile
- **Listas:** Sempre utilize `FlatList` ou `FlashList` (Shopify) para renderizar grandes conjuntos de dados ou listas longas. Nunca use coleções simples mapeadas dentro de `ScrollView` para dados dinâmicos.
- **Layout e Flexbox:** Defina explicitamente propriedades de `flex`, `width` e `height` nos containers principais para evitar que elementos sumam ou quebrem em diferentes tamanhos de tela (iOS/Android).
- **Tratamento de Estado e Ciclo de Vida:** Respeite o comportamento de inicialização a frio (*cold start*) e o reaparecimento de telas.

## Processo de Depuração e Qualidade
- Antes de finalizar qualquer código, verifique se há erros de tipagem TypeScript e falhas de lint.
- Ao corrigir bugs de layout, analise a árvore de componentes raiz e o posicionamento de margens/padding antes de aplicar soluções genéricas.
