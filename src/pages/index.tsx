import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { themeAlpine, colorSchemeDark } from "ag-grid-community";
import { useTheme } from "next-themes";
import { Button, Tooltip } from "@heroui/react";
import { ConfirmModal } from "atlas-shared-web/components";
import { getStatusStyle, getWithAuth, putWithAuth } from "atlas-shared-web";
import { EyeIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { API_BASE } from "../lib/config";
import { Case } from "../types/case";

const TitleCellRenderer = (params: ICellRendererParams<Case>) => {
  const data = params.data;
  if (!data) return null;
  return <span className="font-medium">{data.title}</span>;
};

const CaseTypeCellRenderer = (params: ICellRendererParams<Case>) => {
  const caseType = params.value as string;
  return (
    <span className="font-medium">
      {caseType?.toUpperCase() || "N/A"}
    </span>
  );
};

const StatusCellRenderer = (params: ICellRendererParams<Case>) => {
  const status = params.value as string;
  return (
    <span className={getStatusStyle(status)}>
      {status?.toUpperCase().replace("_", " ") || "N/A"}
    </span>
  );
};

const AssignedUserCellRenderer = (params: ICellRendererParams<Case>) => {
  const data = params.data;
  if (!data) return null;
  return (
    <div>
      <div className="font-medium">{data.assigned_user_name}</div>
    </div>
  );
};

const ClientCellRenderer = (params: ICellRendererParams<Case>) => {
  const data = params.data;
  if (!data) return null;

  if (!data.client_name) {
    return <span className="text-gray-400">N/A</span>;
  }

  return <span>{data.client_name}</span>;
};

const SubclientCellRenderer = (params: ICellRendererParams<Case>) => {
  const data = params.data;
  if (!data) return null;

  if (!data.subclient_name) {
    return <span className="text-gray-400">N/A</span>;
  }

  return <span>{data.subclient_name}</span>;
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [rowData, setRowData] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject" | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/atlas-cases/v1/`);
      if (response.ok) {
        const data = await response.json();
        setRowData(data);
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (action: "approve" | "reject", caseData: Case) => {
    setModalAction(action);
    setSelectedCase(caseData);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAction(null);
    setSelectedCase(null);
  };

  const handleConfirm = async () => {
    if (!selectedCase || !modalAction) return;
    setIsSubmitting(true);
    try {
      const status = modalAction === "approve" ? "APPROVED" : "REJECTED";
      const payload: Record<string, string> = {
        case_status: status,
        assigned_user_id: "",
        assigned_user_name: "",
        remark: status.charAt(0) + status.slice(1).toLowerCase(),
      };
      const response = await putWithAuth(`${API_BASE}/identity/atlas-cases/v1/${selectedCase.case_id}/status`, payload);
      if (response.ok) {
        fetchCases();
        closeModal();
      }
    } catch (error) {
      console.error(`Failed to ${modalAction} case:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActionsCellRenderer = useCallback((params: ICellRendererParams<Case>) => {
    const data = params.data;
    if (!data) return null;
    const status = data.case_status?.toLowerCase();
    const hideActions = ["approved", "rejected", "closed"].includes(status);
    return (
      <div className="h-full flex items-center gap-2">
        <Tooltip content="View">
          <Button isIconOnly size="sm" variant="flat" color="primary" onPress={() => router.push(`/cases/view?id=${data.case_id}`)}>
            <EyeIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
        {!hideActions && (
          <>
            <Tooltip content="Approve">
              <Button isIconOnly size="sm" variant="flat" color="success" onPress={() => openModal("approve", data)}>
                <CheckIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Reject">
              <Button isIconOnly size="sm" variant="flat" color="danger" onPress={() => openModal("reject", data)}>
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          </>
        )}
      </div>
    );
  }, [router]);

  const gridTheme = resolvedTheme === "dark" ? themeAlpine.withPart(colorSchemeDark) : themeAlpine;

  const columnDefs = useMemo<ColDef<Case>[]>(() => [
    { headerName: "Actions", cellRenderer: ActionsCellRenderer, width: 150, minWidth: 150, maxWidth: 150, flex: 0, resizable: false, sortable: false, filter: false, cellClass: "pt-1" },
    { field: "case_id", headerName: "ID", filter: true, sortable: true, width: 120 },
    { headerName: "Title", cellRenderer: TitleCellRenderer, filter: true, sortable: true, field: "title" },
    { field: "case_type", headerName: "Type", cellRenderer: CaseTypeCellRenderer, filter: true, sortable: true, width: 130 },
    { field: "case_status", headerName: "Status", cellRenderer: StatusCellRenderer, filter: true, sortable: true, width: 130, sort: "asc", sortIndex: 0, comparator: (a: string, b: string) => {
      const aIsPending = a?.toLowerCase() === "pending_approval" ? 0 : 1;
      const bIsPending = b?.toLowerCase() === "pending_approval" ? 0 : 1;
      return aIsPending - bIsPending;
    } },
    { field: "client_name", headerName: "Client", cellRenderer: ClientCellRenderer, filter: true, sortable: true, width: 180 },
    { field: "subclient_name", headerName: "Subclient Name", cellRenderer: SubclientCellRenderer, filter: true, sortable: true, width: 180 },
    { field: "assigned_user_name", headerName: "Assigned To", cellRenderer: AssignedUserCellRenderer, filter: true, sortable: true, width: 160 },
    { field: "update_time", headerName: "Last Updated", filter: true, sortable: true, sort: "desc", sortIndex: 1, width: 180, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
  ], [ActionsCellRenderer]);

  const defaultColDef = useMemo<ColDef>(() => ({
    flex: 1,
    minWidth: 80,
    resizable: true,
  }), []);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm">Manage change requests</p>
      </div>
      {isClient && (
        <div className="flex-1 overflow-hidden">
          <AgGridReact<Case>
            theme={gridTheme}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            pagination={true}
            paginationPageSize={20}
            loading={loading}
            enableCellTextSelection={true}
            ensureDomOrder={true}
          />
        </div>
      )}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title={modalAction === "approve" ? "Approve case?" : "Reject case?"}
        message={selectedCase ? `${selectedCase.title}${selectedCase.subclient_name ? ` (${selectedCase.subclient_name})` : ""}` : ""}
        confirmText={modalAction === "approve" ? "Approve" : "Reject"}
        confirmColor={modalAction === "approve" ? "success" : "danger"}
        isLoading={isSubmitting}
      />
    </div>
  );
}
