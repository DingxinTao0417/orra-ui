/** Brand + package identity. Change these in one place to rename the library. */
export const site = {
  name: "Orra UI",
  shortName: "Orra",
  description: "为仪表盘与智能体界面打造的 React + Tailwind CSS v4 设计系统。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3200",
  packageName: "@orra-ui/react",
  cliPackage: "@orra-ui/cli",
  bin: "orra-ui",
  repo: "https://github.com/DingxinTao0417/orra-ui",
  npm: "https://www.npmjs.com/package/@orra-ui/react",
} as const;
