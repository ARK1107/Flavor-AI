import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function uploadImageToSupabase(base64Data: string, fileName: string, supabaseClient: any) {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("recipe-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError.message);
      return null;
    }

    const { data: { publicUrl } } = supabaseClient.storage
      .from("recipe-images")
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Storage helper failed:", error);
    return null;
  }
}

async function generateRecipeImage(title: string, apiKey: string, supabaseClient: any) {
  try {
    // Requirements: Update Model ID to Flagship Imagen 4 Pro (imagen-4.0-generate-001)
    const MODEL_NAME = "imagen-4.0-generate-001";
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:predict`;
    
    // URGENT DEBUG: Start Instrumentation
    console.log("--- IMAGE DEBUG START ---");
    console.log(`Generating image for: ${title} using ${MODEL_NAME}`);

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        instances: [{ 
          prompt: `High-end professional food photography of ${title}, ultra-high resolution, gourmet styling, perfect lighting, cinematic composition` 
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          outputMimeType: "image/jpeg"
        },
      }),
    });

    // URGENT DEBUG: Log Response Status
    console.log("Image API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Nano Banana Pro API Error:", errorText);
      return null;
    }

    const data = await response.json();
    console.log("3. Image data received from API");
    const base64 = data.predictions?.[0]?.bytesBase64Encoded || data.predictions?.[0]?.bytes;
    
    if (!base64) {
      console.warn("No image data found in predictions.");
      return null;
    }

    // URGENT DEBUG: Image Data Preview
    console.log("Image Data Preview:", base64.substring(0, 50));

    // Persist to Supabase Storage
    const fileName = `recipe-${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`;
    const storageUrl = await uploadImageToSupabase(base64, fileName, supabaseClient);

    return storageUrl || `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("--- IMAGE DEBUG ERROR ---");
    console.error("Pro Image generation failed:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const apiKey = process.env.AI_PROVIDER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not found." }, { status: 500 });
    }

    // Initialize Server-side Supabase Client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch { /* Handled by Next.js */ }
          },
        },
      }
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

    const prompt = `You are a Michelin-star chef. Create a detailed five-star recipe using these ingredients: ${text}.
    Return a JSON object matching this structure EXACTLY:
    {
      "title": "Recipe Name",
      "ingredients": [{ "name": "Item", "quantity": 1, "unit": "g" }],
      "instructions": ["Step 1", "Step 2"],
      "macros": { "calories": 0, "protein": 0, "carbs": 0, "fats": 0 },
      "prep_time": "10m",
      "cook_time": "20m",
      "missing_ingredients": ["optional gourmet items"],
      "substitutes": [{ "original": "x", "replacement": "y", "reason": "z" }]
    }
    Return ONLY JSON.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const recipeData = JSON.parse(cleanedText);
    console.log("1. Text recipe generated successfully");

    // Instrument Image Generation
    console.log("2. Starting image generation with model: imagen-4.0-generate-001");
    
    // Safety Timeout (20 seconds)
    const timeout = (ms: number) => new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
    
    const imageUrl = await Promise.race([
      generateRecipeImage(recipeData.title, apiKey, supabase),
      timeout(20000)
    ]);
    
    // Save to database
    console.log("4. Attempting to save to Supabase...");
    
    let savedRecipe = null;
    try {
      const { data, error: saveError } = await supabase
        .from("saved_recipes")
        .insert({
          title: recipeData.title,
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
          macros: recipeData.macros,
          image_url: imageUrl,
          prep_time: recipeData.prep_time,
          cook_time: recipeData.cook_time,
          missing_ingredients: recipeData.missing_ingredients,
          substitutes: recipeData.substitutes,
          is_public: true
        })
        .select()
        .single();

      if (saveError) {
        console.error("Supabase Save Error:", saveError.message);
      } else {
        savedRecipe = data;
        console.log("Supabase Insert Success. Record ID:", savedRecipe?.id);
      }
    } catch (saveError: any) {
      console.error("URGENT DEBUG: Supabase Save Bridge Crashed:", saveError.message);
    }

    console.log("5. Final response sent to frontend");

    return NextResponse.json({ 
      recipe: {
        ...recipeData,
        id: savedRecipe?.id,
        image_url: imageUrl
      },
      imageUrl: imageUrl 
    });

  } catch (error: any) {
    console.error("URGENT DEBUG: Backend Crash:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
