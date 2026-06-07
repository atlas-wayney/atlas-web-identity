import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Divider,
  Select,
  SelectItem,
  Tabs,
  Tab,
} from "@heroui/react";
import { getWithAuth, putWithAuth } from "atlas-shared-web";
import { API_BASE } from "../../lib/config";
import { User } from "../../types/user";
import { ClientRef } from "../../types/client-group";

interface RolesConfig {
  roles: Record<string, { internal: string[]; external: string[] }>;
}

const formatAppLabel = (app: string) => {
  return app.replace("ATLAS_APP_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

export default function GrantAccess() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterInternal, setFilterInternal] = useState<boolean>(true);
  const [filterClientId, setFilterClientId] = useState<string>("");
  const [clients, setClients] = useState<ClientRef[]>([]);
  const [rolesConfig, setRolesConfig] = useState<RolesConfig | null>(null);

  useEffect(() => {
    fetchClients();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/users/v1/roles`);
      if (response.ok) {
        const data = await response.json();
        setRolesConfig(data);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const getAppsAndRoles = () => {
    if (!rolesConfig || !selectedUser) return [];
    const userType = selectedUser.internal ? "internal" : "external";
    return Object.entries(rolesConfig.roles).map(([app, appRoles]) => ({
      app,
      label: formatAppLabel(app),
      roles: appRoles[userType] || [],
    }));
  };

  const fetchClients = async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/clients/v1/`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(false);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append("search", searchQuery);
      }
      params.append("internal", String(filterInternal));
      if (!filterInternal && filterClientId) {
        params.append("client_id", filterClientId);
      }
      const response = await getWithAuth(`${API_BASE}/identity/users/v1/?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setHasSearched(true);
      }
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setRoles(user.roles || {});
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleRoleChange = (appValue: string, roleValue: string | null) => {
    const newRoles = { ...roles };
    if (roleValue === null) {
      delete newRoles[appValue];
    } else {
      newRoles[appValue] = roleValue;
    }
    setRoles(newRoles);
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await putWithAuth(`${API_BASE}/identity/users/v1/${selectedUser.user_id}/roles`, { roles });
      if (response.ok) {
        router.push("/access-matrix");
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to update roles"}`);
      }
    } catch (error) {
      console.error("Failed to update roles:", error);
      alert("Failed to update roles");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardHeader className="flex flex-col items-start px-6 pt-6">
            <h1 className="text-2xl font-bold">Grant User Access</h1>
            <p className="text-gray-500 text-sm">Search for a user and assign application roles</p>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            {!selectedUser ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-2 items-start">
                  <label>User Type</label>
                  <Tabs
                    selectedKey={filterInternal ? "internal" : "external"}
                    onSelectionChange={(key) => {
                      const isInternal = key === "internal";
                      setFilterInternal(isInternal);
                      if (isInternal) {
                        setFilterClientId("");
                      }
                    }}
                    variant="solid"
                    color="primary"
                  >
                    <Tab key="internal" title="Internal" />
                    <Tab key="external" title="External" />
                  </Tabs>
                </div>

                {!filterInternal && (
                  <div className="w-full inline-flex">
                    <Select
                      labelPlacement="outside"
                      label="Client"
                      placeholder="All clients"
                      selectedKeys={filterClientId ? [filterClientId] : []}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFilterClientId(selected || "");
                      }}
                      size="lg"
                    >
                      {clients.map((client) => (
                        <SelectItem key={client.client_id}>
                          {client.client_name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="w-full inline-flex">
                  <Input
                    labelPlacement="outside"
                    label="Search"
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    size="lg"
                  />
                </div>

                <Button
                  color="primary"
                  onPress={handleSearch}
                  isLoading={isSearching}
                  className="w-full"
                >
                  Search
                </Button>

                {searchResults.length > 0 && (
                  <div className="border rounded-lg divide-y dark:border-gray-700 dark:divide-gray-700">
                    {searchResults.map((user) => (
                      <div
                        key={user.user_id}
                        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{user.user_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {!user.internal && user.client_name && (
                              <div className="text-xs text-gray-400 mt-1">
                                {user.client_name}
                              </div>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${user.internal ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
                            {user.internal ? "Internal" : "External"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 && hasSearched && !isSearching && (
                  <p className="text-gray-500 text-center py-4">No users found</p>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="flat"
                    onPress={() => router.push("/access-matrix")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">{selectedUser.user_name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${selectedUser.internal ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300"}`}>
                          {selectedUser.internal ? "Internal" : "External"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{selectedUser.email}</div>
                      {!selectedUser.internal && selectedUser.client_name && (
                        <div className="text-xs text-gray-400 mt-1">
                          {selectedUser.client_name}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => setSelectedUser(null)}
                    >
                      Change User
                    </Button>
                  </div>
                </div>

                <Divider />

                <div className="space-y-4">
                  <label>Roles by Application</label>
                  <p className="text-xs text-gray-500">Assign a role for each application the user should have access to</p>
                  {getAppsAndRoles().map((appConfig) => (
                    <div key={appConfig.app} className="flex flex-col gap-2 items-start">
                      <label className="text-sm text-gray-600 dark:text-gray-400">{appConfig.label}</label>
                      <Tabs
                        selectedKey={roles[appConfig.app] || "none"}
                        onSelectionChange={(key) => {
                          handleRoleChange(appConfig.app, key === "none" ? null : key as string);
                        }}
                        variant="solid"
                        color="primary"
                      >
                        <Tab key="none" title="No Access" />
                        {appConfig.roles.map((role) => (
                          <Tab key={role} title={role} />
                        ))}
                      </Tabs>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="flat"
                    onPress={() => router.push("/access-matrix")}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                  >
                    Save Access
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
