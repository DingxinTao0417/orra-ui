"use client";

import { Pagination } from "@orra-ui/react";

export default function PaginationVariants() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-fit">
        <Pagination pageCount={12} defaultPage={1} mode="full" />
      </div>
      <div className="w-fit">
        <Pagination pageCount={48} defaultPage={24} mode="full" variant="outline" size="sm" />
      </div>
      <div className="w-fit">
        <Pagination pageCount={48} defaultPage={24} mode="full" siblings={2} boundaries={2} />
      </div>
    </div>
  );
}
