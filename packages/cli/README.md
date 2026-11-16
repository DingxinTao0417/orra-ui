# @orra-ui/cli

CLI and MCP server for the Orra UI design system. Works offline: the component registry ships inside the package.

```bash
npx @orra-ui/cli init                 # install @orra-ui/react and wire the stylesheet
npx @orra-ui/cli add button select    # copy component source into components/orra-ui/
npx @orra-ui/cli list | search <q> | info <name>
npx @orra-ui/cli skill --target all   # agent skill (.claude/skills), AGENTS.md rules, Cursor rules
npx -y @orra-ui/cli mcp               # MCP server over stdio
```

MCP config:

```json
{ "mcpServers": { "orra-ui": { "command": "npx", "args": ["-y", "@orra-ui/cli", "mcp"] } } }
```

Tools: `list_components`, `search_components`, `get_component`, `get_component_source`, `get_design_rules`, `get_theme`, `get_patterns`, `get_setup_guide`, `add_components`.

MIT
