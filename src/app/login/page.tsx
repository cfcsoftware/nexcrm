"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAction(email, password);
      if (res.success) {
        // Redirect to dashboard or the original redirect path
        const redirectPath = searchParams.get("redirect") || "/dashboard";
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(res.error || "Invalid credentials.");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="flex items-center space-x-2 bg-blue-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-500/20 mb-3">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">NexCRM</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your business leads, clients & tasks</p>
        </div>

        <Card className="shadow-xl shadow-slate-200/50 border border-slate-200/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-slate-900">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your admin credentials below to log in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-start space-x-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <svg
                    className="h-5 w-5 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block" htmlFor="email">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@crm.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 block" htmlFor="password">
                    Password
                  </label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-500/50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <p className="text-xs text-slate-400">
                Default Credentials: admin@crm.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="py-8 text-center text-slate-500">Loading portal...</div>}>
      <LoginContent />
    </React.Suspense>
  );
}
