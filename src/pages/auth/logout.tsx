'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardBody, Button } from "@heroui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAuth, postWithAuth } from "atlas-shared-web";
import { API_BASE } from "../../lib/config";

const authApiPath = "/identity/auth/v1";

export default function LogoutPage() {
  const router = useRouter();
  const { removeToken } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await postWithAuth(`${API_BASE}${authApiPath}/logout`, {});
      } catch {
        // Ignore errors
      } finally {
        removeToken();
        setIsLoggingOut(false);
      }
    };

    performLogout();
  }, [removeToken]);

  if (isLoggingOut) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardBody className="flex flex-col items-center gap-4 py-8">
            <p className="text-lg">Signing out...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center gap-6 py-8">
          <CheckCircleIcon className="w-16 h-16 text-success" />
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Thank You</h1>
            <p className="text-gray-500">You have been successfully signed out.</p>
          </div>
          <Button
            color="primary"
            size="lg"
            onPress={() => router.push("/auth/login")}
            className="w-full max-w-xs"
          >
            Sign In Again
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
