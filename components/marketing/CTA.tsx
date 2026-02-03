"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-chart-2/10" />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center space-y-8"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium"
          >
            <Zap className="h-4 w-4 text-primary" />
            Free to use
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
          >
            Ready to Optimize Your
            <br />
            <span className="text-gradient">Cooling Strategy?</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Start analyzing thermal performance today. Upload your experiment data
            or use our GPU presets to compare cooling methods instantly.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 text-lg px-8 py-6">
                Launch Dashboard
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/input">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Add Your Data
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            className="text-sm text-muted-foreground"
          >
            Built by MFTEL Lab at Inha University
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
