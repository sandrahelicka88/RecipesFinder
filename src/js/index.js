import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';

//Global state of the app
//Search Object
//Current Recipe Object
//Shopping List Object
//Liked Recipes
const state = {};

/*
//SEARCH CONTROLLER
*/
const controlSearch = async() => {
    //get query from view
    const query = searchView.getInput();
    if(query){
        //add new search object to state
        state.search = new Search(query);
        //prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
    try{
        //search for recipes
        await state.search.getResults();
        //render recipes on UI
        clearLoader();
        searchView.renderResults(state.search.results);
    }catch(error){
      alert('Something went wrong with the search..')
      clearLoader();
    }
  }
}

//add event listener to search form
elements.searchForm.addEventListener('submit', e=>{
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', (e)=>{
    const button = e.target.closest('.btn-inline');
    if(button){
        const goToPage = parseInt(button.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.results, goToPage);
    }
});

/*
//RECIPE CONTROLLER
*/
const controlRecipe= async() =>{
    //Get ID from url
    const id = window.location.hash.replace('#', '');
    if(id){
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        //Highlight selected search item
    if(state.search){
        searchView.highlightSelected(id);
    } 
    //create new recipe object
    state.recipe = new Recipe(id);
    try{
        //get recipe data and parse ingredients
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();
        //Calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();
        //Render recipe
        clearLoader();
        recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
        );
    }catch(error){
        alert('Error processing recipe');
    }
  }
}
['hashchange', 'load'].forEach((event)=> window.addEventListener(event,controlRecipe));

/*
//List Controller
*/
const controlList = () =>{
    //create new list if there is none yet
    if(!state.list){
        state.list = new List();
    };
    //add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el=>{
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}

//Handle delete and update list items
elements.shopping.addEventListener('click', (e)=>{
    const id = e.target.closest('.shopping__item').dataset.itemid;
    console.log(id)
    //Handle the delet button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //Delete from state
        state.list.deleteItem(id)
        //Delete from UI
        listView.deleteItem(id)
        //Handle the update button
    }else if(e.target.matches('.shopping__count_value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
})

/*
//LIKES CONTROLLER
*/
const controlLike = ()=>{
    if(!state.likes){
        state.likes = new Likes();
    }
    const currentID = state.recipe.id;
    //User has not liked current recipe yet
    if(!state.likes.isLiked(currentID)){
        //add like to the state
        const newLike = state.likes.addLike(
        currentID,
        state.recipe.title,
        state.recipe.author,
        state.recipe.image
    );
    //User has liked current recipe
    //Add like to the state
    //Toggle the like button
    likesView.toggleLikeBtn(true);
    likesView.renderLike(newLike);
    }else{
        //Remove like from the state
        state.likes.deleteLike(currentID);
        //toggle like button
        likesView.toggleLikeBtn(false);
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes())
}

//Restore likes recipes on page load
window.addEventListener('load', ()=>{
    state.likes = new Likes();
    //Restore likes
    state.likes.readStorage();
    //Toggle likes menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes())
    //Render existing likes
    state.likes.likes.forEach((like)=>{
        likesView.renderLike(like);
  })
})

//Recipe button clicks
elements.recipe.addEventListener('click', e=>{
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        //Decrease button is clicked
        if(state.recipe.servings > 1){
        state.recipe.updateServings('dec');
        recipeView.updateServingsIng(state.recipe);
        }
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIng(state.recipe);
    }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        //like controller
        controlLike();
    }
});















