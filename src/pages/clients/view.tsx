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
import { Client } from "../../types/client-group";
import { History } from "../../types/history";
import { Case } from "../../types/case";

const formatAppLabel = (app: string) => {
  return app.replace("ATLAS_APP_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

export default function ViewClient() {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [casesLoading, setCasesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const id = router.query.id as string;

  const fetchClient = useCallback(async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/clients/v1/${id}`);
      if (response.ok) {
        const data = await response.json();
        setClient(data);
      } else {
        alert("Client not found");
        router.push("/clients");
      }
    } catch (error) {
      console.error("Failed to fetch client:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!router.isReady) return;

    if (!id) {
      router.push("/clients");
      return;
    }

    fetchClient();
  }, [router.isReady, id, router, fetchClient]);

  const submitForApproval = async () => {
    if (!client) return;
    setIsSubmitting(true);
    try {
      const response = await putWithAuth(`${API_BASE}/identity/clients/v1/${client.client_id}/status`, {
        entity_type: "CLIENT",
        entity_id: client.client_id,
        status: "PENDING_APPROVAL",
        remark: "Submitted for approval",
      });
      if (response.ok) {
        fetchClient();
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

  if (!client) {
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
              <h1 className="text-2xl font-bold">{client.client_name}</h1>
              <p className="text-gray-500 text-sm">Client Details</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="flat"
                onPress={() => router.push("/clients")}
              >
                Back
              </Button>
              <Button
                color="primary"
                onPress={() => router.push(`/clients/edit?id=${id}`)}
              >
                Edit
              </Button>
              {client.client_status?.toUpperCase() === "DRAFT" && (
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
                      <label className="text-sm text-gray-500">ID</label>
                      <p className="font-medium">{client.client_id}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Status</label>
                      <div>
                        <Chip
                          color={statusColors[client.client_status?.toLowerCase()] || "default"}
                          variant="flat"
                        >
                          {client.client_status?.toUpperCase()}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <label className="text-sm text-gray-500">Supported Email Domains</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {client.supported_email_domains?.length > 0 ? (
                        client.supported_email_domains.map((domain) => (
                          <Chip key={domain} variant="flat">{domain}</Chip>
                        ))
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Allowed Applications</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {client.allowed_apps?.length > 0 ? (
                        client.allowed_apps.map((app) => (
                          <Chip key={app} variant="flat" color="primary">
                            {formatAppLabel(app)}
                          </Chip>
                        ))
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {client.tags?.length > 0 ? (
                        client.tags.map((tag) => (
                          <Chip key={tag} variant="flat" color="warning">{tag}</Chip>
                        ))
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </div>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Created By</label>
                      <p className="font-medium">{client.creater_name}</p>
                      <p className="text-sm text-gray-400">
                        {client.create_time ? new Date(client.create_time).toLocaleString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Updated By</label>
                      <p className="font-medium">{client.updater_name}</p>
                      <p className="text-sm text-gray-400">
                        {client.update_time ? new Date(client.update_time).toLocaleString() : "N/A"}
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
