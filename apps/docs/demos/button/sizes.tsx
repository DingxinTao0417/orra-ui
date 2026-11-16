"use client";

import { RiSendPlaneLine } from "@remixicon/react";
import { Button } from "@orra-ui/react";

export default function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button size="sm" startIcon={<RiSendPlaneLine />}>
        小号 32
      </Button>
      <Button size="md" startIcon={<RiSendPlaneLine />}>
        中号 36
      </Button>
      <Button size="lg" startIcon={<RiSendPlaneLine />}>
        大号 44
      </Button>
    </div>
  );
}
