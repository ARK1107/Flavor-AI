"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Loader2,
  Plus,
  X,
  ChefHat,
  ShoppingBasket,
  Shield,
  Save,
  Clock,
  Flame,
  Image as ImageIcon,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const DIETARY_OPTIONS = [
  "Vegan",
  "Vegetarian",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Nut-Free",
  "Halal",
  "Kosher",
  "Low-Carb",
  "Low-Sodium",
  "Diabetic-Friendly",
];

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [pantryStaples, setPantryStaples] = useState<string[]>([]);
  const [newStaple, setNewStaple] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  // Load profile data from Supabase
  useEffect(() => {
    if (authLoading || !user) return;
    
    const fetchProfile = async () => {
      setIsFetching(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("dietary_restrictions, pantry_staples")
        .eq("id", user.id)
        .single();

      if (data) {
        setDietaryRestrictions(data.dietary_restrictions || []);
        setPantryStaples(data.pantry_staples || []);
      }
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }
      setIsFetching(false);
    };
    fetchProfile();
    fetchSavedRecipes();
  }, [user]);

  const fetchSavedRecipes = async () => {
    if (!user) return;
    setIsLoadingRecipes(true);
    try {
      const { data, error } = await supabase
        .from("saved_recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedRecipes(data || []);
    } catch (err) {
      console.error("Error fetching saved recipes:", err);
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const toggleDietaryRestriction = (option: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(option) ? prev.filter((r) => r !== option) : [...prev, option]
    );
  };

  const addStaple = () => {
    const trimmed = newStaple.trim();
    if (!trimmed) return;
    if (pantryStaples.includes(trimmed.toLowerCase())) {
      toast.error("Already in your pantry staples.");
      return;
    }
    setPantryStaples((prev) => [...prev, trimmed.toLowerCase()]);
    setNewStaple("");
  };

  const removeStaple = (staple: string) => {
    setPantryStaples((prev) => prev.filter((s) => s !== staple));
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        dietary_restrictions: dietaryRestrictions,
        pantry_staples: pantryStaples,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Preferences saved! Your AI recipes will now reflect these settings.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out. See you soon! 👋");
    router.push("/");
    router.refresh();
  };

  if (authLoading || isFetching) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (!user) return null;

  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-10 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-3xl p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                <User size={36} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                  My Profile
                </h1>
                <div className="flex flex-col sm:flex-row gap-3 mt-2 justify-center sm:justify-start">
                  <span className="flex items-center gap-1.5 text-sm text-foreground/60">
                    <Mail size={14} className="text-primary" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-foreground/60">
                    <Calendar size={14} className="text-primary" />
                    Joined {joinedDate}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary/10 text-primary rounded-full">
                  <ChefHat size={12} />
                  Flavor AI Member
                </span>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-semibold"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Dietary Restrictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass rounded-3xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Dietary Restrictions</h2>
              <p className="text-sm text-foreground/55">
                The AI will automatically respect these when generating recipes.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {DIETARY_OPTIONS.map((option) => {
              const isSelected = dietaryRestrictions.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => toggleDietaryRestriction(option)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105"
                      : "bg-foreground/5 text-foreground/70 border-border hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Pantry Staples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass rounded-3xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <ShoppingBasket size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Pantry Staples</h2>
              <p className="text-sm text-foreground/55">
                Always-available ingredients the AI can freely use in every recipe.
              </p>
            </div>
          </div>

          {/* Staple tags */}
          <div className="min-h-[56px] flex flex-wrap gap-2">
            {pantryStaples.length === 0 && (
              <p className="text-sm text-foreground/40 italic">
                No staples added yet. Add things like salt, olive oil, garlic…
              </p>
            )}
            {pantryStaples.map((staple) => (
              <span
                key={staple}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20"
              >
                {staple}
                <button
                  onClick={() => removeStaple(staple)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          {/* Add staple input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newStaple}
              onChange={(e) => setNewStaple(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStaple())}
              placeholder="e.g., olive oil, garlic, salt..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-foreground/5 border border-border focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm placeholder:text-foreground/30"
            />
            <button
              onClick={addStaple}
              className="px-4 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 transition-colors font-semibold text-sm flex items-center gap-1.5"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex justify-end"
        >
          <motion.button
            onClick={handleSavePreferences}
            disabled={isSaving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Saving…" : "Save Preferences"}
          </motion.button>
        </motion.div>

        {/* My Saved Recipes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-6 pt-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <ChefHat size={20} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">My Saved Recipes</h2>
            </div>
            <span className="text-sm font-medium text-foreground/40 bg-foreground/5 px-3 py-1 rounded-full">
              {savedRecipes.length} Recipes
            </span>
          </div>

          {isLoadingRecipes ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary/40" size={32} />
            </div>
          ) : savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedRecipes.map((recipe) => (
                <Link 
                  key={recipe.id} 
                  href={`/recipe/${recipe.id}`}
                  className="group relative flex flex-col glass rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 border border-border/50 hover:border-primary/30"
                >
                  <div className="relative h-32 w-full bg-black/10">
                    {recipe.image_url ? (
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/20">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-foreground/50 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-accent" /> {recipe.cook_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame size={12} className="text-primary" /> {recipe.macros?.calories || 0} kcal
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                    <ChevronRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass rounded-3xl border-dashed border-2 border-border/50">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-foreground/5 text-foreground/20">
                  <ChefHat size={48} />
                </div>
              </div>
              <p className="text-foreground/40 font-medium">You haven&apos;t saved any recipes yet.</p>
              <Link 
                href="/" 
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Go craft some dishes <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
