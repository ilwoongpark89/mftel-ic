"use client";

import { motion } from "framer-motion";
import { Database, FolderOpen } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import DataManageTab from "@/components/tabs/DataManageTab";
import { fadeInUp } from "@/lib/animations";

export default function ManagePage() {
  return (
    <AppShell showFooter={false}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex items-center gap-3"
        >
          <div className="p-3 rounded-lg bg-primary/10">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Data Management</h1>
            <p className="text-muted-foreground text-sm">
              View, compare, and export saved datasets
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <DataManageTab />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground text-center"
        >
          MFTEL Lab // Inha University // Prof. Il Woong Park
        </motion.p>
      </div>
    </AppShell>
  );
}
