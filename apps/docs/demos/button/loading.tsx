"use client";

import { useState } from "react";
import { Button } from "@orra-ui/react";

export default function ButtonLoading() {
  const [saving, setSaving] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        loading={saving}
        onPress={() => {
          setSaving(true);
          setTimeout(() => setSaving(false), 1600);
        }}
      >
        {saving ? "保存中…" : "保存更改"}
      </Button>
      <Button isDisabled>已禁用</Button>
      <Button variant="outline" tone="neutral" isDisabled>
        已禁用
      </Button>
    </div>
  );
}
