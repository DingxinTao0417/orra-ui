"use client";

import { useState } from "react";
import { Input } from "@orra-ui/react";

export default function InputValidation() {
  const [handle, setHandle] = useState("chen zhi");
  const invalid = handle.length > 0 && !/^[a-z0-9_]{3,16}$/.test(handle);
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Input
        label="用户名"
        value={handle}
        onChange={setHandle}
        startAddon="@"
        isClearable
        isInvalid={invalid}
        errorMessage="只能使用 3–16 位小写字母、数字或下划线。"
        description="将显示在你的个人主页链接中。"
      />
      <Input label="邀请人邮箱" type="email" isRequired placeholder="必填" errorMessage={({ validationDetails }) => (validationDetails.valueMissing ? "请填写邀请人邮箱。" : "邮箱格式不正确。")} />
      <Input label="工号" defaultValue="NW-20419" isReadOnly description="工号由管理员分配，无法修改。" />
      <Input label="部门" defaultValue="增长团队" isDisabled />
    </div>
  );
}
