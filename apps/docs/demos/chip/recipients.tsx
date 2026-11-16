"use client";

import { useState } from "react";
import { Avatar, Chip, ChipGroup, LinkButton } from "@orra-ui/react";

const INITIAL = [
  { id: "lxy", name: "林晓雨" },
  { id: "zzh", name: "周子航" },
  { id: "pn", name: "Priya Nair" },
  { id: "wjh", name: "王嘉禾" },
];

export default function ChipRecipients() {
  const [people, setPeople] = useState(INITIAL);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ChipGroup
        label="收件人"
        items={people}
        onRemove={(keys) => setPeople((list) => list.filter((p) => !keys.has(p.id)))}
        renderEmptyState={() => "还没有收件人"}
      >
        {(p) => (
          <Chip id={p.id} avatar={<Avatar name={p.name} />}>
            {p.name}
          </Chip>
        )}
      </ChipGroup>
      {people.length < INITIAL.length ? (
        <LinkButton size="sm" onPress={() => setPeople(INITIAL)}>
          恢复全部
        </LinkButton>
      ) : null}
    </div>
  );
}
