"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScaleRecipeProps {
  multiplier: number;
  onChange: (multiplier: number) => void;
}

const scales = [
  { value: 0.5, label: "½x" },
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
  { value: 4, label: "4x" },
];

export function ScaleRecipe({ multiplier, onChange }: ScaleRecipeProps) {
  return (
    <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-1.5 rounded-full border border-border/50">
      <div className="pl-3 pr-2 text-foreground/50 border-r border-border/50 flex items-center gap-1.5">
        <Users size={16} />
        <span className="text-xs font-semibold tracking-wider uppercase">Scale</span>
      </div>
      <div className="flex bg-transparent">
        {scales.map((scale) => {
          const isSelected = multiplier === scale.value;
          return (
            <button
              key={scale.value}
              onClick={() => onChange(scale.value)}
              className={cn(
                "relative px-4 py-1.5 rounded-full text-sm font-semibold transition-colors z-10",
                isSelected ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="scale-active"
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              {scale.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
