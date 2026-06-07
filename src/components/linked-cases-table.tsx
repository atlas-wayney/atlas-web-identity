import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { Button, Spinner, Tooltip } from "@heroui/react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { themeAlpine, colorSchemeDark } from "ag-grid-community";
import { useTheme } from "next-themes";
import { getStatusStyle } from "atlas-shared-web";
import { Case } from "../types/case";
import { EyeIcon } from "@heroicons/react/24/outline";

interface LinkedCasesTableProps {
  cases: Case[];
  loading: boolean;
}

const CaseStatusCellRenderer = (params: ICellRendererParams<Case>) => {
  const status = params.value as string;
  return (
    <span className={getStatusStyle(status)}>
      {status?.toUpperCase().replace("_", " ") || "N/A"}
    </span>
  );
};

export default function LinkedCasesTable({ cases, loading }: LinkedCasesTableProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const gridTheme = resolvedTheme === "dark" ? themeAlpine.withPart(colorSchemeDark) : themeAlpine;

  const ActionsCellRenderer = useCallback((params: ICellRendererParams<Case>) => {
    const data = params.data;
    if (!data) return null;
    return (
      <div className="h-full flex items-center">
        <Tooltip content="View">
          <Button isIconOnly size="sm" variant="flat" color="primary" onPress={() => router.push(`/cases/view?id=${data.case_id}`)}>
            <EyeIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    );
  }, [router]);

  const columnDefs = useMemo<ColDef<Case>[]>(() => [
    { headerName: "Actions", cellRenderer: ActionsCellRenderer, width: 70, minWidth: 70, maxWidth: 70, resizable: false, sortable: false, filter: false, cellClass: "pt-1" },
    { field: "case_id", headerName: "Case ID", filter: true, sortable: true, width: 120 },
    { field: "title", headerName: "Title", filter: true, sortable: true, flex: 1 },
    { field: "case_type", headerName: "Type", filter: true, sortable: true, width: 150, valueFormatter: (params) => params.value?.toUpperCase() },
    { field: "case_status", headerName: "Status", cellRenderer: CaseStatusCellRenderer, filter: true, sortable: true, width: 180 },
    { field: "create_time", headerName: "Created", filter: true, sortable: true, width: 180, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
  ], [ActionsCellRenderer]);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
  }), []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (cases.length === 0) {
    return <p className="text-gray-500 text-center py-8">No linked cases found</p>;
  }

  return (
    <AgGridReact<Case>
      theme={gridTheme}
      rowData={cases}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      domLayout="autoHeight"
      enableCellTextSelection={true}
      ensureDomOrder={true}
    />
  );
}
