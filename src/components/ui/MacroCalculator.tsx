"use client";

import { motion } from "framer-motion";
import { type Macros } from "@/types/recipe";
import { Flame, Beef, Wheat, Droplets } from "lucide-react";

interface MacroCalculatorProps {
  macros: Macros;
  multiplier?: number;
}

export function MacroCalculator({ macros, multiplier = 1 }: MacroCalculatorProps) {
  const items = [
    { label: "Calories", value: Math.round(macros.calories * multiplier), unit: "kcal", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Protein", value: Math.round(macros.protein * multiplier), unit: "g", icon: Beef, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Carbs", value: Math.round(macros.carbs * multiplier), unit: "g", icon: Wheat, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Fats", value: Math.round(macros.fats * multiplier), unit: "g", icon: Droplets, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl border border-border/50 bg-black/5 dark:bg-white/5"
        >
          <div className={`p-2 rounded-full ${item.bg} ${item.color} mb-2`}>
            <item.icon size={18} />
          </div>
          <span className="text-xl font-bold text-foreground">
            {item.value}
            <span className="text-sm font-medium text-foreground/50 ml-1">{item.unit}</span>
          </span>
          <span className="text-xs text-foreground/60 font-medium uppercase tracking-wider mt-1">
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
