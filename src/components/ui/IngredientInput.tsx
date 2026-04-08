"use client";

import { motion } from "framer-motion";
import { Sparkles, UploadCloud } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface IngredientInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export function IngredientInput({ onSubmit, isLoading }: IngredientInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto glass rounded-3xl p-6 sm:p-8"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            What's in your fridge?
          </h2>
          <p className="text-foreground/60 text-sm">
            Type out your ingredients, and our AI will craft the perfect dish.
          </p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Chicken breast, some bell peppers, half a lemon..."
          className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-2xl p-4 min-h-[200px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-foreground/40 transition-all font-medium"
        />

        <button
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className={cn(
            "w-full rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl",
            !text.trim() || isLoading
              ? "bg-black/10 dark:bg-white/10 text-foreground/40 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-[1.02]"
          )}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <UploadCloud size={24} />
            </motion.div>
          ) : (
            <>
              <Sparkles size={24} />
              Generate Recipe
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
