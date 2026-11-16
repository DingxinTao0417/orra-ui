"use client";

import type { ReactNode } from "react";
import { RiBankCardLine, RiNotification3Line, RiPaletteLine, RiSettings3Line, RiUserLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { AccentPicker } from "../accent-picker/accent-picker";
import { Avatar } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Meter } from "../meter/meter";
import { SegmentedControl } from "../segmented-control/segmented-control";
import { Select, SelectItem } from "../select/select";
import { Switch } from "../switch/switch";
import { Textarea } from "../textarea/textarea";
import { ThemeToggle } from "../theme-toggle/theme-toggle";
import { SettingsGroup, SettingsRow, useSettingsModal, type SettingsModalApi } from "./settings-parts";

/* Sample pages for SettingsModal (shown when no `sections` are passed). */

const COPY = {
  en: {
    general: "General",
    generalDesc: "Workspace name, language and regional formats.",
    workspace: "Workspace",
    workspaceName: "Workspace name",
    workspaceNameDesc: "Shown in the sidebar and in email notifications.",
    url: "Workspace URL",
    region: "Language & region",
    language: "Language",
    timezone: "Time zone",
    weekStart: "Week starts on",
    monday: "Monday",
    sunday: "Sunday",
    profile: "Profile",
    profileDesc: "How you appear to teammates.",
    photo: "Photo",
    photoDesc: "PNG or JPG, at least 256 × 256 px.",
    upload: "Upload",
    remove: "Remove",
    fullName: "Full name",
    email: "Email",
    bio: "About",
    bioPlaceholder: "A line or two about what you work on",
    notifications: "Notifications",
    notificationsDesc: "Choose what reaches you, and where.",
    activity: "Activity",
    mentions: "Mentions and replies",
    mentionsDesc: "When someone @mentions you or replies to your thread.",
    assigned: "Assigned to me",
    assignedDesc: "Tasks and reviews that need you.",
    digest: "Email digest",
    digestDesc: "A summary of what happened while you were away.",
    daily: "Daily",
    weekly: "Weekly",
    never: "Never",
    product: "Product updates",
    productDesc: "New features and improvements, about once a month.",
    appearance: "Appearance",
    appearanceDesc: "Theme, accent colour and density. Applies instantly.",
    theme: "Theme",
    themeDesc: "Follow your system or pick one.",
    accent: "Accent colour",
    accentDesc: "Used for primary actions, selection and focus.",
    density: "Density",
    densityDesc: "Spacing of tables and lists.",
    comfortable: "Comfortable",
    compact: "Compact",
    billing: "Billing",
    billingDesc: "Plan, usage and payment method.",
    plan: "Current plan",
    planName: "Team",
    planPrice: "$24 per seat / month · renews Dec 1",
    change: "Change plan",
    usage: "Usage this month",
    seats: "Seats",
    storage: "Storage",
    payment: "Payment method",
    card: "Card ending in 4242",
    cardExp: "Expires 08/2028",
    update: "Update",
  },
  zh: {
    general: "通用",
    generalDesc: "工作区名称、语言与区域格式。",
    workspace: "工作区",
    workspaceName: "工作区名称",
    workspaceNameDesc: "显示在侧边栏和邮件通知中。",
    url: "工作区地址",
    region: "语言与区域",
    language: "界面语言",
    timezone: "时区",
    weekStart: "每周开始于",
    monday: "周一",
    sunday: "周日",
    profile: "个人资料",
    profileDesc: "团队成员看到的你。",
    photo: "头像",
    photoDesc: "PNG 或 JPG，至少 256 × 256 像素。",
    upload: "上传",
    remove: "移除",
    fullName: "姓名",
    email: "邮箱",
    bio: "简介",
    bioPlaceholder: "用一两句话介绍你负责的工作",
    notifications: "通知",
    notificationsDesc: "选择接收哪些通知，以及通过什么方式。",
    activity: "动态",
    mentions: "提及与回复",
    mentionsDesc: "有人 @ 你或回复你的讨论时。",
    assigned: "指派给我",
    assignedDesc: "需要你处理的任务和评审。",
    digest: "邮件摘要",
    digestDesc: "汇总你不在时发生的事情。",
    daily: "每天",
    weekly: "每周",
    never: "从不",
    product: "产品更新",
    productDesc: "新功能与改进，大约每月一次。",
    appearance: "外观",
    appearanceDesc: "主题、主题色与信息密度，修改后立即生效。",
    theme: "主题",
    themeDesc: "跟随系统，或固定一种。",
    accent: "主题色",
    accentDesc: "用于主要操作、选中状态和焦点。",
    density: "信息密度",
    densityDesc: "表格与列表的行距。",
    comfortable: "舒适",
    compact: "紧凑",
    billing: "账单",
    billingDesc: "套餐、用量与付款方式。",
    plan: "当前套餐",
    planName: "团队版",
    planPrice: "¥168 / 席位 / 月 · 12 月 1 日续费",
    change: "更换套餐",
    usage: "本月用量",
    seats: "席位",
    storage: "存储空间",
    payment: "付款方式",
    card: "尾号 4242 的银行卡",
    cardExp: "有效期至 2028/08",
    update: "更新",
  },
};
type SampleCopy = (typeof COPY)["en"];

function GeneralPage({ t }: { t: SampleCopy }) {
  const { markDirty } = useSettingsModal();
  return (
    <div className="flex flex-col gap-6">
      <SettingsGroup title={t.workspace}>
        <SettingsRow label={t.workspaceName} description={t.workspaceNameDesc}>
          <Input aria-label={t.workspaceName} defaultValue="Northwind Studio" className="w-64" />
        </SettingsRow>
        <SettingsRow label={t.url}>
          <Input aria-label={t.url} startAddon="orra.app/" defaultValue="northwind" className="w-64" />
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup title={t.region}>
        <SettingsRow label={t.language}>
          <Select aria-label={t.language} defaultSelectedKey="zh-CN" onSelectionChange={markDirty} className="w-48">
            <SelectItem id="zh-CN">简体中文</SelectItem>
            <SelectItem id="en-US">English (US)</SelectItem>
            <SelectItem id="ja-JP">日本語</SelectItem>
          </Select>
        </SettingsRow>
        <SettingsRow label={t.timezone}>
          <Select aria-label={t.timezone} defaultSelectedKey="Asia/Shanghai" onSelectionChange={markDirty} className="w-48">
            <SelectItem id="Asia/Shanghai">GMT+8 · Shanghai</SelectItem>
            <SelectItem id="Asia/Tokyo">GMT+9 · Tokyo</SelectItem>
            <SelectItem id="Europe/London">GMT+0 · London</SelectItem>
            <SelectItem id="America/New_York">GMT−5 · New York</SelectItem>
          </Select>
        </SettingsRow>
        <SettingsRow label={t.weekStart}>
          <SegmentedControl
            aria-label={t.weekStart}
            defaultValue="mon"
            onChange={markDirty}
            options={[
              { id: "mon", label: t.monday },
              { id: "sun", label: t.sunday },
            ]}
          />
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}

function ProfilePage({ t }: { t: SampleCopy }) {
  return (
    <div className="flex flex-col gap-6">
      <SettingsGroup>
        <SettingsRow label={t.photo} description={t.photoDesc}>
          <Avatar name="Mira Lin" size="lg" />
          <Button size="sm" variant="outline" tone="neutral">
            {t.upload}
          </Button>
          <Button size="sm" variant="plain" tone="neutral">
            {t.remove}
          </Button>
        </SettingsRow>
        <SettingsRow label={t.fullName}>
          <Input aria-label={t.fullName} defaultValue="Mira Lin" className="w-64" />
        </SettingsRow>
        <SettingsRow label={t.email}>
          <Input aria-label={t.email} type="email" defaultValue="mira@northwind.studio" className="w-64" />
        </SettingsRow>
        <SettingsRow label={t.bio} stacked>
          <Textarea aria-label={t.bio} placeholder={t.bioPlaceholder} minRows={3} maxLength={160} className="w-full" />
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}

function NotificationsPage({ t }: { t: SampleCopy }) {
  const { markDirty } = useSettingsModal();
  return (
    <div className="flex flex-col gap-6">
      <SettingsGroup title={t.activity}>
        <Switch variant="row" defaultSelected description={t.mentionsDesc}>
          {t.mentions}
        </Switch>
        <Switch variant="row" defaultSelected description={t.assignedDesc}>
          {t.assigned}
        </Switch>
        <SettingsRow label={t.digest} description={t.digestDesc}>
          <Select aria-label={t.digest} defaultSelectedKey="daily" onSelectionChange={markDirty} className="w-36">
            <SelectItem id="daily">{t.daily}</SelectItem>
            <SelectItem id="weekly">{t.weekly}</SelectItem>
            <SelectItem id="never">{t.never}</SelectItem>
          </Select>
        </SettingsRow>
        <Switch variant="row" description={t.productDesc}>
          {t.product}
        </Switch>
      </SettingsGroup>
    </div>
  );
}

function AppearancePage({ t }: { t: SampleCopy }) {
  // These apply instantly, so their change events shouldn't flag the page as unsaved.
  return (
    <div onChange={(e) => e.stopPropagation()}>
      <SettingsGroup>
        <SettingsRow label={t.theme} description={t.themeDesc}>
          <ThemeToggle showLabels />
        </SettingsRow>
        <SettingsRow label={t.accent} description={t.accentDesc} stacked>
          <AccentPicker size="sm" showValue className="w-full" />
        </SettingsRow>
        <SettingsRow label={t.density} description={t.densityDesc}>
          <SegmentedControl
            aria-label={t.density}
            defaultValue="comfortable"
            options={[
              { id: "comfortable", label: t.comfortable },
              { id: "compact", label: t.compact },
            ]}
          />
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}

function BillingPage({ t }: { t: SampleCopy }) {
  return (
    <div className="flex flex-col gap-6">
      <SettingsGroup bordered>
        <SettingsRow
          label={
            <span className="flex items-center gap-2">
              {t.plan}
              <Badge tone="accent" size="sm">
                {t.planName}
              </Badge>
            </span>
          }
          description={t.planPrice}
        >
          <Button size="sm" variant="outline" tone="neutral">
            {t.change}
          </Button>
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup title={t.usage}>
        <div className="grid gap-5 py-4 @md:grid-cols-2">
          <Meter label={t.seats} value={18} maxValue={20} accentWhenOk />
          <Meter label={t.storage} value={42} maxValue={100} valueLabel="42 / 100 GB" accentWhenOk />
        </div>
      </SettingsGroup>
      <SettingsGroup title={t.payment}>
        <SettingsRow
          label={
            <span className="flex items-center gap-2">
              <RiBankCardLine aria-hidden className="size-4 text-fg-subtle" />
              {t.card}
            </span>
          }
          description={t.cardExp}
        >
          <Button size="sm" variant="outline" tone="neutral">
            {t.update}
          </Button>
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}

/** Sample sections used by SettingsModal when none are passed. */
export function useSampleSettingsSections() {
  const t = useCopy(COPY);
  return [
    { id: "general", label: t.general, icon: <RiSettings3Line />, description: t.generalDesc, content: <GeneralPage t={t} /> },
    { id: "profile", label: t.profile, icon: <RiUserLine />, description: t.profileDesc, content: <ProfilePage t={t} /> },
    { id: "notifications", label: t.notifications, icon: <RiNotification3Line />, description: t.notificationsDesc, content: <NotificationsPage t={t} /> },
    { id: "appearance", label: t.appearance, icon: <RiPaletteLine />, description: t.appearanceDesc, content: <AppearancePage t={t} /> },
    { id: "billing", label: t.billing, icon: <RiBankCardLine />, description: t.billingDesc, content: <BillingPage t={t} /> },
  ] satisfies { id: string; label: string; icon: ReactNode; description: string; content: ReactNode | ((api: SettingsModalApi) => ReactNode) }[];
}
