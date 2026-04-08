"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type Recipe } from "@/types/recipe";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, Flame, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface SavedRecipe extends Recipe {
  id: string;
  created_at: string;
}

export default function DiscoverPage() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "High Protein", "Quick Prep", "Low Carb"];

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecipes(data as SavedRecipe[]);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load community recipes.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "High Protein") return r.macros.protein > 30;
    if (activeFilter === "Quick Prep") return parseInt(r.prep_time) < 20 || r.prep_time.includes("10") || r.prep_time.includes("15");
    if (activeFilter === "Low Carb") return r.macros.carbs < 25;
    
    return true;
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="space-y-6 text-center max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors mb-4 px-4 py-2 bg-primary/10 rounded-full hover:bg-primary/20">
          ← Back to Generator
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Community <span className="text-gradient">Creations</span>
        </h1>
        <p className="text-lg text-foreground/60">
          Discover mouth-watering dishes crafted by Flavor AI from everyday ingredients.
        </p>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-black/5 dark:bg-white/5 text-foreground/70 hover:bg-black/10 dark:hover:bg-white/10"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Clock size={32} className="text-primary/50" />
          </motion.div>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRecipes.map((recipe) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={recipe.id}
                className="glass rounded-3xl overflow-hidden group hover:-translate-y-1 hover:shadow-2xl transition-all"
              >
                <div className="relative h-48 bg-black/10 dark:bg-white/5">
                  {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/30"><ImageIcon size={40} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-xl line-clamp-1">{recipe.title}</h3>
                    <div className="flex items-center gap-3 text-sm font-medium text-white/80 mt-1">
                      <span className="flex items-center gap-1"><Clock size={14} className="text-accent" /> {recipe.cook_time}</span>
                      <span className="flex items-center gap-1"><Flame size={14} className="text-primary" /> {recipe.macros?.calories || 0} kcal</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-sm text-foreground/70 line-clamp-2">
                    Features: {recipe.ingredients?.slice(0, 3).map(i => i.name).join(", ")}...
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md uppercase tracking-wider">
                      {recipe.macros?.protein || 0}g Protein
                    </span>
                    <Link href={`/recipe/${recipe.id}`} className="text-sm font-semibold text-foreground/60 hover:text-primary transition-colors">
                      View Recipe →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredRecipes.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-foreground/50">
              No recipes found for this filter. Try adjusting your search!
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
