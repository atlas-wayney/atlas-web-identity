import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { themeAlpine, colorSchemeDark } from "ag-grid-community";
import { useTheme } from "next-themes";
import { Button, Tooltip } from "@heroui/react";
import { ConfirmModal } from "atlas-shared-web/components";
import { getStatusStyle, getWithAuth, deleteWithAuth, useAuth } from "atlas-shared-web";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { API_BASE, BADGE_BASE_CLASS, APP_COLORS, DEFAULT_COLOR, DOMAIN_COLOR, TAG_COLOR } from "../../lib/config";
import { Client } from "../../types/client-group";

const formatAppLabel = (app: string) => {
  return app.replace("ATLAS_APP_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const AppsCellRenderer = (params: ICellRendererParams<Client>) => {
  const apps = params.value as string[];
  if (!apps || apps.length === 0) return <span className="text-gray-400">None</span>;

  return (
    <div>
      {apps.slice(0, 2).map((app, idx) => (
        <span key={idx} className={`${BADGE_BASE_CLASS} ${APP_COLORS[app] || DEFAULT_COLOR} mr-2`}>
          {formatAppLabel(app)}
        </span>
      ))}
      {apps.length > 2 && (
        <span className={`${BADGE_BASE_CLASS} ${DEFAULT_COLOR}`}>
          +{apps.length - 2}
        </span>
      )}
    </div>
  );
};

const DomainsCellRenderer = (params: ICellRendererParams<Client>) => {
  const domains = params.value as string[];
  if (!domains || domains.length === 0) return <span className="text-gray-400">None</span>;

  return (
    <div>
      {domains.slice(0, 2).map((domain, idx) => (
        <span key={idx} className={`${BADGE_BASE_CLASS} ${DOMAIN_COLOR} mr-2`}>
          {domain}
        </span>
      ))}
      {domains.length > 2 && (
        <span className={`${BADGE_BASE_CLASS} ${DEFAULT_COLOR}`}>
          +{domains.length - 2}
        </span>
      )}
    </div>
  );
};

const TagsCellRenderer = (params: ICellRendererParams<Client>) => {
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

export default function Clients() {
  const [isClientSide, setIsClientSide] = useState(false);
  const [rowData, setRowData] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    setIsClientSide(true);
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/clients/v1/`);
      if (response.ok) {
        const data = await response.json();
        setRowData(data);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (client: Client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    setIsSubmitting(true);
    try {
      const response = await deleteWithAuth(`${API_BASE}/identity/clients/v1/${selectedClient.client_id}`);
      if (response.ok) {
        fetchClients();
        closeModal();
      }
    } catch (error) {
      console.error("Failed to delete client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActionsCellRenderer = useCallback((params: ICellRendererParams<Client>) => {
    const data = params.data;
    if (!data) return null;
    return (
      <div className="h-full flex items-center gap-2">
        <Tooltip content="View">
          <Button isIconOnly size="sm" variant="flat" color="primary" onPress={() => router.push(`/clients/view?id=${data.client_id}`)}>
            <EyeIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Edit">
          <Button isIconOnly size="sm" variant="flat" color="success" onPress={() => router.push(`/clients/edit?id=${data.client_id}`)}>
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

  const columnDefs = useMemo<ColDef<Client>[]>(() => [
    { headerName: "Actions", cellRenderer: ActionsCellRenderer, width: 150, minWidth: 150, maxWidth: 150, flex: 0, resizable: false, sortable: false, filter: false, cellClass: "pt-1" },
    { field: "client_id", headerName: "ID", filter: true, sortable: true, width: 120 },
    { field: "client_name", headerName: "Client Name", filter: true, sortable: true },
    { field: "client_status", headerName: "Status", cellRenderer: StatusCellRenderer, filter: true, sortable: true, width: 120 },
    { field: "supported_email_domains", headerName: "Email Domains", cellRenderer: DomainsCellRenderer, width: 200 },
    { field: "allowed_apps", headerName: "Allowed Apps", cellRenderer: AppsCellRenderer, width: 200 },
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
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-500 text-sm">Manage client configurations</p>
        </div>
        {user?.internal && (
          <Button color="primary" onPress={() => router.push("/clients/create")}>
            Add Client
          </Button>
        )}
      </div>
      {isClientSide && (
        <div className="flex-1 overflow-hidden">
          <AgGridReact<Client>
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
        title="Delete client?"
        message={selectedClient ? `${selectedClient.client_name} will be inactivated.` : ""}
        confirmText="Delete"
        confirmColor="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
