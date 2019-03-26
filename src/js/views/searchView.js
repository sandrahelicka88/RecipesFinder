import {elements} from './base';
import { format } from 'url';

export const getInput = () => elements.searchInput.value;
export const clearInput = () => {
    elements.searchInput.value='';
}
export const clearResults = () =>{
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
}

//highlight for selected recipe
export const highlightSelected = id =>{
    const resultrsArray = Array.from(document.querySelectorAll('.results__link'));
    resultrsArray.forEach(el=>{
        el.classList.remove('results__link--active')
    });
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
}

//create function to limit recipe's title
export const limitRecipeTitle = (title, limit = 17)=>{
    const newTitle = [];
    if (title.length>limit){
        title.split(' ').reduce((acc,cur)=>{
        if(acc+cur.length<=limit){
            newTitle.push(cur);
        }
        return acc+cur.length;
        },0);
        return `${newTitle.join(' ')}...`
    }
    return title;
}

//display recipes on UI
const renderRecipe = (recipe) => {
    const markup = ` 
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="Test">
            </figure>
            <div class="results__data">
                <h4 class="results_name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results_author">${recipe.publisher}</p>
            </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
}

//previous and next results button
const createButton = (page, type)=>`
    <button class="btn-inline results__btn--${type}" data-goto=${type==='prev'? page-1 : page+1}>
    <svg class="search__icon">
        <use href="img/icons.svg#icon-triangle-${type==='prev'? 'left' : 'right'}"></use>
    </svg>
    <span>Page ${type === 'prev'? page-1 : page+1}</span>
    </button>
`;
let button;
const renderButtons = (page, numResults, resPerPage) =>{
    const pages = Math.ceil(numResults/resPerPage);
    if (page===1&& pages>1){
        button = createButton(page, 'next');
    }else if(page<pages){
        button = `
        ${createButton(page, 'next')}
        ${createButton(page, 'prev')}    
        `
    }else if (page===pages && pages>1){
        button = createButton(page, 'prev');
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

//recipes pagination
export const renderResults = (recipes, page=1, resPerPage=10) => {
    //render results of current page
    const start = (page-1)* resPerPage;
    const end = page * resPerPage;
    recipes.slice(start, end).forEach(renderRecipe);

    //render pagination button
    renderButtons(page,recipes.length, resPerPage)
}