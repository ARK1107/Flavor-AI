import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Recipe } from "@/types/recipe";
import { Clock, Flame, Heart, Image as ImageIcon, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface SavedRecipe extends Recipe {
  id: string;
  created_at: string;
}

export default async function FavoritesPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/favorites");
  }

  const { data: recipes, error } = await supabase
    .from("saved_recipes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading favorites:", error);
  }

  const savedRecipes = recipes as SavedRecipe[] || [];

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="space-y-6 text-center max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors mb-4 px-4 py-2 bg-primary/10 rounded-full hover:bg-primary/20">
          ← Back to Generator
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          My <span className="text-gradient">Favorites</span>
        </h1>
        <p className="text-lg text-foreground/60">
          Your personal collection of recipes handcrafted by Flavor AI.
        </p>
      </div>

      {savedRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-black/5 dark:bg-white/5 rounded-3xl border border-dashed border-border gap-4">
          <div className="bg-primary/10 p-4 rounded-full text-primary">
            <Heart size={48} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">No favorites yet</h3>
            <p className="text-foreground/50">Start generating and saving recipes to build your kitchen!</p>
          </div>
          <Link href="/" className="px-6 py-3 rounded-full bg-primary text-white font-bold hover:opacity-90 transition-opacity">
            Craft a Recipe
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRecipes.map((recipe) => (
            <div
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
                    <span className="flex items-center gap-1"><Flame size={14} className="text-primary hover:text-red-500" /> {recipe.macros?.calories || 0} kcal</span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-sm text-foreground/70 line-clamp-2">
                  Ingredients: {recipe.ingredients?.slice(0, 3).map(i => i.name).join(", ")}...
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
