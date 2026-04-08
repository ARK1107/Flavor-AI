export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Substitute {
  original: string;
  replacement: string;
  reason: string;
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Recipe {
  title: string;
  ingredients: Ingredient[];
  instructions: string[];
  macros: Macros;
  image_url?: string;
  visual_image_prompt?: string;
  prep_time: string;
  cook_time: string;
  missing_ingredients: string[];
  substitutes: Substitute[];
}
