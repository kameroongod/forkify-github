import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import bookmarksView from "./views/bookmarksView.js";
import paginationView from "./views/paginationView.js";
import addRecipeView from "./views/addRecipeView.js";
import { MODAL_CLOSE_SEC } from "./config.js";
// polifilling JS main features
import "core-js/stable";
// polifilling async/await
import "regenerator-runtime/runtime";

// Preserve state on refresh
// From parcel
// if (module.hot) {
//   module.hot.accept();
// }

//////////////////////////////////////////////////////////////
// Main controller
const controlRecipes = async function () {
  try {
    // Get id of recipe from url
    const id = window.location.hash.slice(1);
    if (!id) return;
    // Render spinner inside recipe container while loading API data
    recipeView.renderSpinner();

    // 0 ) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    // 1) Loading recipe
    await model.loadRecipe(id);
    //2) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

// Function to load recipes from search bar
const controlSearchResults = async function () {
  try {
    // Spinner while waiting for results from search bar
    resultsView.renderSpinner();
    // 1) Get text from search bar
    const query = searchView.getQuery();
    if (!query) return;
    // 2) Load search results
    await model.loadSearchResults(query);
    // 3) Render initial results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());
    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

// Handle the change of page
const controlPagination = function (goToPage) {
  // 1) Render new results
  // resultsView.render(model.state.search.results);
  resultsView.render(model.getSearchResultsPage(goToPage));
  // 2) Render new pagination buttons
  paginationView.render(model.state.search);
};

// Controller to change amount of servings on recipe
const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  recipeView.update(model.state.recipe);
};

// Controller to add new bookmark
const controlAddBookmark = function () {
  // If field bookmarked not true
  // Add recipe inside booksmarks array
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    // if already
    model.deleteBookmark(model.state.recipe.id);
  }
  // Update recipe view
  recipeView.update(model.state.recipe);

  // render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

// Initial loading of bookmarks
// so the update function in controlREcipes doesn't crash
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

// Function to handle to add recipe from form
const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload new recipe
    await model.uploadRecipe(newRecipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    // nender bookmarkers because adding new element
    bookmarksView.render(model.state.bookmarks);

    // change url ID
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // close form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(`💥${err.message}`);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log("Welcome to the application");
};

// Initial starting point
// Adding event listeners from views
const init = function () {
  bookmarksView.addHendlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};

init();
//////////////////////////////////////////////////////////////
// npm i core-js regenerator-runtime to polifill ES6 features to make sure website works on most browsers

// Ideas
// Display # of pages between pagination buttons
// Sort search results by duration or number of ingredients
// Perform ingredient validator in view, before submitting the form
// Improve recipe ingredient inputs (e.g. separate in multiple fields and allow more than 6 ingredients)
// shopping list feature: button on recipe to add ingredients to a list
// weekly meal planning feature: assign recipes to the next 7 days and show on a weekly calendar
// get nutrition data on each ingredient from spoonacular API (https://spoonacular.com/food-api) + calculate total calories of recipe/servings
