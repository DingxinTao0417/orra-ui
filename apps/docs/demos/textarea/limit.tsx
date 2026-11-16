"use client";

import { Textarea } from "@orra-ui/react";

export default function TextareaLimit() {
  return (
    <div className="w-full max-w-md">
      <Textarea
        label="更新日志摘要"
        limit={32}
        enforceLimit={false}
        showCount
        minRows={2}
        defaultValue="本次更新新增了团队空间的批量导出，修复了在弱网环境下附件上传偶发失败的问题。"
        errorMessage="摘要超出字数限制，请精简后再发布。"
      />
    </div>
  );
}
