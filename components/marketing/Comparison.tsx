"use client";

import { motion } from "framer-motion";
import { Check, X, Wind, Droplets } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface ComparisonItem {
  feature: string;
  air: boolean | string;
  immersion: boolean | string;
}

const comparisonData: ComparisonItem[] = [
  { feature: "Heat Dissipation (W/cm²)", air: "< 10", immersion: "100+" },
  { feature: "Thermal Resistance", air: "High", immersion: "Very Low" },
  { feature: "Temperature Uniformity", air: false, immersion: true },
  { feature: "Noise Level", air: "High", immersion: "Silent" },
  { feature: "Energy Efficiency", air: "Baseline", immersion: "Up to 90% savings" },
  { feature: "Maintenance", air: "Dust, Fans", immersion: "Minimal" },
  { feature: "Scalability for AI/HPC", air: false, immersion: true },
  { feature: "Environmental Footprint", air: "Higher", immersion: "Lower" },
];

export default function Comparison() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-muted/30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          {/* Section header */}
          <motion.div variants={fadeInUp} className="text-center space-y-4">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Air Cooling vs Immersion Cooling
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              See why leading data centers are transitioning to immersion cooling
              for high-density computing workloads.
            </p>
          </motion.div>

          {/* Comparison cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Air Cooling Card */}
            <div className="p-6 rounded-xl glass border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <Wind className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Air Cooling</h3>
                  <p className="text-sm text-muted-foreground">Traditional approach</p>
                </div>
              </div>
              <ul className="space-y-3">
                {comparisonData.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.feature}</span>
                    <span className={cn(
                      "font-medium",
                      item.air === false ? "text-red-500" : "text-foreground"
                    )}>
                      {item.air === false ? <X className="h-4 w-4" /> :
                       item.air === true ? <Check className="h-4 w-4 text-emerald-500" /> :
                       item.air}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Immersion Cooling Card */}
            <div className="p-6 rounded-xl glass border border-primary/50 glow-primary">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Immersion Cooling</h3>
                  <p className="text-sm text-muted-foreground">Next-generation solution</p>
                </div>
              </div>
              <ul className="space-y-3">
                {comparisonData.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.feature}</span>
                    <span className={cn(
                      "font-medium",
                      item.immersion === true ? "text-emerald-500" : "text-foreground"
                    )}>
                      {item.immersion === false ? <X className="h-4 w-4 text-red-500" /> :
                       item.immersion === true ? <Check className="h-4 w-4" /> :
                       item.immersion}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Full comparison table */}
          <motion.div variants={fadeInUp} className="rounded-xl glass border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-semibold">Feature</th>
                    <th className="text-center p-4 text-sm font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <Wind className="h-4 w-4 text-amber-500" />
                        Air
                      </div>
                    </th>
                    <th className="text-center p-4 text-sm font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <Droplets className="h-4 w-4 text-primary" />
                        Immersion
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm">{item.feature}</td>
                      <td className="p-4 text-center">
                        {item.air === false ? (
                          <X className="h-4 w-4 text-red-500 mx-auto" />
                        ) : item.air === true ? (
                          <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{item.air}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {item.immersion === false ? (
                          <X className="h-4 w-4 text-red-500 mx-auto" />
                        ) : item.immersion === true ? (
                          <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-sm font-medium text-primary">{item.immersion}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
