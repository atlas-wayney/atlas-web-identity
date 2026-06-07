import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem,
  Tabs,
  Tab,
} from "@heroui/react";
import { getWithAuth, postWithAuth, useAuth } from "atlas-shared-web";
import { API_BASE } from "../../lib/config";
import { UserForm } from "../../types/user";
import { ClientRef } from "../../types/client-group";

interface RolesConfig {
  roles: Record<string, { internal: string[]; external: string[] }>;
}

const formatAppLabel = (app: string) => {
  return app.replace("ATLAS_APP_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

export default function CreateUser() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<ClientRef[]>([]);
  const [rolesConfig, setRolesConfig] = useState<RolesConfig | null>(null);

  const isCurrentUserInternal = currentUser?.internal ?? true;

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<UserForm>({
    defaultValues: {
      login_id: "",
      user_name: "",
      user_status: "DRAFT",
      email: "",
      phone: "",
      internal: isCurrentUserInternal ? true : false,
      client_id: isCurrentUserInternal ? undefined : currentUser?.client_id,
      client_name: isCurrentUserInternal ? undefined : currentUser?.client_name,
      roles: {},
    },
  });

  const isInternal = watch("internal");

  useEffect(() => {
    fetchClients();
    fetchRoles();
  }, []);

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
    if (!rolesConfig) return [];
    const userType = isInternal ? "internal" : "external";
    return Object.entries(rolesConfig.roles).map(([app, roles]) => ({
      app,
      label: formatAppLabel(app),
      roles: roles[userType] || [],
    }));
  };

  const handleClientChange = (clientId?: string) => {
    const client = clients.find(c => c.client_id === clientId);
    setValue("client_id", clientId);
    setValue("client_name", client?.client_name);
  };

  const onSubmit = async (data: UserForm) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        client_id: data.internal ? null : data.client_id,
        client_name: data.internal ? null : data.client_name,
      };
      const response = await postWithAuth(`${API_BASE}/identity/users/v1/`, payload);
      if (response.ok) {
        router.push("/users");
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to create user"}`);
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      alert("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardHeader className="flex flex-col items-start px-6 pt-6">
            <h1 className="text-2xl font-bold">Create User</h1>
            <p className="text-gray-500 text-sm">Add a new user to the system</p>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex">
                <Controller
                  name="login_id"
                  control={control}
                  rules={{ required: "Login ID is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      labelPlacement="outside"
                      label="Login ID"
                      placeholder="Enter login ID"
                      isInvalid={!!errors.login_id}
                      errorMessage={errors.login_id?.message}
                      size="lg"
                    />
                  )}
                />
              </div>

              <div className="flex">
                <Controller
                  name="user_name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      labelPlacement="outside"
                      label="User Name"
                      placeholder="Enter user name"
                      isInvalid={!!errors.user_name}
                      errorMessage={errors.user_name?.message}
                      size="lg"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      labelPlacement="outside"
                      type="email"
                      label="Email"
                      placeholder="Enter email"
                      isInvalid={!!errors.email}
                      errorMessage={errors.email?.message}
                      size="lg"
                    />
                  )}
                />

                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: "Phone is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      labelPlacement="outside"
                      label="Phone"
                      placeholder="Enter phone number"
                      isInvalid={!!errors.phone}
                      errorMessage={errors.phone?.message}
                      size="lg"
                    />
                  )}
                />
              </div>

              {isCurrentUserInternal ? (
                <>
                  <Controller
                    name="internal"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-2 items-start">
                        <label>User Type</label>
                        <Tabs
                          selectedKey={field.value ? "internal" : "external"}
                          onSelectionChange={(key) => {
                            field.onChange(key === "internal");
                          }}
                          variant="solid"
                          color="primary"
                        >
                          <Tab key="internal" title="Internal" />
                          <Tab key="external" title="External" />
                        </Tabs>
                      </div>
                    )}
                  />

                  {!isInternal && (
                    <div className="w-full inline-flex">
                      <Controller
                        name="client_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            labelPlacement="outside"
                            label="Client (Optional)"
                            placeholder="Select client"
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys)[0] as string;
                              handleClientChange(selected || undefined);
                            }}
                            size="lg"
                          >
                            {clients.map((client) => (
                              <SelectItem key={client.client_id}>
                                {client.client_name}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Client</label>
                  <p className="text-base font-medium">{currentUser?.client_name || "N/A"}</p>
                </div>
              )}

              <div className="space-y-4">
                <label>Roles by Application</label>
                <p className="text-xs text-gray-500">Assign a role for each application the user should have access to</p>
                {getAppsAndRoles().map((appConfig) => (
                  <Controller
                    key={appConfig.app}
                    name="roles"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-2 items-start">
                        <label className="text-sm text-gray-600 dark:text-gray-400">{appConfig.label}</label>
                        <Tabs
                          selectedKey={field.value[appConfig.app] || "none"}
                          onSelectionChange={(key) => {
                            const newRoles = { ...field.value };
                            if (key === "none") {
                              delete newRoles[appConfig.app];
                            } else {
                              newRoles[appConfig.app] = key as string;
                            }
                            field.onChange(newRoles);
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
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="flat"
                  onPress={() => router.push("/users")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isSubmitting}
                >
                  Create User
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
