import axios from "axios";
import fs from "fs";
import zmq from "zeromq";
import dotenv from "dotenv";
dotenv.config();
const API_KEY = process.env.API_KEY;
const top1000 = JSON.parse(fs.readFileSync("./data.json", "utf8"));
const cache = JSON.parse(fs.readFileSync("./cache.json", "utf8"));

const getSpoonacularId = async (ingredientName) => {
  // returns the spoonacularId of a given ingredient
  // requires ingredient to be in top 1000 most common json file
  const lowerCasedName = ingredientName.toLowerCase();
  const spoonId = top1000[lowerCasedName];

  // found an exact match
  if (spoonId) return spoonId;

  for (const [ingredient, spoonId] of Object.entries(top1000)) {
    if (ingredient.startsWith(lowerCasedName)) {
      return spoonId;
    }
  }

  const queryString = `https://api.spoonacular.com/food/ingredients/search?query=${ingredientName}&apiKey=${API_KEY}`;

  // use spoonacular API to search for the id of the ingredient
  const response = await axios.get(queryString);
  const data = response.data;
  if (data?.results.length > 0) {
    return data.results[0].id;
  }
};

const getIngredientSubstitutes = async (spoonId) => {
  // returns an array of substitutes of an ingredient with provided spoonId
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/food/ingredients/${spoonId}/substitutes?apiKey=${API_KEY}`
    );

    const data = response.data;

    if (data.status === "failure") {
      return [];
    }
    return data.substitutes;
  } catch (err) {
    return [];
  }
};

const getIngredientInfo = async (ingredientId, ingredientName) => {
  // first get ingredient id for spoonacular id
  try {
    // Attempting to debug:
    // console.log("ingredient ID: ", ingredientId);
    // console.log("ingredient name: ", ingredientName);
    const response = await axios.get(
      `https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=1&apiKey=${API_KEY}`
    );
    const data = response.data;

    const returnObj = {
      id: data.id,
      name: ingredientName,
      nutrition: data.nutrition,
      price: {
        amount: data.estimatedCost.value,
        unit: data.estimatedCost.unit,
      },
      image: `https://img.spoonacular.com/ingredients_100x100/${data.image}`,
      substitutions: await getIngredientSubstitutes(data.id),
      success: true,
    };

    return returnObj;
  } catch (err) {
    console.error("Error fetching ingredient info:", err);
    return { name: ingredientName, success: false };
  }
};

const getIngredientsInfo = async (ingredientList) => {
  // need all spoonacularIds
  // IDs were resolving as promises. Used Promise.all to handle multiple async calls
  // This ensures that all IDs are fetched before continuing with the ingredient fetching
  let spoonIds = await Promise.all(ingredientList.map(async (ingredient) => {
    const id = await getSpoonacularId(ingredient);
    return {
      id, 
      ingredient,
    };
  }));

  const ingredientsPromise = spoonIds.map(async ({ id, ingredient }) => {
    if (cache[ingredient]) {
      return cache[ingredient];
    }

    // Needed an await here as well
    let ingredientData = id
      ? await getIngredientInfo(id, ingredient)
      : { name: ingredient, success: false };

    cache[ingredient] = ingredientData;

    return ingredientData;
  });

  const ingredientsData = await Promise.all(ingredientsPromise);

  return ingredientsData;
};

async function runServer() {
  const sock = new zmq.Reply();

  await sock.bind("tcp://*:5555");

  for await (const [msg] of sock) {
    const ingredientsArr = JSON.parse(msg.toString());
    const ingredientData = await getIngredientsInfo(ingredientsArr);
    await sock.send(JSON.stringify(ingredientData));
  }
}

runServer();
