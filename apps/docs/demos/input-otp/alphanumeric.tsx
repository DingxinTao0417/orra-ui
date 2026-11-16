"use client";

import { InputOTP } from "@orra-ui/react";

export default function InputOTPAlphanumeric() {
  return (
    <div className="flex flex-col items-center gap-6">
      <InputOTP label="团队邀请码" mode="alphanumeric" length={8} groupSize={4} defaultValue="K7QD" size="sm" />
      <InputOTP label="支付密码" length={6} mask size="lg" />
    </div>
  );
}
