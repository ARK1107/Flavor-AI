import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { RecipeDisplay } from "@/components/ui/RecipeDisplay";
import { type Recipe } from "@/types/recipe";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Forcing dynamic rendering to ensure the latest recipe data (and images) are always displayed without stale cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  // Accessing params must be awaited in Next.js 15
  const { id } = await params;
  const cookieStore = await cookies();

  // Initialize server-side Supabase client to pass authenticated cookies
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
            // Can be ignored if handled by middleware
          }
        },
      },
    }
  );

  // Fetch recipe from database using server-side client
  const { data: recipeData, error } = await supabase
    .from("saved_recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !recipeData) {
    if (error?.code !== 'PGRST116') {
      console.error("Recipe load error:", error);
    }
    notFound();
  }

  // Cast the row to the Recipe type
  const recipe: Recipe = {
    title: recipeData.title,
    ingredients: recipeData.ingredients,
    instructions: recipeData.instructions,
    macros: recipeData.macros,
    image_url: recipeData.image_url,
    visual_image_prompt: recipeData.visual_image_prompt,
    prep_time: recipeData.prep_time,
    cook_time: recipeData.cook_time,
    missing_ingredients: recipeData.missing_ingredients,
    substitutes: recipeData.substitutes,
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link 
          href="/discover" 
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors font-medium mb-4"
        >
          <ChevronLeft size={20} />
          Back to Discover
        </Link>
        
        <RecipeDisplay recipe={recipe} />
      </div>
    </main>
  );
}
