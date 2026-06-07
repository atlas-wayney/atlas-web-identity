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
  Autocomplete,
  AutocompleteItem,
  Spinner,
} from "@heroui/react";
import { getWithAuth, putWithAuth } from "atlas-shared-web";
import { API_BASE } from "../../lib/config";
import { Subclient, SubclientForm, SubclientRef } from "../../types/client";
import { ClientRef } from "../../types/client-group";

interface CountryOption {
  code: string;
  country: string;
  region: string;
}

export default function EditSubclient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [clients, setClients] = useState<ClientRef[]>([]);
  const [subclients, setSubclients] = useState<SubclientRef[]>([]);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);

  const id = router.query.id as string;

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<SubclientForm>({
    defaultValues: {
      subclient_name: "",
      subclient_status: "active",
      parent_subclient_id: "",
      client_id: "",
      client_name: "",
      country: "",
      region: "",
      tags: [],
    },
  });

  const tags = watch("tags");
  const selectedCountry = watch("country");

  const fetchClients = useCallback(async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/clients/v1/`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  }, []);

  const fetchSubclients = useCallback(async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/subclients/v1/`);
      if (response.ok) {
        const data = await response.json();
        setSubclients(data.filter((c: Subclient) => c.subclient_id !== id));
      }
    } catch (error) {
      console.error("Failed to fetch subclients:", error);
    }
  }, [id]);

  const fetchSubclient = useCallback(async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/subclients/v1/${id}`);
      if (response.ok) {
        const data = await response.json();
        reset({
          subclient_name: data.subclient_name,
          subclient_status: data.subclient_status,
          parent_subclient_id: data.parent_subclient_id || "",
          client_id: data.client_id,
          client_name: data.client_name,
          country: data.country,
          region: data.region,
          tags: data.tags || [],
        });
      } else {
        alert("Subclient not found");
        router.push("/subclients");
      }
    } catch (error) {
      console.error("Failed to fetch subclient:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, reset, router]);

  const fetchCountryConfig = useCallback(async () => {
    try {
      const response = await getWithAuth(`${API_BASE}/identity/atlas-configs/v1/SUBCLIENT/COUNTRY`);
      if (response.ok) {
        const data = await response.json();
        const options: CountryOption[] = Object.entries(data.options || {}).map(([code, value]) => {
          const parsed = JSON.parse(value as string);
          return {
            code,
            country: parsed.country,
            region: parsed.region,
          };
        });
        setCountryOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch country config:", error);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    if (!id) {
      router.push("/subclients");
      return;
    }

    fetchClients();
    fetchSubclients();
    fetchSubclient();
    fetchCountryConfig();
  }, [router.isReady, id, router, fetchClients, fetchSubclients, fetchSubclient, fetchCountryConfig]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setValue("tags", tags.filter((t) => t !== tag));
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.client_id === clientId);
    setValue("client_id", clientId);
    setValue("client_name", client?.client_name || "");
  };

  const handleCountryChange = (countryCode: string) => {
    setValue("country", countryCode);
    const countryOption = countryOptions.find(c => c.code === countryCode);
    setValue("region", countryOption?.region || "");
  };

  const getRegionDisplay = () => {
    const countryOption = countryOptions.find(c => c.code === selectedCountry);
    return countryOption?.region || "";
  };

  const onSubmit = async (data: SubclientForm) => {
    setIsSubmitting(true);
    try {
      const response = await putWithAuth(`${API_BASE}/identity/subclients/v1/${id}/draft`, data);
      if (response.ok) {
        router.push("/subclients");
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to update subclient"}`);
      }
    } catch (error) {
      console.error("Failed to update subclient:", error);
      alert("Failed to update subclient");
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
            <h1 className="text-2xl font-bold">Edit Subclient</h1>
            <p className="text-gray-500 text-sm">Update subclient details</p>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Controller
                name="subclient_name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    labelPlacement="outside"
                    label="Subclient Name"
                    placeholder="Enter subclient name"
                    isInvalid={!!errors.subclient_name}
                    errorMessage={errors.subclient_name?.message}
                    size="lg"
                  />
                )}
              />

              <div className="w-full inline-flex">
                <Controller
                  name="client_id"
                  control={control}
                  rules={{ required: "Client is required" }}
                  render={({ field }) => (
                    <Autocomplete
                      labelPlacement="outside"
                      label="Client"
                      placeholder="Select client"
                      selectedKey={field.value}
                      onSelectionChange={(key) => handleClientChange(key as string || "")}
                      isInvalid={!!errors.client_id}
                      errorMessage={errors.client_id?.message}
                      size="lg"
                    >
                      {clients.map((client) => (
                        <AutocompleteItem key={client.client_id}>
                          {client.client_name}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  )}
                />
              </div>

              <div className="w-full inline-flex">
                <Controller
                  name="parent_subclient_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      labelPlacement="outside"
                      label="Parent Subclient (Optional)"
                      placeholder="Select parent subclient"
                      selectedKey={field.value}
                      onSelectionChange={(key) => field.onChange(key as string || "")}
                      allowsCustomValue
                      size="lg"
                    >
                      {subclients.map((subclient) => (
                        <AutocompleteItem key={subclient.subclient_id}>
                          {subclient.subclient_name}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="country"
                  control={control}
                  rules={{ required: "Country is required" }}
                  render={({ field }) => (
                    <Autocomplete
                      labelPlacement="outside"
                      label="Country"
                      placeholder="Select country"
                      selectedKey={field.value}
                      onSelectionChange={(key) => handleCountryChange(key as string || "")}
                      isInvalid={!!errors.country}
                      errorMessage={errors.country?.message}
                      size="lg"
                    >
                      {countryOptions.map((option) => (
                        <AutocompleteItem key={option.code}>{option.country}</AutocompleteItem>
                      ))}
                    </Autocomplete>
                  )}
                />

                <Input
                  labelPlacement="outside"
                  label="Region"
                  value={getRegionDisplay()}
                  isReadOnly
                  size="lg"
                />
              </div>

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
                  onPress={() => router.push("/subclients")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isSubmitting}
                >
                  Update Subclient
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
