"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardHover } from "@/lib/animations";

export type StatsCardVariant = "default" | "success" | "warning" | "danger" | "info";

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  variant?: StatsCardVariant;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const variantStyles: Record<StatsCardVariant, {
  bg: string;
  text: string;
  glow: string;
  iconBg: string;
}> = {
  default: {
    bg: "bg-card",
    text: "text-foreground",
    glow: "",
    iconBg: "bg-primary/10 text-primary",
  },
  success: {
    bg: "bg-card",
    text: "text-emerald-500",
    glow: "glow-success",
    iconBg: "bg-emerald-500/10 text-emerald-500",
  },
  warning: {
    bg: "bg-card",
    text: "text-amber-500",
    glow: "glow-warning",
    iconBg: "bg-amber-500/10 text-amber-500",
  },
  danger: {
    bg: "bg-card",
    text: "text-red-500",
    glow: "glow-danger",
    iconBg: "bg-red-500/10 text-red-500",
  },
  info: {
    bg: "bg-card",
    text: "text-primary",
    glow: "glow-primary",
    iconBg: "bg-primary/10 text-primary",
  },
};

export default function StatsCard({
  title,
  value,
  unit,
  icon: Icon,
  variant = "default",
  description,
  trend,
  className,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className={cn(
        "relative p-5 rounded-xl border border-border/50 glass overflow-hidden",
        styles.bg,
        styles.glow,
        className
      )}
    >
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("text-3xl font-bold tabular-nums", styles.text)}
            >
              {value}
            </motion.span>
            {unit && (
              <span className="text-sm text-muted-foreground font-medium">
                {unit}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-emerald-500" : "text-red-500"
            )}>
              <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
              <span className="text-muted-foreground">vs baseline</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={cn(
            "p-3 rounded-lg",
            styles.iconBg
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
