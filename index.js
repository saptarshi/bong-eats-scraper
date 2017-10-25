const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const Recipe = require('./models/recipe');

const urlSet = [
    "https://bongeats.com/recipe/khichuri/",
    "https://bongeats.com/recipe/ilish-paturi/",
    "https://bongeats.com/recipe/ilish-macher-tel-jhol/",
    "https://bongeats.com/recipe/pabda-machher-tel-jhol/",
    "https://bongeats.com/recipe/prawn-cocktail/",
    "https://bongeats.com/recipe/shami-kabab/",
    "https://bongeats.com/recipe/ghugni/",
    "https://bongeats.com/recipe/bengali-vegetable-fried-rice/",
    "https://bongeats.com/recipe/kolkata-egg-roll/",
    "https://bongeats.com/recipe/nimki/",
    "https://bongeats.com/recipe/ema-datshi/",
    "https://bongeats.com/recipe/churmur/",
    "https://bongeats.com/recipe/tingmo/",
    "https://bongeats.com/recipe/khichra-bohra-haleem/",
    "https://bongeats.com/recipe/kumrar-jhal/",
    "https://bongeats.com/recipe/panta-bhat/",
    "https://bongeats.com/recipe/aloo-paratha/",
    "https://bongeats.com/recipe/lobongo-lotika/",
    "https://bongeats.com/recipe/tetor-dal-lau-diye/",
    "https://bongeats.com/recipe/lau-ghonto-with-moong-dal-bori/",
    "https://bongeats.com/recipe/rohu-katla-fish-fry/",
    "https://bongeats.com/recipe/keemar-doi-bora/",
    "https://bongeats.com/recipe/tok-dal-aam-diye/",
    "https://bongeats.com/recipe/korola-bhaja-in-batter/",
    "https://bongeats.com/recipe/lauer-khosha-bhaja/",
    "https://bongeats.com/recipe/chicken-curry/",
    "https://bongeats.com/recipe/shahi-garam-masala/",
    "https://bongeats.com/recipe/begun-bhaja/",
    "https://bongeats.com/recipe/jhuri-alu-bhaja/",
    "https://bongeats.com/recipe/coffee-house-egg-sandwich/",
    "https://bongeats.com/recipe/panch-phoron/",
    "https://bongeats.com/recipe/phulkopir-bora/",
    "https://bongeats.com/recipe/bhaja-moong-dal-shobji-diye/",
    "https://bongeats.com/recipe/panchmishali-torkari/",
    "https://bongeats.com/recipe/patishapta-with-kheer-filling/",
    "https://bongeats.com/recipe/koi-machher-jhol-phulkopi-diye/",
    "https://bongeats.com/recipe/doodh-cha/",
    "https://bongeats.com/recipe/chingri-bhaape/",
    "https://bongeats.com/recipe/mughlai-porota//",
    "https://bongeats.com/recipe/jhinge-alu-posto/",
    "https://bongeats.com/how-to/cook-the-perfect-rice/",
    "https://bongeats.com/recipe/bengali-garam-masala/",
    "https://bongeats.com/recipe/alu-sheddho/",
    "https://bongeats.com/recipe/luchi/",
    "https://bongeats.com/recipe/dimer-dalna/",
    "https://bongeats.com/recipe/narkoler-bora/",
    "https://bongeats.com/recipe/plain-mosur-dal/",
    "https://bongeats.com/recipe/phulkopir-dalna/",
    "https://bongeats.com/recipe/tomato-curry-pata-diye-mosur-dal/",
    "https://bongeats.com/recipe/sooji/",
    "https://bongeats.com/how-to/clean-and-devein-prawns/"
];

async function run() {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    let recipes = [];
    
    for(let i=0; i < urlSet.length; i++) {
        let pageUrl = urlSet[i];
        console.log(pageUrl);
        await page.goto(pageUrl);
        
        let recipe = await page.evaluate(($el) => {
            //get long description
            let description = [];
            let descPara = document.getElementById('more').nextElementSibling,
                i = 1;

            while (descPara.nodeName === 'P') {
                if(descPara.outerText.trim() !== '') {
                    description.push(descPara.outerText);
                }
                descPara = descPara.nextElementSibling;
                i++;
            }

            // get ingredients
            let ingredients = [];
            let ingredientTable = document.getElementById('Ingredients').nextElementSibling.getElementsByTagName('tbody')[0];
            if(ingredientTable && ingredientTable.rows) {
                for (let i = 0; i < ingredientTable.rows.length; i++) {
                    let row =  ingredientTable.rows[i];
                    if(row.cells[1].innerText !== '') {
                        let ingredient = {
                            qty: row.cells[0].innerText.split(' ')[0],
                            unit: row.cells[0].innerText.split(' ')[1],
                            name: row.cells[1].innerText.split(' (')[0]
                        }
                        ingredients.push(ingredient);
                    }
                }
            }

            // get equipments
            let equipment = [];
            let equipmentList = (document.getElementById('Equipment')) ? (document.getElementById('Equipment').nextElementSibling.children) : 0;
            for (let i = 0; i < equipmentList.length; i++) {
                equipment.push(equipmentList[i].innerHTML);
            }

            // get appliances
            let appliances = [];
            let appliancesList = (document.getElementById('Appliances')) ? (document.getElementById('Appliances').nextElementSibling.children) : 0;
            for (let i = 0; i < appliancesList.length; i++) {
                appliances.push(appliancesList[i].innerHTML);
            }

            // get procedure
            let process = [];
            if(document.getElementsByTagName('ol').length) {
                let processList = document.getElementsByTagName('ol')[0].children;
                for (let i = 0; i < processList.length; i++) {
                    process.push(processList[i].innerHTML);
                }
            } else {
                process.push(document.getElementById('Method').nextElementSibling.innerHTML);
            }

            // get tags
            let tags = [];
            let tagList = document.getElementsByClassName('tag');

            for (let i = 0; i < tagList.length; i++) {
                tags.push(tagList[i].innerText);
            }

            // get microdata 
            let microData = JSON.parse(document.scripts[4].innerHTML);


            return {
                title: document.getElementsByClassName('post-title')[0].outerText,
                shortDesc: document.getElementsByClassName('post-byline')[0].innerHTML,
                longDesc: description,
                imgSrc: microData.image,
                prepTime: microData.prepTime,
                totalTime: microData.totalTime,
                recipeYield: microData.recipeYield,
                ingredients: ingredients,
                equipment: equipment,
                appliances: appliances,
                procedure: process,
                tags: tags,
                videoId: document.getElementsByTagName('amp-youtube')[0].dataset.videoid,
                firstPublishDate: document.getElementsByTagName('time')[0].getAttribute('datetime')
            };
        });
        upsertRecipe(recipe);
        console.log(recipe);
    }
    browser.close();
}

function upsertRecipe(recipeObj) {
    const DB_URL = 'mongodb://localhost:27017/bong-eats';
  
    if (mongoose.connection.readyState == 0) {
      mongoose.connect(DB_URL);
    }
  
    // if this recipe exists, update the entry, don't insert
    const conditions = { title: recipeObj.title };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  
    Recipe.findOneAndUpdate(conditions, recipeObj, options, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }

run();