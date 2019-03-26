import axios from 'axios';
import {key, proxy} from '../config';

export default class Search{

    constructor(query){
        this.query = query;
    }

    //get data(recipes)from API
    async getResults(){
        try{
        const res = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
        this.results = res.data.recipes;
        }catch (error){
        alert(error)
        }
    }
};