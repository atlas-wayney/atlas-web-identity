import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button, Input, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { API_BASE } from "../../lib/config";
import { LoginRequest } from "../../types/auth";
import { useAuth } from "atlas-shared-web";

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload: LoginRequest = { login_id: loginId, password };
      const response = await fetch(`${API_BASE}/identity/auth/v1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        window.location.href = "/";
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Invalid login ID or password");
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
          <h1 className="text-2xl font-bold">Sign In</h1>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <Input
              type="text"
              label="Login ID"
              placeholder="Enter your login ID"
              value={loginId}
              onValueChange={setLoginId}
              isRequired
              autoComplete="username"
              size="lg"
            />
            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              value={password}
              onValueChange={setPassword}
              isRequired
              autoComplete="current-password"
              size="lg"
              endContent={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              }
            />
            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Sign In
            </Button>
            <Divider />
            <div className="flex flex-col">
              <Button
                variant="light"
                color="primary"
                onPress={() => router.push("/auth/forget-password")}
                className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Forgot password?
              </Button>
              <Button
                variant="light"
                color="primary"
                onPress={() => router.push("/auth/create-account")}
                className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Create Account
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
