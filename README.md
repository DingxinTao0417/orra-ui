<p align="center"><img src="brand/orra-icon.svg" width="72" height="72" alt="Orra UI" /></p>

<h1 align="center">Orra UI</h1>

为仪表盘与 AI 智能体界面打造的 React + Tailwind CSS v4 设计系统：组件库 + 文档站（搜索、实时预览）+ npm 包 + CLI + MCP 服务器 + 智能体技能。

```bash
pnpm add @orra-ui/react
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@orra-ui/react/styles.css";
```

```tsx
import { Button } from "@orra-ui/react";
import { RiAddLine } from "@remixicon/react";

export default function Page() {
  return <Button startIcon={<RiAddLine />}>新建项目</Button>;
}
```

## 仓库结构

```
packages/
  styles/    @orra-ui/styles  框架无关的设计变量、字号体系与组件 CSS（React 与以后的 Vue 共用）
  react/     @orra-ui/react   React 组件库源码（components/<slug>/ 每个组件一个目录，lib/ 共享基础：cx、样式配方、文案、主题）
  cli/       @orra-ui/cli     CLI（init / add / list / search / info / skill）+ MCP 服务器
apps/
  docs/      文档站（Next.js）：组件搜索、实时预览、代码、属性表、模板、指南
    registry/items/*.json        每个组件的文档元数据（唯一数据源）
    registry/templates/*.json    模板元数据
    demos/<slug>/*.tsx           实时演示（同时作为 MCP/CLI 的用法示例）
    templates/                   模板页面的源码
skills/
  orra-ui/                    智能体技能（SKILL.md + references）
scripts/
  build-registry.mjs             从 registry 生成：文档站数据、/r/*.json、CLI 注册表、技能组件目录
```

一份注册表驱动所有出口：文档站、`/r/<slug>.json`、CLI、MCP 服务器和技能里的组件目录，所以人看到的和智能体拿到的永远一致。

## 开发

```bash
pnpm install
pnpm dev            # 构建组件库 + 注册表，启动文档站 http://localhost:3200（组件库 watch 模式）
pnpm build          # 依次构建 ui → registry → cli → docs
pnpm typecheck
```

新增或修改组件文档：编辑 `apps/docs/registry/items/<slug>.json` 与 `apps/docs/demos/<slug>/`，然后 `pnpm registry`。规范见 [apps/docs/registry/AUTHORING.md](apps/docs/registry/AUTHORING.md)。

新增组件：在 `packages/react/src` 下添加源码（`index.ts` 会在构建时自动生成导出），再按上面的方式补文档。

## 发布到 npm

需要先在 npm 上拥有 `@orra-ui` 组织，并在本机 `npm login`。三个包按依赖顺序发布，并且必须用 **pnpm publish**（它会把 `workspace:^` 依赖改写成真实版本号，npm publish 不会）：

```bash
pnpm build:packages
pnpm --filter @orra-ui/styles publish --access public
pnpm --filter @orra-ui/react publish --access public
pnpm --filter @orra-ui/cli publish --access public
```

发布时 npm 会要求输入两步验证码。之后升级版本：同时修改三个 package.json 的 version，再按同样顺序发布。

## 接入 AI 智能体

```bash
# MCP 服务器（Claude Code）
claude mcp add orra-ui -- npx -y @orra-ui/cli mcp

# 智能体技能 + 常驻规则（.claude/skills、AGENTS.md，可选 Cursor 规则）
npx @orra-ui/cli skill --target all
```

## 致谢

组件构建于 [React Aria](https://react-spectrum.adobe.com/react-aria/)、[Tailwind CSS](https://tailwindcss.com)、[Motion](https://motion.dev)、[Recharts](https://recharts.org) 与 [Remix Icon](https://remixicon.com) 之上。

## License

MIT
