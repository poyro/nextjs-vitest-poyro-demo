import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "./route";

vi.mock("ai", async (importOriginal) => {
  const mod = await importOriginal<typeof import("ai")>();

  return {
    ...mod,
    // If the OPENAI_API_KEY is not set, mock the streamText function
    ...(!process.env.OPENAI_API_KEY
      ? {
          streamText: vi.fn().mockResolvedValue({
            toAIStreamResponse: () => ({
              text: () =>
                "Great choice! Let's make a simple and delicious Tomato Basil Pasta using the ingredients you have.\n\nIngredients:\n- 1 box of pasta (such as spaghetti or penne)\n- 4-5 ripe tomatoes, diced\n- 3-4 tablespoons of olive oil\n- 2-3 cloves of garlic, minced\n- Salt and pepper to taste\n- Red pepper flakes (optional)\n- Fresh basil leaves, chopped\n- Grated Parmesan cheese (optional)\n\nInstructions:\n1. Cook the pasta according to the package instructions in a pot of salted boiling water until al dente. Reserve about 1 cup of pasta water before draining.\n\n2. In a large skillet, heat the olive oil over medium heat. Add the minced garlic and sauté for about a minute until fragrant.\n\n3. Add the diced tomatoes to the skillet and cook for 5-7 minutes until they start to break down and release their juices. Season with salt, pepper, and red pepper flakes if using.\n\n4. Add the cooked pasta to the skillet along with a splash of the reserved pasta water. Toss everything together to combine and let the pasta soak up the flavors of the sauce.\n\n5. Remove the skillet from heat and stir in the chopped fresh basil leaves.\n\n6. Serve the Tomato Basil Pasta hot, garnished with additional basil leaves and grated Parmesan cheese if desired.\n\nEnjoy your delicious and simple Tomato Basil Pasta! Let me know if you have any other questions or need further assistance.",
              status: 200,
            }),
          }),
        }
      : {}),
  };
});

const baseUrl = "http://localhost:3000";

const destreamify = (str: string) => {
  return str.replaceAll('0:"', "").replaceAll('"\n', "");
};

describe("POST /api/chat", () => {
  it("should return a valid recipe", async () => {
    // User input
    const content =
      "Give me a pasta recipe using tomatoes, box of pasta, olive oil, and some spices";

    // Create a new request
    const request = new NextRequest(`${baseUrl}/api/chat`, {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content }] }) as any,
    });

    // Send the request
    const res = await POST(request);

    // Check the status code
    expect(res.status).toEqual(200);

    // Get the response text and destreamify it
    const respText = destreamify(await res.text());

    // Check if the response text fulfills the criterion
    await expect(respText).toFulfillCriterion("Provides a recipe");
    await expect(respText).toFulfillCriterion(
      "The provided recipe uses tomatoes"
    );
  });
}, 30000);
