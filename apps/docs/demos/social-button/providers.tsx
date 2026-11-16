"use client";

import { SOCIAL_PROVIDERS, SocialButton } from "@orra-ui/react";

export default function SocialButtonProviders() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {SOCIAL_PROVIDERS.map((p) => (
        <SocialButton key={p} provider={p} action="signIn" fullWidth />
      ))}
    </div>
  );
}
