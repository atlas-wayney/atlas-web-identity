import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { themeAlpine, colorSchemeDark } from "ag-grid-community";
import { useTheme } from "next-themes";
import { Button, Tooltip } from "@heroui/react";
import { ConfirmModal } from "atlas-shared-web/components";
import { getWithAuth } from "atlas-shared-web";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { API_BASE, APP_COLORS, ROLE_COLORS, DEFAULT_COLOR, BADGE_BASE_CLASS, INTERNAL_COLOR } from "../../lib/config";
import { User } from "../../types/user";

interface IdentityRow {
  id: string;
  user_id: string;
  user_name: string;
  email: string;
  app: string;
  app_label: string;
  role: string;
  client_name?: string;
  internal: boolean;
  update_time: string;
}

const formatAppLabel = (app: string) => {
  return app.replace("ATLAS_APP_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const AppCellRenderer = (params: ICellRendererParams<IdentityRow>) => {
  const data = params.data;
  if (!data) return null;

  const colorClass = APP_COLORS[data.app] || DEFAULT_COLOR;

  return (
    <span className={`${BADGE_BASE_CLASS} ${colorClass}`}>
      {data.app_label}
    </span>
  );
};

const RoleCellRenderer = (params: ICellRendererParams<IdentityRow>) => {
  const role = params.value as string;
  const colorClass = ROLE_COLORS[role] || DEFAULT_COLOR;
  return (
    <span className={`${BADGE_BASE_CLASS} ${colorClass}`}>
      {role}
    </span>
  );
};

const ClientCellRenderer = (params: ICellRendererParams<IdentityRow>) => {
  const data = params.data;
  if (!data) return null;

  if (data.internal) {
    return (
      <span className={`${BADGE_BASE_CLASS} ${INTERNAL_COLOR}`}>
        Internal
      </span>
    );
  }

  return <span>{data.client_name || "N/A"}</span>;
};

const UserCellRenderer = (params: ICellRendererParams<IdentityRow>) => {
  const data = params.data;
  if (!data) return null;
  return (
    <span>
      <span className="font-medium">{data.user_name}</span>
      {data.email && <span className="text-gray-500 ml-2">({data.email})</span>}
    </span>
  );
};

export default function Identity() {
  const [isClient, setIsClient] = useState(false);
  const [rowData, setRowData] = useState<IdentityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<IdentityRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/users/v1/`);
      if (response.ok) {
        const users: User[] = await response.json();
        const flattenedData: IdentityRow[] = [];

        users.forEach((user) => {
          if (user.roles && Object.keys(user.roles).length > 0) {
            Object.entries(user.roles).forEach(([app, role]) => {
              flattenedData.push({
                id: `${user.user_id}-${app}`,
                user_id: user.user_id,
                user_name: user.user_name,
                email: user.email,
                app: app,
                app_label: formatAppLabel(app),
                role: role,
                client_name: user.client_name,
                internal: user.internal,
                update_time: user.update_time,
              });
            });
          }
        });

        setRowData(flattenedData);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (accessRow: IdentityRow) => {
    setSelectedAccess(accessRow);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAccess(null);
  };

  const handleDelete = async () => {
    if (!selectedAccess) return;
    setIsSubmitting(true);
    // TODO: Implement role removal API call
    console.log("Remove access:", selectedAccess.user_id, selectedAccess.app);
    setIsSubmitting(false);
    closeModal();
  };

  const ActionsCellRenderer = useCallback((params: ICellRendererParams<IdentityRow>) => {
    const data = params.data;
    if (!data) return null;
    return (
      <div className="h-full flex items-center gap-2">
        <Tooltip content="View">
          <Button isIconOnly size="sm" variant="flat" color="primary" onPress={() => router.push(`/users/view?id=${data.user_id}`)}>
            <EyeIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Edit">
          <Button isIconOnly size="sm" variant="flat" color="success" onPress={() => router.push(`/users/edit?id=${data.user_id}`)}>
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

  const columnDefs = useMemo<ColDef<IdentityRow>[]>(() => [
    { headerName: "Actions", cellRenderer: ActionsCellRenderer, width: 150, minWidth: 150, maxWidth: 150, flex: 0, resizable: false, sortable: false, filter: false, cellClass: "pt-1" },
    { field: "app_label", headerName: "Application", cellRenderer: AppCellRenderer, filter: true, sortable: true, width: 150 },
    { field: "role", headerName: "Role", cellRenderer: RoleCellRenderer, filter: true, sortable: true, width: 120 },
    { field: "client_name", headerName: "Client", cellRenderer: ClientCellRenderer, filter: true, sortable: true, width: 180 },
    { field: "user_name", headerName: "User Name", cellRenderer: UserCellRenderer, filter: true, sortable: true },
    { field: "update_time", headerName: "Last Updated", filter: true, sortable: true, width: 180, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
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
          <h1 className="text-2xl font-bold">Access Matrix</h1>
          <p className="text-gray-500 text-sm">View and manage user access across applications</p>
        </div>
        <Button color="primary" onPress={() => router.push("/access-matrix/create")}>
          Grant User Access
        </Button>
      </div>

      {isClient && (
        <div className="flex-1 overflow-hidden">
          <AgGridReact<IdentityRow>
            theme={gridTheme}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            pagination={true}
            paginationPageSize={20}
            loading={loading}
            getRowId={(params) => params.data.id}
            enableCellTextSelection={true}
            ensureDomOrder={true}
          />
        </div>
      )}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={handleDelete}
        title="Remove access?"
        message={selectedAccess ? `${selectedAccess.user_name} (${selectedAccess.email}) will lose ${selectedAccess.role} access to ${selectedAccess.app_label}.` : ""}
        confirmText="Remove"
        confirmColor="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
