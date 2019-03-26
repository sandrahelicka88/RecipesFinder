import axios from 'axios';
import {key, proxy} from '../config';

export default class Recipe{
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try{
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.image = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        }catch(error){
            console.log(error);
            alert('Error')
        }
    }

    //calculate time we need to cook (assume that we need 15 min for each 3 ingredients)
    calcTime(){
        const numIngred = this.ingredients.lenght;
        const periods = Math.ceil(numIngred/3);
        this.time = periods * 15;
    }

    calcServings(){
        this.servings = 4;
    }

    parseIngredients(){
        const unitLongs = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitShort, 'kg', 'g'];
        const newIngredients = this.ingredients.map(el=>{
            //Uniform ingredients units
            let ingredient = el.toLowerCase();
            unitLongs.forEach((unit, i)=>{
                ingredient = ingredient.replace(unit, unitShort[i]);
            });
            //Remove parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            //Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
            let objIng;
            if (unitIndex>-1){
                //Unit exist
                const arrCount = arrIng.slice(0,unitIndex);
                let count;
                if (arrCount.lenght===1){
                    count = eval(arrIng[0].replace('-', '+'));
                }else{
                    count = eval(arrIng.slice(0, unitIndex).join('+'))
                }
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex+1).join(' ')
                }
            }else if(parseInt(arrIng[0],10)){
                //No unit but first elem is a number
                objIng = {
                    count : parseInt(arrIng[0],10),
                    unit : ' ',
                    ingredient : arrIng.slice(1).join(' ')
                }
            }
            else if(unitIndex===-1){
                //No unit and no number in 1st position
                objIng = {
                    count: 1,
                    unit: ' ',
                    ingredient
                }
            }
            return objIng;
        })
        this.ingredients = newIngredients;
    }
    
    updateServings(type){
        //Servings
        const newServings = type === 'dec' ? this.servings + 1 : this.servings - 1;
        //Ingredients
        this.ingredients.forEach(ing=>{
            ing.count *= (newServings/ this.servings);
        })
        this.servings = newServings;
    }
}