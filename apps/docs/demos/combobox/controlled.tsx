"use client";

import { useState } from "react";
import { Combobox, ComboboxItem, ComboboxSection } from "@orra-ui/react";

export default function ComboboxControlled() {
  const [key, setKey] = useState<string | number | null>("ts");
  const [input, setInput] = useState("TypeScript");
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Combobox
        label="主要技术栈"
        selectedKey={key}
        onSelectionChange={setKey}
        inputValue={input}
        onInputChange={setInput}
        allowsCustomValue
      >
        <ComboboxSection title="前端">
          <ComboboxItem id="ts">TypeScript</ComboboxItem>
          <ComboboxItem id="react">React</ComboboxItem>
          <ComboboxItem id="vue">Vue</ComboboxItem>
        </ComboboxSection>
        <ComboboxSection title="后端">
          <ComboboxItem id="go">Go</ComboboxItem>
          <ComboboxItem id="rust">Rust</ComboboxItem>
          <ComboboxItem id="java">Java</ComboboxItem>
        </ComboboxSection>
      </Combobox>
      <p className="text-body-sm text-fg-muted">
        输入：<span className="text-fg">{input || "—"}</span> · 选中：<span className="text-fg">{key ?? "自定义值"}</span>
      </p>
    </div>
  );
}
