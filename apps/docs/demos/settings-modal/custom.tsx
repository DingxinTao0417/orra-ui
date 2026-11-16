"use client";

import { useState } from "react";
import { RiKey2Line, RiShieldUserLine, RiTeamLine } from "@remixicon/react";
import {
  Avatar,
  Badge,
  Button,
  Input,
  Select,
  SelectItem,
  SettingsGroup,
  SettingsModal,
  SettingsRow,
  Switch,
  useSettingsModal,
  type SettingsSection,
} from "@orra-ui/react";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MEMBERS = [
  { name: "林依然", email: "lin@northwind.cn", role: "owner" },
  { name: "沈晓雯", email: "shen@northwind.cn", role: "admin" },
  { name: "朴立恒", email: "piao@northwind.cn", role: "member" },
];

function MembersPage() {
  const { markDirty } = useSettingsModal();
  return (
    <SettingsGroup title="成员与角色" description="管理员可以邀请成员并修改其他人的角色。">
      {MEMBERS.map((m) => (
        <SettingsRow
          key={m.email}
          label={
            <span className="flex items-center gap-2.5">
              <Avatar name={m.name} size="sm" />
              {m.name}
            </span>
          }
          description={m.email}
        >
          {m.role === "owner" ? (
            <Badge tone="accent">所有者</Badge>
          ) : (
            <Select aria-label={`${m.name} 的角色`} size="sm" defaultSelectedKey={m.role} onSelectionChange={markDirty} className="w-28">
              <SelectItem id="admin">管理员</SelectItem>
              <SelectItem id="member">成员</SelectItem>
              <SelectItem id="viewer">只读</SelectItem>
            </Select>
          )}
        </SettingsRow>
      ))}
    </SettingsGroup>
  );
}

const SECTIONS: SettingsSection[] = [
  { id: "members", label: "成员", icon: <RiTeamLine />, description: "工作区共 18 位成员，3 个待接受的邀请。", content: <MembersPage /> },
  {
    id: "security",
    label: "安全",
    icon: <RiShieldUserLine />,
    description: "登录方式与会话策略。",
    content: (
      <SettingsGroup>
        <Switch variant="row" defaultSelected description="所有成员登录时都需要验证器或短信验证码。">
          强制两步验证
        </Switch>
        <Switch variant="row" description="只允许 @northwind.cn 邮箱加入工作区。">
          限制邮箱域名
        </Switch>
        <SettingsRow label="会话有效期" description="超过时长未操作需重新登录。">
          <Input aria-label="会话有效期" size="sm" defaultValue="12" endAddon="小时" className="w-32" />
        </SettingsRow>
      </SettingsGroup>
    ),
  },
  {
    id: "api",
    label: "API 密钥",
    icon: <RiKey2Line />,
    description: "用于服务端集成，请妥善保管。",
    content: ({ close }) => (
      <SettingsGroup bordered>
        <SettingsRow label="生产环境密钥" description="创建于 2026 年 9 月 3 日 · 最近使用 2 小时前">
          <Button size="sm" variant="outline" tone="danger" onPress={close}>
            吊销
          </Button>
        </SettingsRow>
      </SettingsGroup>
    ),
  },
];

export default function SettingsModalCustom() {
  const [log, setLog] = useState("尚未保存");
  return (
    <div className="flex flex-col items-center gap-3">
      <SettingsModal
        title="工作区设置"
        sections={SECTIONS}
        trigger={<Button>工作区设置</Button>}
        onSave={async () => {
          await wait(900);
          setLog(`已于 ${new Date().toLocaleTimeString("zh-CN")} 保存`);
        }}
      />
      <span className="text-caption text-fg-subtle">{log}</span>
    </div>
  );
}
