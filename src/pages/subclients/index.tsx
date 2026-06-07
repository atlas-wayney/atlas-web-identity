import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { themeAlpine, colorSchemeDark } from "ag-grid-community";
import { useTheme } from "next-themes";
import { Button, Tooltip } from "@heroui/react";
import { ConfirmModal } from "atlas-shared-web/components";
import { getStatusStyle, getWithAuth, deleteWithAuth } from "atlas-shared-web";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { API_BASE, BADGE_BASE_CLASS, DEFAULT_COLOR, TAG_COLOR } from "../../lib/config";
import { Subclient } from "../../types/client";

const SubclientNameCellRenderer = (params: ICellRendererParams<Subclient>) => {
  const data = params.data;
  if (!data) return null;
  return <span className="font-medium">{data.subclient_name}</span>;
};

const GroupCellRenderer = (params: ICellRendererParams<Subclient>) => {
  const data = params.data;
  if (!data) return null;
  return <span>{data.client_name || "N/A"}</span>;
};

const LocationCellRenderer = (params: ICellRendererParams<Subclient>) => {
  const data = params.data;
  if (!data) return null;
  return <span>{data.country}</span>;
};

const TagsCellRenderer = (params: ICellRendererParams<Subclient>) => {
  const tags = params.value as string[];
  if (!tags || tags.length === 0) return <span className="text-gray-400">None</span>;

  return (
    <div>
      {tags.slice(0, 2).map((tag, idx) => (
        <span key={idx} className={`${BADGE_BASE_CLASS} ${TAG_COLOR} mr-2`}>
          {tag}
        </span>
      ))}
      {tags.length > 2 && (
        <span className={`${BADGE_BASE_CLASS} ${DEFAULT_COLOR}`}>
          +{tags.length - 2}
        </span>
      )}
    </div>
  );
};

const StatusCellRenderer = (params: ICellRendererParams) => {
  const status = params.value as string;
  return (
    <span className={getStatusStyle(status)}>
      {status?.toUpperCase() || "N/A"}
    </span>
  );
};

export default function Subclients() {
  const [isClient, setIsClient] = useState(false);
  const [rowData, setRowData] = useState<Subclient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubclient, setSelectedSubclient] = useState<Subclient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    fetchSubclients();
  }, []);

  const fetchSubclients = async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/subclients/v1/`);
      if (response.ok) {
        const data = await response.json();
        setRowData(data);
      }
    } catch (error) {
      console.error("Failed to fetch subclients:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (subclient: Subclient) => {
    setSelectedSubclient(subclient);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSubclient(null);
  };

  const handleDelete = async () => {
    if (!selectedSubclient) return;
    setIsSubmitting(true);
    try {
      const response = await deleteWithAuth(`${API_BASE}/identity/subclients/v1/${selectedSubclient.subclient_id}`);
      if (response.ok) {
        fetchSubclients();
        closeModal();
      }
    } catch (error) {
      console.error("Failed to delete subclient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActionsCellRenderer = useCallback((params: ICellRendererParams<Subclient>) => {
    const data = params.data;
    if (!data) return null;
    return (
      <div className="h-full flex items-center gap-2">
        <Tooltip content="View">
          <Button isIconOnly size="sm" variant="flat" color="primary" onPress={() => router.push(`/subclients/view?id=${data.subclient_id}`)}>
            <EyeIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Edit">
          <Button isIconOnly size="sm" variant="flat" color="success" onPress={() => router.push(`/subclients/edit?id=${data.subclient_id}`)}>
            <PencilSquareIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Delete">
          <Button isIconOnly size="sm" variant="flat" color="danger" onPress={() => openDeleteModal(data)}>
            <TrashIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    );
  }, [router]);

  const gridTheme = resolvedTheme === "dark" ? themeAlpine.withPart(colorSchemeDark) : themeAlpine;

  const columnDefs = useMemo<ColDef<Subclient>[]>(() => [
    { headerName: "Actions", cellRenderer: ActionsCellRenderer, width: 150, minWidth: 150, maxWidth: 150, flex: 0, resizable: false, sortable: false, filter: false, cellClass: "pt-1" },
    { field: "subclient_id", headerName: "ID", filter: true, sortable: true, width: 120 },
    { headerName: "Subclient Name", cellRenderer: SubclientNameCellRenderer, filter: true, sortable: true, field: "subclient_name" },
    { field: "subclient_status", headerName: "Status", cellRenderer: StatusCellRenderer, filter: true, sortable: true, width: 120 },
    { field: "client_name", headerName: "Client", cellRenderer: GroupCellRenderer, filter: true, sortable: true, width: 150 },
    { headerName: "Location", cellRenderer: LocationCellRenderer, filter: true, sortable: true, field: "country", width: 150 },
    { field: "tags", headerName: "Tags", cellRenderer: TagsCellRenderer, width: 180 },
    { field: "create_time", headerName: "Created", filter: true, sortable: true, width: 180, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
  ], [ActionsCellRenderer]);

  const defaultColDef = useMemo<ColDef>(() => ({
    flex: 1,
    minWidth: 80,
    resizable: true,
  }), []);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Subclients</h1>
          <p className="text-gray-500 text-sm">Manage subclient accounts</p>
        </div>
        <Button color="primary" onPress={() => router.push("/subclients/create")}>
          Add Subclient
        </Button>
      </div>
      {isClient && (
        <div className="flex-1 overflow-hidden">
          <AgGridReact<Subclient>
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
        onConfirm={handleDelete}
        title="Delete subclient?"
        message={selectedSubclient ? `${selectedSubclient.subclient_name} (${selectedSubclient.client_name || "No client"}) will be inactivated.` : ""}
        confirmText="Delete"
        confirmColor="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
