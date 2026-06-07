import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button, Input, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { API_BASE } from "../../lib/config";
import { CreateAccountRequest, CreateAccountResponse } from "../../types/auth";

export default function CreateAccountPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload: CreateAccountRequest = {
        login_id: loginId,
        name,
        email,
        phone,
        roles: { ATLAS_APP_IDENTITY: "VIEWER" },
      };

      const response = await fetch(`${API_BASE}/identity/auth/v1/create-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to create account");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="px-6 pt-6">
          <h1 className="text-2xl font-bold">Create Account</h1>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          {success ? (
            <div className="flex flex-col gap-4">
              <div className="bg-success-50 text-success border border-success-200 rounded-lg p-4 text-sm">
                Account created successfully. You can now sign in.
              </div>
              <Button
                color="primary"
                size="lg"
                onPress={() => router.push("/auth/login")}
                className="w-full font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}
              <Input
                type="text"
                label="User ID"
                placeholder="Enter your user ID"
                value={loginId}
                onValueChange={setLoginId}
                isRequired
                size="lg"
              />
              <Input
                type="text"
                label="Name"
                placeholder="Enter your full name"
                value={name}
                onValueChange={setName}
                isRequired
                size="lg"
              />
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                description="Only corporate email is allowed"
                value={email}
                onValueChange={setEmail}
                isRequired
                size="lg"
              />
              <Input
                type="tel"
                label="Phone"
                placeholder="Enter your phone number"
                value={phone}
                onValueChange={setPhone}
                isRequired
                size="lg"
              />
              <Button
                type="submit"
                color="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Create Account
              </Button>
              <Divider />
              <Button
                variant="light"
                color="primary"
                onPress={() => router.push("/auth/login")}
                className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Back to Sign In
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
