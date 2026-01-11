"use client";

import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";
import Dashboard from "@/components/enhanced-dashboard";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    keycloak
      .init({ onLoad: "login-required" })
      .then((authenticated) => {
        setAuthenticated(authenticated);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Keycloak init failed:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <div>
            <p className="text-lg font-semibold text-gray-900">Loading...</p>
            <p className="text-sm text-gray-600">Authenticating your session</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-lg shadow-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600">
            Authentication Failed
          </h1>
          <p className="mt-2 text-gray-600">
            Please refresh the page to try again
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dashboard keycloak={keycloak} />
      <Toaster />
    </>
  );
}

