const mongoose = require('mongoose');

let recipeSchema = new mongoose.Schema({
    title: String,
    shortDesc: String,
    longDesc: String,
    imgSrc: String,
    prepTime: String,
    totalTime: String,
    recipeYield: String,
    ingredients: [{name: String, unit: String, qty: String}],
    equipment: [String],
    appliances: [String],
    procedure: [String],
    tags: [String],
    videoId: String,
    firstPublishDate: Date
});

let Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;