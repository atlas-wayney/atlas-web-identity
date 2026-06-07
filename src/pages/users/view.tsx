import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
  Divider,
  Tabs,
  Tab,
} from "@heroui/react";
import { HistoryTable } from "atlas-shared-web/components";
import { getWithAuth, putWithAuth } from "atlas-shared-web";
import LinkedCasesTable from "../../components/linked-cases-table";
import { API_BASE } from "../../lib/config";
import { User } from "../../types/user";
import { History } from "../../types/history";
import { Case } from "../../types/case";

const ROLE_COLORS: Record<string, "danger" | "warning" | "primary" | "default"> = {
  ADMIN: "danger",
  DCOPS: "default",
  EDITOR: "warning",
  VIEWER: "primary",
};

const formatAppLabel = (app: string) => {
  return app.replace("ATLAS_APP_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

export default function ViewUser() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [casesLoading, setCasesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const id = router.query.id as string;

  const fetchUser = useCallback(async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/users/v1/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        alert("User not found");
        router.push("/users");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!router.isReady) return;

    if (!id) {
      router.push("/users");
      return;
    }

    fetchUser();
  }, [router.isReady, id, router, fetchUser]);

  const submitForApproval = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const response = await putWithAuth(`${API_BASE}/identity/users/v1/${user.user_id}/status`, {
        entity_type: "USER",
        entity_id: user.user_id,
        status: "PENDING_APPROVAL",
        remark: "Submitted for approval",
      });
      if (response.ok) {
        fetchUser();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to submit for approval"}`);
      }
    } catch (error) {
      console.error("Failed to submit for approval:", error);
      alert("Failed to submit for approval");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await getWithAuth(`${API_BASE}/identity/atlas-histories/v1/entity/${id}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, [id]);

  const fetchCases = useCallback(async () => {
    setCasesLoading(true);
    try {
      const response = await getWithAuth(`${API_BASE}/identity/atlas-cases/v1/?entity_id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setCases(data);
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setCasesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    if (activeTab === "history" && history.length === 0) {
      fetchHistory();
    } else if (activeTab === "cases" && cases.length === 0) {
      fetchCases();
    }
  }, [activeTab, id, fetchHistory, fetchCases, history.length, cases.length]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const statusColors: Record<string, "success" | "warning" | "danger" | "default"> = {
    active: "success",
    pending: "warning",
    inactive: "default",
    suspended: "danger",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardHeader className="flex justify-between items-center px-6 pt-6">
            <div>
              <h1 className="text-2xl font-bold">{user.user_name}</h1>
              <p className="text-gray-500 text-sm">User Details</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="flat"
                onPress={() => router.push("/users")}
              >
                Back
              </Button>
              <Button
                color="primary"
                onPress={() => router.push(`/users/edit?id=${id}`)}
              >
                Edit
              </Button>
              {user.user_status?.toUpperCase() === "DRAFT" && (
                <Button
                  color="success"
                  isLoading={isSubmitting}
                  onPress={submitForApproval}
                >
                  Submit for Approval
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              variant="solid"
            >
              <Tab key="details" title="Details">
                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">User ID</label>
                      <p className="font-medium">{user.user_id}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Status</label>
                      <div>
                        <Chip
                          color={statusColors[user.user_status?.toLowerCase()] || "default"}
                          variant="flat"
                        >
                          {user.user_status?.toUpperCase()}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Login ID</label>
                      <p className="font-medium">{user.login_id}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">User Name</label>
                      <p className="font-medium">{user.user_name}</p>
                    </div>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Phone</label>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">User Type</label>
                      <div>
                        <Chip
                          color={user.internal ? "primary" : "default"}
                          variant="flat"
                        >
                          {user.internal ? "Internal" : "External"}
                        </Chip>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Roles</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.roles && Object.keys(user.roles).length > 0 ? (
                          Object.entries(user.roles).map(([app, role]) => (
                            <Chip
                              key={app}
                              color={ROLE_COLORS[role] || "default"}
                              variant="flat"
                            >
                              {formatAppLabel(app)}: {role}
                            </Chip>
                          ))
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!user.internal && (
                    <>
                      <Divider />
                      <div>
                        <label className="text-sm text-gray-500">Client</label>
                        <p className="font-medium">{user.client_name || "N/A"}</p>
                        {user.client_id && (
                          <p className="text-sm text-gray-400">{user.client_id}</p>
                        )}
                      </div>
                    </>
                  )}

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Created By</label>
                      <p className="font-medium">{user.creater_name}</p>
                      <p className="text-sm text-gray-400">
                        {user.create_time ? new Date(user.create_time).toLocaleString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Updated By</label>
                      <p className="font-medium">{user.updater_name}</p>
                      <p className="text-sm text-gray-400">
                        {user.update_time ? new Date(user.update_time).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </Tab>

              <Tab key="history" title="History">
                <div className="pt-4">
                  <HistoryTable history={history} loading={historyLoading} />
                </div>
              </Tab>

              <Tab key="cases" title="Linked Cases">
                <div className="pt-4">
                  <LinkedCasesTable cases={cases} loading={casesLoading} />
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
