"use client";

import { useState } from "react";
import { Pagination } from "@orra-ui/react";

export default function PaginationOverview() {
  const [page, setPage] = useState(6);
  const [pageSize, setPageSize] = useState(20);
  return (
    <div className="w-full max-w-3xl">
      <Pagination
        total={1284}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        showSummary
      />
    </div>
  );
}
