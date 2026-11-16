"use client";

import { useState } from "react";
import { InputOTP } from "@orra-ui/react";

export default function InputOTPOverview() {
  const [done, setDone] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center gap-3">
      <InputOTP label="短信验证码" description="已发送至 138 **** 6721，5 分钟内有效。" groupSize={3} onComplete={setDone} onChange={() => setDone(null)} />
      <p className="text-body-sm text-fg-muted">{done ? `已输入：${done}` : "输入或粘贴 6 位数字"}</p>
    </div>
  );
}
