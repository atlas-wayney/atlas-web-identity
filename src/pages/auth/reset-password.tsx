import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button, Input, Card, CardBody, CardHeader, Link } from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { API_BASE } from "../../lib/config";
import { ResetPasswordRequest } from "../../types/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token || typeof token !== "string") {
      setError("Invalid or missing reset token");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const payload: ResetPasswordRequest = {
        token: token,
        new_password: newPassword,
      };

      const response = await fetch(`${API_BASE}/identity/auth/v1/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to reset password. The link may have expired.");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardBody className="px-6 py-8 text-center">
            <h1 className="text-xl font-bold mb-2">Invalid Reset Link</h1>
            <p className="text-sm text-gray-500 mb-4">
              This password reset link is invalid or has expired.
            </p>
            <Link href="/identity/auth/forget-password" className="text-primary">
              Request a new reset link
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-gray-500">
            {success ? "Your password has been reset" : "Enter your new password"}
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          {success ? (
            <div className="flex flex-col gap-4">
              <div className="bg-success-50 text-success border border-success-200 rounded-lg p-4 text-sm">
                Your password has been reset successfully. You can now sign in with your new password.
              </div>
              <Button
                color="primary"
                onPress={() => router.push("/auth/login")}
                className="w-full"
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
                type={showNewPassword ? "text" : "password"}
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onValueChange={setNewPassword}
                isRequired
                autoComplete="new-password"
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="focus:outline-none"
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                }
              />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                isRequired
                autoComplete="new-password"
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none"
                  >
                    {showConfirmPassword ? (
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
                isLoading={isLoading}
                className="w-full"
              >
                Reset Password
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
