// routes.mjs
import { Router } from 'express';
import fetch from 'node-fetch';
import { Recipe } from './db.mjs';

const router = Router();

router.post('/get-recipe', async (req, res) => {
    const { name, calories, time } = req.body;

    try {
        // Check if the recipe exists in the database
        let recipe = await Recipe.findOne({ name, calories, time, explination });

        if (!recipe) {
            // If not, use the AI to create a new recipe
            const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": `${process.env.YOUR_SITE_URL}`,
                    "X-Title": `${process.env.YOUR_SITE_NAME}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [
                        { "role": "user", "content": `Create a recipe named ${name} with ${calories} calories that takes ${time} minutes to cook and is like: ${explination}. make a long and good step by step guilde. repte  the shopping at the end and but the list between % so my progam can extrait it. like % 1 item, \n 2 item,\n 1 item % no every item needs there onw % all item in one` }
                    ]
                })
            });

            const aiData = await aiResponse.json();
            const aiContent = aiData.choices[0].message.content;

            console.log("AI Response:", aiContent); // Debugging line

            // Extract shopping list from the recipe
            const shoppingListMatch = aiContent.match(/%(.+?)%/s);
            if (!shoppingListMatch) {
                throw new Error("Shopping list markers not found in AI response");
            }
            
            const shoppingList = shoppingListMatch[1].trim();
            const recipeContent = aiContent.replace(/%(.+?)%/s, '').trim();

            // Save the recipe to the database
            recipe = new Recipe({ name, calories, time, recipe: recipeContent, shoppingList });
            await recipe.save();
        }

        res.json(recipe);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;
