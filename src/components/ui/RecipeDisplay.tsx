"use client";

import { motion } from "framer-motion";
import { Clock, ChefHat, Heart, Share2, Info } from "lucide-react";
import { type Recipe } from "@/types/recipe";
import { MacroCalculator } from "./MacroCalculator";
import { ScaleRecipe } from "./ScaleRecipe";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface RecipeDisplayProps {
  recipe: Recipe;
  onSave?: () => void;
  isSaved?: boolean;
}

export function RecipeDisplay({ recipe, onSave, isSaved = false }: RecipeDisplayProps) {
  const [multiplier, setMultiplier] = useState(1);
  const { user } = useAuth();
  const router = useRouter();

  const handleSave = () => {
    if (!user) {
      toast.error("Please sign in to save recipes to your favorites.");
      router.push("/login");
      return;
    }
    onSave?.();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto glass rounded-[2rem] overflow-hidden"
    >
      {/* Header Image Area */}
      <div className="relative h-64 sm:h-80 w-full bg-black/10 dark:bg-white/5 overflow-hidden">
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-foreground/30 gap-4">
            <ChefHat size={48} />
            <p className="font-semibold text-lg">AI Generated Visualization Pending...</p>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-md">
              {recipe.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
              <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                <Clock size={16} className="text-accent" />
                Prep: {recipe.prep_time}
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                <Flame size={16} className="text-primary hover:text-red-500" />
                Cook: {recipe.cook_time}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors">
              <Share2 size={20} />
            </button>
            <button
              onClick={handleSave}
              className={cn(
                "p-3 rounded-full backdrop-blur-md transition-colors",
                isSaved ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white hover:bg-white/20"
              )}
              title={user ? (isSaved ? "Saved to Favorites" : "Save to Favorites") : "Sign in to save"}
            >
              <Heart size={20} className={isSaved ? "fill-current" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        <MacroCalculator macros={recipe.macros} multiplier={multiplier} />

        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h2 className="text-2xl font-bold">Ingredients</h2>
          <ScaleRecipe multiplier={multiplier} onChange={setMultiplier} />
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {/* Ingredients Left Column */}
          <div className="space-y-4">
            <ul className="space-y-3">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                  <span className="text-lg text-foreground/90">
                    <span className="font-semibold text-primary">
                      {ing.quantity > 0 ? (ing.quantity * multiplier).toFixed(ing.quantity % 1 !== 0 ? 1 : 0) : ""}{" "}
                    </span>
                    <span className="font-medium text-foreground/70">{ing.unit}</span>{" "}
                    {ing.name}
                  </span>
                </li>
              ))}
            </ul>

            {recipe.substitutes.length > 0 && (
              <div className="mt-6 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
                <h4 className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                  <Info size={18} /> Substituted Ingredients
                </h4>
                <ul className="space-y-2 text-sm text-foreground/80">
                  {recipe.substitutes.map((sub, i) => (
                    <li key={i}>
                      Used <strong className="text-foreground">{sub.replacement}</strong> instead of {sub.original}. 
                      <span className="text-foreground/60 italic ml-1">({sub.reason})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {recipe.missing_ingredients.length > 0 && (
              <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
                <h4 className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400">
                  Missing Ingredients
                </h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  {recipe.missing_ingredients.map((miss, i) => (
                    <span key={i} className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-md">
                      {miss}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions Right Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-border/50 pb-4">Instructions</h2>
            <ol className="space-y-6">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                    {i + 1}
                  </span>
                  <p className="text-foreground/80 leading-relaxed pt-1">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Quick fallback for Flame not imported in main list
function Flame(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
