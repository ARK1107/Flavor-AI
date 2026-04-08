import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// Load env directly since this is run in node and Next.js isn't auto-loading `.env.local` for pure node scripts normally
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const dummyRecipes = [
  {
    title: "High Protein Vegan Bowl",
    ingredients: [{ name: "Tofu", quantity: 1, unit: "block" }, { name: "Quinoa", quantity: 1, unit: "cup" }],
    instructions: ["Cook quinoa.", "Air fry tofu.", "Mix together."],
    macros: { calories: 400, protein: 35, carbs: 45, fats: 12 },
    prep_time: "10m",
    cook_time: "15m",
    missing_ingredients: [],
    substitutes: [],
    tags: ["Vegan", "High Protein", "Quick Prep"],
    is_public: true,
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    visual_image_prompt: "A beautiful vegan protein bowl."
  },
  {
    title: "Steak and Asparagus Gourmet",
    ingredients: [{ name: "Ribeye Steak", quantity: 1, unit: "lb" }, { name: "Asparagus", quantity: 1, unit: "bunch" }],
    instructions: ["Sear steak.", "Roast asparagus.", "Serve immediately."],
    macros: { calories: 750, protein: 60, carbs: 10, fats: 50 },
    prep_time: "5m",
    cook_time: "10m",
    missing_ingredients: [],
    substitutes: [],
    tags: ["High Protein", "Quick Prep", "Low Carb"],
    is_public: true,
    image_url: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    visual_image_prompt: "Juicy seared ribeye steak."
  }
];

async function seed() {
  console.log("Seeding recipes...");
  const { data, error } = await supabase.from('saved_recipes').insert(dummyRecipes).select();
  
  if (error) {
    console.error("Failed to insert recipes. You might need to run the Supabase SQL to create the table or disable RLS.", error);
  } else {
    console.log("Successfully seeded", data?.length, "recipes!");
  }
}

seed();
