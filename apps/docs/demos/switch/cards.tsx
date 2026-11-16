"use client";

import { RiShieldKeyholeLine, RiTranslate2 } from "@remixicon/react";
import { Switch } from "@orra-ui/react";

export default function SwitchCards() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Switch variant="card" icon={<RiShieldKeyholeLine />} defaultSelected description="登录时需要输入动态验证码">
        两步验证
      </Switch>
      <Switch variant="card" icon={<RiTranslate2 />} size="sm" description="自动翻译非中文的评论">
        评论翻译
      </Switch>
    </div>
  );
}
