# MYMENU - Frontend

## Stack

- **Vite** - Build tool
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Estrutura de Pastas

```
src/
├── components/
│   ├── consumer/      # Componentes do app consumidor
│   ├── admin/         # Componentes do admin
│   └── shared/        # Componentes compartilhados
├── pages/
│   ├── consumer/      # Páginas do consumidor
│   └── admin/         # Páginas do admin
├── lib/               # Utilitários e helpers
├── types/             # TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

## Comandos

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Paleta de Cores

- **Primary**: #C92924 (Vermelho)
- **Secondary**: #F9E7C9 (Bege/Creme)
- **Dark**: #280B0B (Marrom escuro)

### Status de Pedidos

- **Novo**: #C92924
- **Aceito**: #FF9800
- **Preparo**: #2196F3
- **Pronto**: #4CAF50
- **Finalizado**: #9E9E9E
- **Cancelado**: #F44336

## Próximos Passos

- [x] Criar design system (Button, Card, Input, Badge)
- [x] Desenvolver páginas consumer (Home, Cardápio)
- [x] Desenvolver páginas admin (Dashboard, Central de Pedidos)
- [ ] Integrar com backend (futuro)
