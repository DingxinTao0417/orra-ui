"use client";

import { SOCIAL_PROVIDERS, SocialButton } from "@orra-ui/react";

export default function SocialButtonFilled() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        {(["github", "facebook", "discord", "slack", "linkedin", "alipay"] as const).map((p) => (
          <SocialButton key={p} provider={p} variant="filled" action="signUp" fullWidth />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {SOCIAL_PROVIDERS.map((p) => (
          <SocialButton key={p} provider={p} iconOnly />
        ))}
      </div>
    </div>
  );
}
