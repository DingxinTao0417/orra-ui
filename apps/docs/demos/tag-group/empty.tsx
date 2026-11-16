"use client";

import { useState } from "react";
import { Button, Tag, TagGroup } from "@orra-ui/react";

export default function TagGroupEmpty() {
  const [labels, setLabels] = useState<string[]>([]);
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <TagGroup label="已选收件人" emptyState="还没有添加收件人" items={labels.map((name) => ({ id: name }))} onRemove={(keys) => setLabels((l) => l.filter((n) => !keys.has(n)))}>
        {(item) => <Tag id={item.id}>{item.id}</Tag>}
      </TagGroup>
      <div className="flex flex-wrap gap-2">
        {["市场部", "财务部", "林悦", "周明轩"].map((name) => (
          <Button key={name} size="sm" variant="outline" tone="neutral" isDisabled={labels.includes(name)} onPress={() => setLabels((l) => [...l, name])}>
            + {name}
          </Button>
        ))}
      </div>
    </div>
  );
}
