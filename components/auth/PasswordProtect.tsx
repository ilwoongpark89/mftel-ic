"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppShell from "@/components/layout/AppShell";

// Simple hash function for password verification (not cryptographically secure, but sufficient for basic protection)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Pre-computed hash of "Mftel7335!"
const CORRECT_HASH = hashPassword("Mftel7335!");
const SESSION_KEY = "mftel_auth";

interface PasswordProtectProps {
  children: React.ReactNode;
}

export default function PasswordProtect({ children }: PasswordProtectProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated in this session
    const authStatus = sessionStorage.getItem(SESSION_KEY);
    if (authStatus === CORRECT_HASH) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (hashPassword(password) === CORRECT_HASH) {
      sessionStorage.setItem(SESSION_KEY, CORRECT_HASH);
      setIsAuthenticated(true);
    } else {
      setError("비밀번호가 올바르지 않습니다.");
      setPassword("");
    }
  };

  if (isLoading) {
    return (
      <AppShell showFooter={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AppShell>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <AppShell showFooter={false}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4"
        >
          <div className="p-8 rounded-2xl bg-card border border-border shadow-lg">
            <div className="flex flex-col items-center mb-6">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold">Access Protected</h1>
              <p className="text-sm text-muted-foreground text-center mt-2">
                이 페이지에 접근하려면 비밀번호가 필요합니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-red-500"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full">
                확인
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              MFTEL Lab // Inha University
            </p>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
