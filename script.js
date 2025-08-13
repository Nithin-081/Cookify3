document.addEventListener('DOMContentLoaded', function() {

    // DOM Elements

    const ingredientInput = document.getElementById('ingredientInput');

    const searchBtn = document.getElementById('searchBtn');

    const dietFilter = document.getElementById('dietFilter');

    const intoleranceFilter = document.getElementById('intoleranceFilter');

    const timeFilter = document.getElementById('timeFilter');

    const loading = document.getElementById('loading');

    const resultsContainer = document.getElementById('resultsContainer');

    const recipeModal = document.getElementById('recipeModal');

    const closeModal = document.getElementById('closeModal');

    const recipeDetails = document.getElementById('recipeDetails');

    const tabBtns = document.querySelectorAll('.tab-btn');

    const tabContents = document.querySelectorAll('.tab-content');

    const favoritesContainer = document.getElementById('favoritesContainer');

    const shoppingItem = document.getElementById('shoppingItem');

    const addItemBtn = document.getElementById('addItemBtn');

    const shoppingList = document.getElementById('shoppingList');

    const clearListBtn = document.getElementById('clearListBtn');

    const timerMinutes = document.getElementById('timerMinutes');

    const startTimer = document.getElementById('startTimer');

    const timerDisplay = document.getElementById('timerDisplay');

    const randomRecipeBtn = document.getElementById('randomRecipeBtn');

    const tipBtn = document.getElementById('tipBtn');

    const cookingTip = document.getElementById('cookingTip');

    const convertFrom = document.getElementById('convertFrom');

    const fromUnit = document.getElementById('fromUnit');

    const convertTo = document.getElementById('convertTo');

    const toUnit = document.getElementById('toUnit');

    

    // API Key - Replace with your actual Spoonacular API key

    const apiKey = '5f32b2e3aa8a40d09908a6d8a1d04d2b';

    

    // State

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    let shoppingItems = JSON.parse(localStorage.getItem('shoppingItems')) || [];

    let timerInterval = null;

    let currentRecipe = null;

    

    // Cooking Tips

    const cookingTips = [

        "Always preheat your oven before baking for even cooking.",

        "Let meat rest after cooking to redistribute the juices.",

        "Taste as you cook and adjust seasoning accordingly.",

        "Use fresh herbs at the end of cooking for maximum flavor.",

        "Don't overcrowd the pan when searing meat.",

        "Salt your pasta water before adding the pasta.",

        "Use a sharp knife for safer and more efficient cutting.",

        "Room temperature ingredients mix better in baking.",

        "Save pasta water to help thicken sauces.",

        "Toast spices before using to enhance their flavor."

    ];

    

    // Unit conversions

    const conversions = {

        'cup': { 'ml': 236.588, 'g': 128, 'kg': 0.128, 'l': 0.236588 },

        'tbsp': { 'ml': 14.7868, 'g': 15, 'kg': 0.015, 'l': 0.0147868 },

        'tsp': { 'ml': 4.92892, 'g': 5, 'kg': 0.005, 'l': 0.00492892 },

        'oz': { 'ml': 29.5735, 'g': 28.3495, 'kg': 0.0283495, 'l': 0.0295735 }

    };

    

    // Initialize

    renderShoppingList();

    renderFavorites();

    

    // Event Listeners

    searchBtn.addEventListener('click', searchRecipes);

    ingredientInput.addEventListener('keypress', function(e) {

        if (e.key === 'Enter') {

            searchRecipes();

        }

    });

    

    closeModal.addEventListener('click', function() {

        recipeModal.style.display = 'none';

    });

    

    window.addEventListener('click', function(e) {

        if (e.target === recipeModal) {

            recipeModal.style.display = 'none';

        }

    });

    

    // Tab switching

    tabBtns.forEach(btn => {

        btn.addEventListener('click', function() {

            const tabId = this.getAttribute('data-tab');

            

            tabBtns.forEach(b => b.classList.remove('active'));

            tabContents.forEach(c => c.classList.remove('active'));

            

            this.classList.add('active');

            document.getElementById(tabId).classList.add('active');

        });

    });

    

    // Shopping list

    addItemBtn.addEventListener('click', addShoppingItem);

    shoppingItem.addEventListener('keypress', function(e) {

        if (e.key === 'Enter') {

            addShoppingItem();

        }

    });

    

    clearListBtn.addEventListener('click', function() {

        shoppingItems = [];

        localStorage.setItem('shoppingItems', JSON.stringify(shoppingItems));

        renderShoppingList();

    });

    

    // Timer

    startTimer.addEventListener('click', function() {

        const minutes = parseInt(timerMinutes.value);

        if (minutes > 0) {

            startCookingTimer(minutes);

        }

    });

    

    // Random recipe

    randomRecipeBtn.addEventListener('click', function() {

        fetchRandomRecipe();

    });

    

    // Cooking tip

    tipBtn.addEventListener('click', function() {

        const randomTip = cookingTips[Math.floor(Math.random() * cookingTips.length)];

        cookingTip.textContent = randomTip;

    });

    

    // Unit converter

    convertFrom.addEventListener('input', function() {

        convertUnits();

    });

    

    fromUnit.addEventListener('change', function() {

        convertUnits();

    });

    

    toUnit.addEventListener('change', function() {

        convertUnits();

    });

    

    // Functions

    function searchRecipes() {

        const ingredients = ingredientInput.value.trim();

        

        if (!ingredients) {

            alert('Please enter at least one ingredient');

            return;

        }

        

        loading.style.display = 'block';

        resultsContainer.innerHTML = '';

        

        let apiUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=10&apiKey=${apiKey}`;

        

        if (dietFilter.value) {

            apiUrl += `&diet=${encodeURIComponent(dietFilter.value)}`;

        }

        

        if (intoleranceFilter.value) {

            apiUrl += `&intolerances=${encodeURIComponent(intoleranceFilter.value)}`;

        }

        

        if (timeFilter.value) {

            apiUrl += `&${timeFilter.value}`;

        }

        

        fetch(apiUrl)

            .then(response => {

                if (!response.ok) {

                    throw new Error('Network response was not ok');

                }

                return response.json();

            })

            .then(data => {

                displayRecipes(data);

                loading.style.display = 'none';

            })

            .catch(error => {

                console.error('Error fetching recipes:', error);

                loading.style.display = 'none';

                resultsContainer.innerHTML = `

                    <div class="placeholder">

                        <i class="fas fa-exclamation-circle"></i>

                        <h3>Error fetching recipes</h3>

                        <p>Please check your API key and try again</p>

                    </div>

                `;

            });

    }

    

    function displayRecipes(recipes) {

        if (recipes.length === 0) {

            resultsContainer.innerHTML = `

                <div class="placeholder">

                    <i class="fas fa-search"></i>

                    <h3>No recipes found</h3>

                    <p>Try different ingredients or filters</p>

                </div>

            `;

            return;

        }

        

        resultsContainer.innerHTML = '';

        

        recipes.forEach(recipe => {

            const recipeCard = document.createElement('div');

            recipeCard.className = 'recipe-card';

            

            const isFavorite = favorites.some(fav => fav.id === recipe.id);

            

            recipeCard.innerHTML = `

                <img src="${recipe.image}" alt="${recipe.title}">

                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${recipe.id}">

                    <i class="fas fa-heart"></i>

                </button>

                <div class="recipe-card-content">

                    <h3>${recipe.title}</h3>

                    <p>Used ingredients: ${recipe.usedIngredientCount}</p>

                    <p>Missing ingredients: ${recipe.missedIngredientCount}</p>

                    <div class="recipe-card-meta">

                        <span><i class="fas fa-clock"></i> Ready in ${recipe.readyInMinutes || 30} mins</span>

                        <span><i class="fas fa-users"></i> ${recipe.servings || 4} servings</span>

                    </div>

                </div>

            `;

            

            recipeCard.addEventListener('click', function(e) {

                if (!e.target.closest('.favorite-btn')) {

                    showRecipeDetails(recipe.id);

                }

            });

            

            const favoriteBtn = recipeCard.querySelector('.favorite-btn');

            favoriteBtn.addEventListener('click', function(e) {

                e.stopPropagation();

                toggleFavorite(recipe);

            });

            

            resultsContainer.appendChild(recipeCard);

        });

    }

    

    function showRecipeDetails(recipeId) {

        loading.style.display = 'block';

        

        fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`)

            .then(response => response.json())

            .then(data => {

                currentRecipe = data;

                displayRecipeDetails(data);

                loading.style.display = 'none';

                recipeModal.style.display = 'block';

            })

            .catch(error => {

                console.error('Error fetching recipe details:', error);

                loading.style.display = 'none';

                alert('Error fetching recipe details. Please try again.');

            });

    }

    

    function displayRecipeDetails(recipe) {

        recipeDetails.innerHTML = `

            <div class="recipe-header">

                <h2>${recipe.title}</h2>

                <img src="${recipe.image}" alt="${recipe.title}">

            </div>

            <div class="recipe-info">

                <div class="info-item">

                    <i class="fas fa-clock"></i>

                    <span>Ready in ${recipe.readyInMinutes} minutes</span>

                </div>

                <div class="info-item">

                    <i class="fas fa-users"></i>

                    <span>${recipe.servings} servings</span>

                </div>

                <div class="info-item">

                    <i class="fas fa-heart"></i>

                    <span>${recipe.aggregateLikes} likes</span>

                </div>

                <div class="info-item">

                    <i class="fas fa-leaf"></i>

                    <span>${recipe.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}</span>

                </div>

            </div>

            <div class="recipe-ingredients">

                <h3>Ingredients</h3>

                <ul>

                    ${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}

                </ul>

                <button id="addToListBtn"><i class="fas fa-plus"></i> Add to Shopping List</button>

            </div>

            <div class="recipe-instructions">

                <h3>Instructions</h3>

                ${recipe.instructions ? recipe.instructions : '<p>No instructions available</p>'}

            </div>

            <div class="recipe-summary">

                <h3>About this recipe</h3>

                <p>${recipe.summary.replace(/<[^>]*>/g, '')}</p>

            </div>

        `;

        

        document.getElementById('addToListBtn').addEventListener('click', function() {

            recipe.extendedIngredients.forEach(ing => {

                shoppingItems.push(ing.original);

            });

            localStorage.setItem('shoppingItems', JSON.stringify(shoppingItems));

            renderShoppingList();

            alert('Ingredients added to shopping list!');

        });

    }

    

    function toggleFavorite(recipe) {

        const index = favorites.findIndex(fav => fav.id === recipe.id);

        

        if (index === -1) {

            favorites.push(recipe);

        } else {

            favorites.splice(index, 1);

        }

        

        localStorage.setItem('favorites', JSON.stringify(favorites));

        renderFavorites();

        

        // Update the heart icon if the recipe is currently displayed

        const favoriteBtn = document.querySelector(`.favorite-btn[data-id="${recipe.id}"]`);

        if (favoriteBtn) {

            favoriteBtn.classList.toggle('active');

        }

    }

    

    function renderFavorites() {

        if (favorites.length === 0) {

            favoritesContainer.innerHTML = `

                <div class="placeholder">

                    <i class="fas fa-heart-broken"></i>

                    <h3>No favorites yet</h3>

                    <p>Save your favorite recipes by clicking the heart icon</p>

                </div>

            `;

            return;

        }

        

        favoritesContainer.innerHTML = '';

        

        favorites.forEach(recipe => {

            const recipeCard = document.createElement('div');

            recipeCard.className = 'recipe-card';

            

            recipeCard.innerHTML = `

                <img src="${recipe.image}" alt="${recipe.title}">

                <button class="favorite-btn active" data-id="${recipe.id}">

                    <i class="fas fa-heart"></i>

                </button>

                <div class="recipe-card-content">

                    <h3>${recipe.title}</h3>

                    <p>Used ingredients: ${recipe.usedIngredientCount}</p>

                    <p>Missing ingredients: ${recipe.missedIngredientCount}</p>

                    <div class="recipe-card-meta">

                        <span><i class="fas fa-clock"></i> Ready in ${recipe.readyInMinutes || 30} mins</span>

                        <span><i class="fas fa-users"></i> ${recipe.servings || 4} servings</span>

                    </div>

                </div>

            `;

            

            recipeCard.addEventListener('click', function(e) {

                if (!e.target.closest('.favorite-btn')) {

                    showRecipeDetails(recipe.id);

                }

            });

            

            const favoriteBtn = recipeCard.querySelector('.favorite-btn');

            favoriteBtn.addEventListener('click', function(e) {

                e.stopPropagation();

                toggleFavorite(recipe);

            });

            

            favoritesContainer.appendChild(recipeCard);

        });

    }

    

    function addShoppingItem() {

        const item = shoppingItem.value.trim();

        if (item) {

            shoppingItems.push(item);

            localStorage.setItem('shoppingItems', JSON.stringify(shoppingItems));

            shoppingItem.value = '';

            renderShoppingList();

        }

    }

    

    function renderShoppingList() {

        shoppingList.innerHTML = '';

        

        if (shoppingItems.length === 0) {

            shoppingList.innerHTML = '<li class="placeholder">Your shopping list is empty</li>';

            return;

        }

        

        shoppingItems.forEach((item, index) => {

            const li = document.createElement('li');

            li.innerHTML = `

                <span>${item}</span>

                <button data-index="${index}"><i class="fas fa-times"></i></button>

            `;

            

            li.querySelector('button').addEventListener('click', function() {

                shoppingItems.splice(index, 1);

                localStorage.setItem('shoppingItems', JSON.stringify(shoppingItems));

                renderShoppingList();

            });

            

            shoppingList.appendChild(li);

        });

    }

    

    function startCookingTimer(minutes) {

        clearInterval(timerInterval);

        

        let seconds = minutes * 60;

        timerDisplay.textContent = formatTime(seconds);

        

        timerInterval = setInterval(function() {

            seconds--;

            timerDisplay.textContent = formatTime(seconds);

            

            if (seconds <= 0) {

                clearInterval(timerInterval);

                timerDisplay.textContent = "Time's up!";

                alert('Timer finished!');

            }

        }, 1000);

    }

    

    function formatTime(seconds) {

        const mins = Math.floor(seconds / 60);

        const secs = seconds % 60;

        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    }

    

    function fetchRandomRecipe() {

        loading.style.display = 'block';

        

        fetch(`https://api.spoonacular.com/recipes/random?number=1&apiKey=${apiKey}`)

            .then(response => response.json())

            .then(data => {

                const recipe = data.recipes[0];

                showRecipeDetails(recipe.id);

                loading.style.display = 'none';

            })

            .catch(error => {

                console.error('Error fetching random recipe:', error);

                loading.style.display = 'none';

                alert('Error fetching random recipe. Please try again.');

            });

    }

    

    function convertUnits() {

        const value = parseFloat(convertFrom.value);

        const from = fromUnit.value;

        const to = toUnit.value;

        

        if (!isNaN(value) && conversions[from] && conversions[from][to]) {

            convertTo.value = (value * conversions[from][to]).toFixed(2);

        } else {

            convertTo.value = '';

        }

    }

});