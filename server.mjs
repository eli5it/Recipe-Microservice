const API_KEY = "63edd14d00ce4a778d22d40b4bb2f5de";
import axios from "axios";
import fs from "fs";
import zmq from "zeromq";
const top1000 = JSON.parse(fs.readFileSync("./data.json", "utf8"));

// const obj = {};

// const exampleJson = {
//   ingredient: "Schnozzberries",
//   nutritional_info: {
//     calories: 1,
//     fat: 0,
//     carbohydrates: 1,
//     protein: 1,
//   },
//   price: {
//     amount: 0.25,
//     currency: "USD",
//   },
//   image: "https://www.example.com/img.jpg",
//   substitutions: [
//     "Snoutfruit",
//     "Nose Candy",
//     "WhiffBlooms",
//     "BreezieBerries",
//     "SnoutNuts",
//   ],
//   dietary_restrictions: ["Vegan", "Gluten-Free", "Dangerous"],
// };

const getSpoonacularId = (ingredientName) => {
  // ingredient names in json are lowercased
  const lowerCasedName = ingredientName.toLowerCase();
  const spoonId = top1000[lowerCasedName];

  // found an exact match
  if (spoonId) return spoonId;

  for (const [ingredient, spoonId] of Object.entries(top1000)) {
    if (ingredient.startsWith(lowerCasedName)) {
      return spoonId;
    }
  }
};

const getIngredientSubstitutes = async (spoonId) => {
  const response = await axios.get(
    `https://api.spoonacular.com/food/ingredients/${spoonId}/substitutes?apiKey=${API_KEY}`
  );
  const data = response.data;
  if (data.status === "failure") {
    return [];
  }
  return data.substitutes;
};

const getIngredientInfo = async (ingredientId, ingredientName) => {
  // first get ingredient id for spoonacular id
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
};

const getIngredientsInfo = async (ingredientList) => {
  // need all spoonacularIds
  let spoonIds = ingredientList.map((ingredient) => ({
    id: getSpoonacularId(ingredient),
    ingredient,
  }));

  const ingredientsPromise = spoonIds.map(async ({ id, ingredient }) =>
    id
      ? getIngredientInfo(id, ingredient)
      : { name: ingredient, success: false }
  );

  const ingredientsData = await Promise.all(ingredientsPromise);

  return ingredientsData;
};

// console.log(
//   "looking for ingredient date for following ingredients",
//   "cheddar, chickpea, chili peppers"
// );
// const ingredients = ["cheddar", "chickpea", "chili peppers"];
// const data = await getIngredientsInfo(ingredients);

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
