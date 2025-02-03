// Polifilling async/await
import { async } from "regenerator-runtime/runtime";
import { API_URL, RES_PER_PAGE, API_KEY } from "./config.js";
import { AJAX } from "./helpers.js";

// Global state
export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    // conditionally adding property to object
    ...(recipe.key && { key: recipe.key }),
  };
};

// HTTP Library to query recipe
// Function to retrieve single recipe
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);
    if (state.bookmarks.some((bookmark) => bookmark.id === id))
      state.recipe.bookmarked = true;
  } catch (err) {
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    console.log(data);
    state.search.results = data.data.recipes.map((recipe) => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
      };
    });
    // reset initial page to 1
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

// Function to retrieve only x results per page
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; // 0;
  const end = page * state.search.resultsPerPage; // 9;
  return state.search.results.slice(start, end);
};

// Function to update the servings of a recipe
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach((ing) => {
    ing.quantity = ing.quantity * (newServings / state.recipe.servings);
    // newQt = oldQt * newServings / oldServings
  });
  state.recipe.servings = newServings;
};

// Function to bookmark
export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);
  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex((bookmark) => bookmark.id === id);
  state.bookmarks.splice(index, 1);
  // Mark current recipe as not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const persistBookmarks = function () {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};

const init = function () {
  const storage = localStorage.getItem("bookmarks");
  if (!storage) return;
  state.bookmarks = JSON.parse(storage);
};

init();

const clearBookmarks = function () {
  localStorage.clear("bookmarks");
};

// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(
        (entry) => entry.at(0).startsWith("ingredient") && entry.at(1) !== ""
      )
      .map((ing) => {
        const ingArr = ing
          .at(1)
          .split(",")
          .map((str) => str.trim());
        if (ingArr.length !== 3)
          throw new Error(
            "Wrong ingredient format! Please use the correct format :0"
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
