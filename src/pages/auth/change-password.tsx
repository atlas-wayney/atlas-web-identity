import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button, Input, Card, CardBody, CardHeader } from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { API_BASE } from "../../lib/config";
import { ChangePasswordRequest } from "../../types/auth";
import { postWithAuth } from "atlas-shared-web";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const payload: ChangePasswordRequest = {
        current_password: currentPassword,
        new_password: newPassword,
      };

      const response = await postWithAuth(`${API_BASE}/identity/auth/v1/change-password`, payload);

      if (response.ok) {
        setSuccess("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Failed to change password");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col gap-1 px-6 pt-6">
            <h1 className="text-2xl font-bold">Change Password</h1>
            <p className="text-sm text-gray-500">Update your account password</p>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-success-50 text-success border border-success-200 rounded-lg p-3 text-sm">
                  {success}
                </div>
              )}
              <Input
                type={showCurrentPassword ? "text" : "password"}
                label="Current Password"
                placeholder="Enter current password"
                value={currentPassword}
                onValueChange={setCurrentPassword}
                isRequired
                autoComplete="current-password"
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="focus:outline-none"
                  >
                    {showCurrentPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                }
              />
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
                label="Confirm New Password"
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
              <div className="flex gap-2 pt-2">
                <Button
                  variant="flat"
                  onPress={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Change Password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
