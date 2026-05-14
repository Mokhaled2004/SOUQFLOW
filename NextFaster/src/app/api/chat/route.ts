import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { messages, locale = 'en' } = await req.json();

    // 1. Fetch all active stores
    const allStores = await db
      .select({
        name: stores.storeName,
        slug: stores.slug,
        description: stores.storeDescription,
      })
      .from(stores)
      .where(eq(stores.isActive, 1));

    // 2. Fetch all active products and their stores for context
    const allProducts = await db
      .select({
        slug: products.slug,
        name: products.name,
        description: products.description,
        price: products.price,
        storeName: stores.storeName,
        storeSlug: stores.slug,
        isActive: products.isActive,
      })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .where(eq(products.isActive, 1));

    // 3. Format context
    const storesContext = allStores
      .map((s) => `- Store: [${s.name}] (Slug: ${s.slug}). Description: ${s.description || 'No description'}`)
      .join("\n");

    const productsContext = allProducts
      .map(
        (p) =>
          `- Product: [${p.name}] (Slug: ${p.slug}) at [${p.storeName}] (StoreSlug: ${p.storeSlug}): ${p.price} EGP. Description: ${p.description || 'No description available'}`
      )
      .join("\n");

    const systemPrompt = `You are "SouqFlowy", a helpful and premium AI shopping assistant for the SouqFlow platform.
Your goal is to answer questions about stores and products available on the platform.

LIST OF AVAILABLE STORES:
${storesContext}

LIST OF AVAILABLE PRODUCTS:
${productsContext}

Guidelines:
- STRICTLY only use the information provided in the inventory above.
- DO NOT invent ingredients, features, or details that are not in the description.
- If a user asks for details and the description is short, just provide the description.
- Group items by store for better readability.
- Use markdown links for products and stores using the following formats:
  • Product Link: [Product Name](/${locale}/STORE_SLUG?view=detail&product=PRODUCT_SLUG)
  • Store Link: [Store Name](/${locale}/STORE_SLUG)
- Only include items that are DIRECTLY relevant to the user's query.
- Use simple bullet points to list items. DO NOT use markdown tables.
- Use clear line breaks (new lines) between different stores or sections.
- Format:
  [Store Name](/${locale}/STORE_SLUG):
  • [Product Name](/${locale}/STORE_SLUG?view=detail&product=PRODUCT_SLUG): Price EGP
- Be polite, concise, and professional.
- If you don't find a product, politely say you couldn't find it in the current listings.
- Your name is SouqFlowy.`;

  const ollamaUrl = process.env.OLLAMA_BASE_URL || "https://ollama.com";
  const ollamaKey = process.env.OLLAMA_API_KEY;
  const ollamaModel = process.env.OLLAMA_MODEL || "gpt-oss:120b-cloud";

  // Note: Using standard Ollama/OpenAI-compatible chat endpoint structure
  const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ollamaKey}`
      },
      body: JSON.stringify({
          model: ollamaModel,
          messages: [
              { role: "system", content: systemPrompt },
              ...messages
          ],
          stream: true
      })
  });

  if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama API Error:", errorText);
      return NextResponse.json({ error: "Failed to connect to SouqFlowy AI" }, { status: 500 });
  }

  // Create a TransformStream to handle the Ollama stream format
  // Ollama sends multiple JSON objects, one per line
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              const content = json.message?.content || json.choices?.[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
              if (json.done) break;
            } catch (e) {
              console.error("Error parsing JSON line:", line, e);
            }
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream);

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
