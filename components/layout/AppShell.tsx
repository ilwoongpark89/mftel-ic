"use client";

import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import { pageTransition } from "@/lib/animations";

interface AppShellProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function AppShell({ children, showFooter = true }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 gradient-mesh opacity-50" />

      {/* Floating orbs for visual interest */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-2/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-chart-4/5 rounded-full blur-3xl" />
      </div>

      <Header />

      <motion.main
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1"
      >
        {children}
      </motion.main>

      {showFooter && <Footer />}
    </div>
  );
}
