import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Chip,
  CheckboxGroup,
  Checkbox,
  Spinner,
} from "@heroui/react";
import { getWithAuth, putWithAuth } from "atlas-shared-web";
import { API_BASE } from "../../lib/config";
import { ClientForm } from "../../types/client-group";

interface RolesConfig {
  roles: Record<string, { internal: string[]; external: string[] }>;
}

const formatAppLabel = (app: string) => {
  return app.replace("ATLAS_APP_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

export default function EditClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [domainInput, setDomainInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [appOptions, setAppOptions] = useState<{ value: string; label: string }[]>([]);

  const id = router.query.id as string;

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ClientForm>({
    defaultValues: {
      client_name: "",
      client_status: "active",
      supported_email_domains: [],
      allowed_apps: [],
      tags: [],
    },
  });

  const domains = watch("supported_email_domains");
  const tags = watch("tags");

  const fetchClient = useCallback(async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/clients/v1/${id}`);
      if (response.ok) {
        const data = await response.json();
        reset({
          client_name: data.client_name,
          client_status: data.client_status,
          supported_email_domains: data.supported_email_domains || [],
          allowed_apps: data.allowed_apps || [],
          tags: data.tags || [],
        });
      } else {
        alert("Client not found");
        router.push("/clients");
      }
    } catch (error) {
      console.error("Failed to fetch client:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, reset, router]);

  const fetchApps = useCallback(async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/users/v1/roles`);
      if (response.ok) {
        const data: RolesConfig = await response.json();
        const apps = Object.keys(data.roles).map(app => ({
          value: app,
          label: formatAppLabel(app),
        }));
        setAppOptions(apps);
      }
    } catch (error) {
      console.error("Failed to fetch apps:", error);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    if (!id) {
      router.push("/clients");
      return;
    }

    fetchApps();
    fetchClient();
  }, [router.isReady, id, router, fetchApps, fetchClient]);

  const handleAddDomain = () => {
    if (domainInput.trim() && !domains.includes(domainInput.trim())) {
      setValue("supported_email_domains", [...domains, domainInput.trim()]);
      setDomainInput("");
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setValue("supported_email_domains", domains.filter((d) => d !== domain));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setValue("tags", tags.filter((t) => t !== tag));
  };

  const onSubmit = async (data: ClientForm) => {
    setIsSubmitting(true);
    try {
      const response = await putWithAuth(`${API_BASE}/identity/clients/v1/${id}/draft`, data);
      if (response.ok) {
        router.push("/clients");
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to update client"}`);
      }
    } catch (error) {
      console.error("Failed to update client:", error);
      alert("Failed to update client");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardHeader className="flex flex-col items-start px-6 pt-6">
            <h1 className="text-2xl font-bold">Edit Client</h1>
            <p className="text-gray-500 text-sm">Update client details</p>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Controller
                name="client_name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    labelPlacement="outside"
                    label="Client Name"
                    placeholder="Enter client name"
                    isInvalid={!!errors.client_name}
                    errorMessage={errors.client_name?.message}
                    size="lg"
                  />
                )}
              />

              <div className="flex flex-col gap-2">
                <label>Supported Email Domains</label>
                <div className="flex gap-2">
                  <Input
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="e.g., example.com"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDomain();
                      }
                    }}
                    size="lg"
                  />
                  <Button type="button" onPress={handleAddDomain} color="primary" variant="flat" size="lg">
                    Add
                  </Button>
                </div>
                {domains.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {domains.map((domain) => (
                      <Chip key={domain} onClose={() => handleRemoveDomain(domain)} variant="flat">
                        {domain}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>

              <Controller
                name="allowed_apps"
                control={control}
                render={({ field }) => (
                  <CheckboxGroup
                    label="Allowed Applications"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    {appOptions.map((app) => (
                      <Checkbox key={app.value} value={app.value}>
                        {app.label}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                )}
              />

              <div className="flex flex-col gap-2">
                <label>Tags</label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    size="lg"
                  />
                  <Button type="button" onPress={handleAddTag} color="primary" variant="flat" size="lg">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Chip key={tag} onClose={() => handleRemoveTag(tag)} variant="flat" color="warning">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="flat"
                  onPress={() => router.push("/clients")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isSubmitting}
                >
                  Update Client
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
