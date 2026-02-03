"use client";

import { motion } from "framer-motion";
import {
  Thermometer,
  Database,
  LineChart,
  Droplets,
  Wind,
  Gauge,
  ArrowRight
} from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const features = [
  {
    icon: LineChart,
    title: "Boiling Curve Analysis",
    description: "Visualize heat flux vs temperature relationships with interactive charts. Compare multiple datasets and identify optimal operating points.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Database,
    title: "Experiment Data Management",
    description: "Store and organize boiling experiment data. Import from CSV, track surface modifications, and maintain a comprehensive thermal database.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Thermometer,
    title: "Real-time Calculations",
    description: "Instantly compute heat transfer coefficients, surface temperatures, and cooling power requirements as you adjust parameters.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Droplets,
    title: "Multiple Coolants",
    description: "Pre-loaded properties for Novec 7100, FC-72, HFE-7200, and more. Support for custom fluid properties based on your experiments.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Wind,
    title: "Air vs Immersion Comparison",
    description: "Side-by-side comparison of natural convection, forced convection, and two-phase immersion cooling performance.",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Gauge,
    title: "GPU Presets",
    description: "Built-in specifications for H100, H200, RTX 4090, MI300X, and other popular GPUs. Quick-start your thermal analysis.",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          {/* Section header */}
          <motion.div variants={fadeInUp} className="text-center space-y-4">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything You Need for Thermal Analysis
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              Purpose-built tools for engineers working on immersion cooling systems
              and high-power electronics thermal management.
            </p>
          </motion.div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group p-6 rounded-xl glass border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
