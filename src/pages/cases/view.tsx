import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Divider,
  Tabs,
  Tab,
} from "@heroui/react";
import { HistoryTable } from "atlas-shared-web/components";
import { getStatusStyle, getWithAuth } from "atlas-shared-web";
import { API_BASE } from "../../lib/config";
import { Case } from "../../types/case";
import { History } from "../../types/history";

export default function ViewCase() {
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const id = router.query.id as string;

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

  const fetchCase = useCallback(async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/atlas-cases/v1/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCaseData(data);
      } else {
        alert("Case not found");
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch case:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!router.isReady) return;

    if (!id) {
      router.push("/");
      return;
    }

    fetchCase();
  }, [router.isReady, id, router, fetchCase]);

  useEffect(() => {
    if (!id) return;

    if (activeTab === "history" && history.length === 0) {
      fetchHistory();
    }
  }, [activeTab, id, fetchHistory, history.length]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardHeader className="flex justify-between items-center px-6 pt-6">
            <div>
              <h1 className="text-2xl font-bold">{caseData.title}</h1>
              <p className="text-gray-500 text-sm">Case Details</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="flat"
                onPress={() => router.push("/")}
              >
                Back
              </Button>
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
                      <label className="text-sm text-gray-500">Case ID</label>
                      <p className="font-medium">{caseData.case_id}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Status</label>
                      <div>
                        <span className={getStatusStyle(caseData.case_status)}>
                          {caseData.case_status?.toUpperCase().replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Case Type</label>
                      <p className="font-medium">{caseData.case_type?.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Assigned To</label>
                      <p className="font-medium">{caseData.assigned_user_name || "Unassigned"}</p>
                      {caseData.assigned_user_id && (
                        <p className="text-sm text-gray-400">{caseData.assigned_user_id}</p>
                      )}
                    </div>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Subclient</label>
                      <p className="font-medium">{caseData.subclient_name || "N/A"}</p>
                      {caseData.subclient_id && (
                        <p className="text-sm text-gray-400">{caseData.subclient_id}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Entity</label>
                      <p className="font-medium">{caseData.entity_type || "N/A"}</p>
                      {caseData.entity_id && (
                        <p className="text-sm text-gray-400">{caseData.entity_id}</p>
                      )}
                    </div>
                  </div>

                  {caseData.data && Object.keys(caseData.data).length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <label className="text-sm text-gray-500">Additional Data</label>
                        <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm overflow-auto">
                          {JSON.stringify(caseData.data, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Created By</label>
                      <p className="font-medium">{caseData.creater_name}</p>
                      <p className="text-sm text-gray-400">
                        {caseData.create_time ? new Date(caseData.create_time).toLocaleString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Updated By</label>
                      <p className="font-medium">{caseData.updater_name}</p>
                      <p className="text-sm text-gray-400">
                        {caseData.update_time ? new Date(caseData.update_time).toLocaleString() : "N/A"}
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
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
