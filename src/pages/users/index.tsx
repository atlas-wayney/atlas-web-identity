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
import { API_BASE, ROLE_COLORS, DEFAULT_COLOR, BADGE_BASE_CLASS } from "../../lib/config";
import { User } from "../../types/user";

const formatAppLabel = (app: string) => {
  return app.replace("ATLAS_APP_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const UserCellRenderer = (params: ICellRendererParams<User>) => {
  const data = params.data;
  if (!data) return null;
  return (
    <span>
      <span className="font-medium">{data.user_name}</span>
      {data.email && <span className="text-gray-500 ml-2">({data.email})</span>}
    </span>
  );
};

const RolesCellRenderer = (params: ICellRendererParams<User>) => {
  const roles = params.value as Record<string, string> | undefined;
  if (!roles || Object.keys(roles).length === 0) return <span className="text-gray-400">None</span>;

  const entries = Object.entries(roles);

  return (
    <div>
      {entries.slice(0, 2).map(([app, role]) => {
        const colorClass = ROLE_COLORS[role] || DEFAULT_COLOR;
        return (
          <span key={app} className={`${BADGE_BASE_CLASS} ${colorClass} mr-1`}>
            {formatAppLabel(app).split(" ")[0]}: {role}
          </span>
        );
      })}
      {entries.length > 2 && (
        <span className={`${BADGE_BASE_CLASS} ${DEFAULT_COLOR}`}>
          +{entries.length - 2}
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

export default function Users() {
  const [isClient, setIsClient] = useState(false);
  const [rowData, setRowData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
        const data = await response.json();
        setRowData(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const response = await deleteWithAuth(`${API_BASE}/identity/users/v1/${selectedUser.user_id}`);
      if (response.ok) {
        fetchUsers();
        closeModal();
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActionsCellRenderer = useCallback((params: ICellRendererParams<User>) => {
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

  const columnDefs = useMemo<ColDef<User>[]>(() => [
    { headerName: "Actions", cellRenderer: ActionsCellRenderer, width: 150, minWidth: 150, maxWidth: 150, flex: 0, resizable: false, sortable: false, filter: false, cellClass: "pt-1" },
    { field: "login_id", headerName: "Login ID", filter: true, sortable: true, width: 140 },
    { headerName: "User Name", cellRenderer: UserCellRenderer, filter: true, sortable: true, field: "user_name" },
    { field: "user_status", headerName: "Status", cellRenderer: StatusCellRenderer, filter: true, sortable: true, width: 110 },
    { field: "phone", headerName: "Phone", filter: true, sortable: true, width: 140 },
    { field: "client_name", headerName: "Client", filter: true, sortable: true, width: 150 },
    { field: "roles", headerName: "Roles", cellRenderer: RolesCellRenderer, width: 150 },
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
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-500 text-sm">Manage user accounts and permissions</p>
        </div>
        <Button color="primary" onPress={() => router.push("/users/create")}>
          Add User
        </Button>
      </div>
      {isClient && (
        <div className="flex-1 overflow-hidden">
          <AgGridReact<User>
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
        title="Delete user?"
        message={selectedUser ? `${selectedUser.user_name} (${selectedUser.email}) will be inactivated.` : ""}
        confirmText="Delete"
        confirmColor="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
