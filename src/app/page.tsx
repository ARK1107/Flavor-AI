"use client";

import { useState } from "react";
import { IngredientInput } from "@/components/ui/IngredientInput";
import { RecipeDisplay } from "@/components/ui/RecipeDisplay";
import { LoadingChef } from "@/components/ui/LoadingChef";
import { type Recipe } from "@/types/recipe";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveToFavorites = async () => {
    if (!recipe) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save favorites.");
        return;
      }

      const { error } = await supabase.from("saved_recipes").insert({
        user_id: user.id,
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        macros: recipe.macros,
        visual_image_prompt: recipe.visual_image_prompt,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        missing_ingredients: recipe.missing_ingredients,
        substitutes: recipe.substitutes,
        image_url: recipe.image_url,
        is_public: false // Favorites are private by default
      });

      if (error) throw error;
      
      setIsSaved(true);
      toast.success("Recipe saved to your favorites! ❤️");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save recipe.");
    }
  };

  const handleGenerate = async (text: string) => {
    setIsLoading(true);
    setRecipe(null);
    setIsSaved(false);
    try {
      const response = await fetch("/api/recipe/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        let errorMessage = "Failed to generate recipe.";
        try {
          const errorJson = await response.json();
          errorMessage = errorJson.error || errorMessage;
        } catch {
          const textError = await response.text();
          console.error("API returned non-JSON error:", textError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.recipe) {
        // Attach the generated image URL to the recipe object for display
        const enrichedRecipe = {
          ...data.recipe,
          image_url: data.imageUrl || data.recipe.image_url
        };
        setRecipe(enrichedRecipe);
        toast.success("Recipe generated successfully!");
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "An error occurred while crafting your dish.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col pt-12 pb-24 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background relative overflow-hidden">
      
      {/* Decorative blurred blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="max-w-4xl mx-auto w-full space-y-12">
        {!recipe && !isLoading && (
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground">
              Defeat <span className="text-gradient">Dinner Fatigue</span>
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto font-medium">
              Tell us what's in your fridge, and our AI will craft a delicious, customized recipe tailored to your pantry.
            </p>
          </div>
        )}

        <IngredientInput onSubmit={handleGenerate} isLoading={isLoading} />

        {isLoading && (
          <div className="py-12">
            <LoadingChef />
          </div>
        )}

        {recipe && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <RecipeDisplay 
              recipe={recipe} 
              onSave={handleSaveToFavorites}
              isSaved={isSaved}
            />
          </div>
        )}
      </div>
    </div>
  );
}
