"use client";

import { useState } from "react";
import { Button, InputOTP } from "@orra-ui/react";

const EXPECTED = "246810";

export default function InputOTPValidation() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "wrong" | "ok">("idle");

  const verify = (value: string) => {
    setStatus("checking");
    setTimeout(() => setStatus(value === EXPECTED ? "ok" : "wrong"), 700);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <InputOTP
        label="两步验证"
        value={code}
        onChange={(v) => {
          setCode(v);
          if (status !== "checking") setStatus("idle");
        }}
        onComplete={verify}
        isDisabled={status === "checking"}
        isInvalid={status === "wrong"}
        errorMessage="验证码不正确，请重新输入。"
        description={status === "ok" ? "验证通过 ✓" : "打开身份验证器查看 6 位动态码（示例：246810）"}
      />
      <Button size="sm" variant="outline" tone="neutral" loading={status === "checking"} onPress={() => { setCode(""); setStatus("idle"); }}>
        清空重填
      </Button>
    </div>
  );
}
