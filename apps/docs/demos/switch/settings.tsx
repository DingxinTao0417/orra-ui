"use client";

import { useState } from "react";
import { RiAtLine, RiMailLine, RiNotification3Line } from "@remixicon/react";
import { Switch } from "@orra-ui/react";

export default function SwitchSettings() {
  const [prefs, setPrefs] = useState({ mention: true, digest: false, push: true });
  const toggle = (key: keyof typeof prefs) => (on: boolean) => setPrefs((p) => ({ ...p, [key]: on }));
  return (
    <div className="w-full max-w-md rounded-card border border-line bg-surface px-5 shadow-card">
      <div className="divide-y divide-line">
        <Switch variant="row" icon={<RiAtLine />} isSelected={prefs.mention} onChange={toggle("mention")} description="有人在评论或文档里提到你时">
          提及通知
        </Switch>
        <Switch variant="row" icon={<RiMailLine />} isSelected={prefs.digest} onChange={toggle("digest")} description="每天 18:00 汇总未读动态">
          每日邮件摘要
        </Switch>
        <Switch variant="row" icon={<RiNotification3Line />} isSelected={prefs.push} onChange={toggle("push")} description="在手机和桌面端弹出提醒">
          推送通知
        </Switch>
      </div>
    </div>
  );
}
