// db.mjs
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const recipeSchema = new mongoose.Schema({
    name: String,
    calories: Number,
    time: Number,
    recipe: String,
    shoppingList: String,
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export { Recipe };
