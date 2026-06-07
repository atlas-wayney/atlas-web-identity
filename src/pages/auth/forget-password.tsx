import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button, Input, Card, CardBody, CardHeader, Link } from "@heroui/react";
import { API_BASE } from "../../lib/config";
import { ForgetPasswordRequest } from "../../types/auth";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload: ForgetPasswordRequest = { email };
      const response = await fetch(`${API_BASE}/identity/auth/v1/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to process request");
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
        <CardHeader className="flex flex-col gap-1 px-6 pt-6">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-sm text-gray-500">
            {success
              ? "Check your email for reset instructions"
              : "Enter your email to receive reset instructions"}
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          {success ? (
            <div className="flex flex-col gap-4">
              <div className="bg-success-50 text-success border border-success-200 rounded-lg p-4 text-sm">
                If an account exists with this email, you will receive password reset instructions shortly.
              </div>
              <Button
                color="primary"
                variant="flat"
                onPress={() => router.push("/auth/login")}
                className="w-full"
              >
                Back to Sign In
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
                type="email"
                label="Email"
                placeholder="Enter your email"
                description="Only corporate email is allowed"
                value={email}
                onValueChange={setEmail}
                isRequired
                autoComplete="email"
              />
              <Button
                type="submit"
                color="primary"
                isLoading={isLoading}
                className="w-full"
              >
                Send Reset Instructions
              </Button>
              <div className="text-center">
                <Link href="/identity/auth/login" size="sm" className="text-primary">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
