# @orra-ui/react

React 19 + Tailwind CSS v4 design system for dashboards and AI-agent interfaces: base components, agent components, chart cards and blocks, built on React Aria and Motion. Dark mode and RTL out of the box.

```bash
npm install @orra-ui/react
```

```css
@import "tailwindcss";
@import "@orra-ui/react/styles.css";
```

```tsx
import { Button, Select, SelectItem, StatCards } from "@orra-ui/react";
```

Deep imports are available too: `@orra-ui/react/components/button/button`, `@orra-ui/react/lib/cx`, `@orra-ui/react/lib/theme`.

- Docs, live previews and props: run the docs site (`apps/docs`) or see the repository README.
- AI agents: `npx -y @orra-ui/cli mcp` (MCP server) and `npx @orra-ui/cli skill`.

MIT
