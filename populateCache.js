let i = 0;
for (const [ingredient, spoonId] of Object.entries(top1000)) {
  if (cache[ingredient]) continue;

  if (i >= 1) {
    break;
  }
  const ingredientData = await getIngredientInfo(spoonId);
  cache[ingredient] = ingredientData;
  fs.writeFileSync("./cache.json", JSON.stringify(cache));
  i++;
}
