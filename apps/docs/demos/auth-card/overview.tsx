"use client";

import { RiSparkling2Fill } from "@remixicon/react";
import { AuthCard } from "@orra-ui/react";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Logo() {
  return (
    <span className="grid size-11 place-items-center rounded-[14px] bg-accent-gradient text-fg-on-accent shadow-accent">
      <RiSparkling2Fill className="size-6" />
    </span>
  );
}

export default function AuthCardOverview() {
  return (
    <AuthCard
      logo={<Logo />}
      providers={["google", "github"]}
      onSubmit={async ({ email, password }) => {
        await wait(900);
        if (password !== "orra2026") throw new Error(`${email} 的密码不正确（试试 orra2026）`);
      }}
      onSocial={() => wait(1200)}
    />
  );
}
