"use client";

import { useState } from "react";
import { Button, Textarea } from "@orra-ui/react";

export default function TextareaAutogrow() {
  const [reply, setReply] = useState("");
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Textarea
        aria-label="回复评论"
        placeholder="写下你的回复，内容变多时输入框会自动长高（最多 6 行）"
        minRows={2}
        maxRows={6}
        value={reply}
        onChange={setReply}
      />
      <div className="flex justify-end gap-2">
        <Button variant="plain" tone="neutral" size="sm" onPress={() => setReply("")}>
          取消
        </Button>
        <Button size="sm" isDisabled={!reply.trim()}>
          发送回复
        </Button>
      </div>
    </div>
  );
}
