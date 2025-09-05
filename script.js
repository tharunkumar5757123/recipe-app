// script.js

// DOM elements
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const recipeContainer = document.getElementById("recipeContainer");
const filterTags = document.getElementById("filterTags");
const loader = document.getElementById("loader");
const customAlert = document.getElementById("customAlert");
const toggleDarkMode = document.getElementById("toggleDarkMode");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");

// Globals
let currentRecipes = [];
let currentPage = 1;
const recipesPerPage = 8;
let currentFilter = "";
let allTags = ["Beef", "Chicken", "Dessert", "Vegetarian", "Breakfast", "Vegan", "Seafood", "Pasta", "Side"];

// Loader and Alert
function showLoader() {
  loader.classList.remove("d-none");
}
function hideLoader() {
  loader.classList.add("d-none");
}
function showAlert(message, type = "success") {
  customAlert.className = `custom-alert alert alert-${type}`;
  customAlert.innerText = message;
  customAlert.classList.remove("d-none");
  setTimeout(() => customAlert.classList.add("d-none"), 3000);
}

// Dark Mode
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}
toggleDarkMode?.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

// Pagination
function paginate(array, page, perPage) {
  const start = (page - 1) * perPage;
  return array.slice(start, start + perPage);
}
prevPageBtn?.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderRecipes();
  }
});
nextPageBtn?.addEventListener("click", () => {
  if (currentPage * recipesPerPage < currentRecipes.length) {
    currentPage++;
    renderRecipes();
  }
});

// Fetch Recipes (50+)
async function fetchRecipes() {
  showLoader();
  let all = [];
  const letters = "abcdefghijklmnopqrstuvwxyz";
  for (let char of letters) {
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${char}`);
      const data = await res.json();
      if (data.meals) all = all.concat(data.meals);
    } catch {}
  }
  currentRecipes = all;
  renderRecipes();
  hideLoader();
}

// Render Recipes
function renderRecipes() {
  recipeContainer.innerHTML = "";
  const recipesToShow = paginate(currentRecipes.filter(r => !currentFilter || r.strCategory === currentFilter), currentPage, recipesPerPage);

  recipesToShow.forEach((meal) => {
    const isFav = getFavorites().includes(meal.idMeal);
    const price = (Math.random() * 20 + 5).toFixed(2);
    const discount = Math.floor(Math.random() * 30) + 10;

    recipeContainer.innerHTML += `
      <div class="col-md-3">
        <div class="card h-100">
          <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
          <div class="card-body">
            <h5 class="card-title">${meal.strMeal}</h5>
            <p class="card-text mb-1">Category: ${meal.strCategory}</p>
            <p class="text-success fw-bold">₹${(price - (price * discount / 100)).toFixed(2)} <small class="text-muted text-decoration-line-through">₹${price}</small> <span class="badge bg-success">${discount}% OFF</span></p>
            <div class="d-flex justify-content-between">
              <button class="btn btn-sm btn-primary" onclick="showPreview('${meal.idMeal}')">Preview</button>
              <button class="btn btn-sm ${isFav ? 'btn-danger' : 'btn-outline-danger'}" onclick="toggleFavorite('${meal.idMeal}')">${isFav ? '❤️' : '🤍'}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

// Filter Tags
function renderTags() {
  allTags.forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-info";
    btn.innerText = tag;
    btn.onclick = () => {
      currentFilter = currentFilter === tag ? "" : tag;
      currentPage = 1;
      renderRecipes();
    };
    filterTags.appendChild(btn);
  });
}

// Favorites
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
}
function toggleFavorite(id) {
  let favs = getFavorites();
  if (favs.includes(id)) {
    favs = favs.filter(fid => fid !== id);
    showAlert("Removed from favorites", "warning");
  } else {
    favs.push(id);
    showAlert("Added to favorites", "success");
  }
  localStorage.setItem("favorites", JSON.stringify(favs));
  renderRecipes();
}

// Recipe Modal
async function showPreview(id) {
  showLoader();
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  const data = await res.json();
  const meal = data.meals[0];
  document.getElementById("modalTitle").innerText = meal.strMeal;
  document.getElementById("modalBody").innerHTML = `
    <img src="${meal.strMealThumb}" class="img-fluid mb-3">
    <p><strong>Category:</strong> ${meal.strCategory}</p>
    <p><strong>Instructions:</strong> ${meal.strInstructions}</p>
    <a href="${meal.strYoutube}" target="_blank">Watch on YouTube</a>
  `;
  new bootstrap.Modal(document.getElementById("recipeModal")).show();
  hideLoader();
}

// Search
searchBtn?.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) return showAlert("Please enter a search term", "danger");

  showLoader();
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
  const data = await res.json();
  currentRecipes = data.meals || [];
  currentPage = 1;
  renderRecipes();
  hideLoader();
});



// -------- Authentication --------
// ✅ Reusable alert
function showAlert(msg, type = "info") {
  const alertBox = document.createElement("div");
  alertBox.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertBox.style.zIndex = 9999;
  alertBox.textContent = msg;
  document.body.appendChild(alertBox);
  setTimeout(() => alertBox.remove(), 2000);
}

// ✅ Register
document.getElementById("registerForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("regName").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  if (!username || !password) return showAlert("All fields required", "danger");

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  if (users.some(u => u.username === username)) {
    return showAlert("Username already exists", "warning");
  }

  users.push({ username, password });
  localStorage.setItem("users", JSON.stringify(users));

  showAlert("Registered successfully!", "success");
  setTimeout(() => location.href = "login.html", 1000);
});

// ✅ Login
document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return showAlert("Invalid credentials", "danger");

  localStorage.setItem("currentUser", JSON.stringify(user));
  showAlert("Login successful!", "success");
  setTimeout(() => window.location.href = "recipe.html", 1000);
});



// Logout
if (window.location.pathname.includes("logout")) {
  localStorage.removeItem("currentUser");
  showAlert("Logged out", "success");
  setTimeout(() => window.location.href = "login.html", 1000);
}
// Add this loader function if not already defined
function showLoader() {
  document.getElementById("loader")?.classList.remove("d-none");
}
function hideLoader() {
  document.getElementById("loader")?.classList.add("d-none");
}

// Update toggleFavorite function with loader
function toggleFavorite(id) {
  showLoader(); // Show loader immediately

  setTimeout(() => {
    let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (favs.includes(id)) {
      favs = favs.filter(f => f !== id);
      showAlert("Removed from Favorites 💔", "danger");
    } else {
      favs.push(id);
      showAlert("Added to Favorites 🧡", "success");
    }
    localStorage.setItem("favorites", JSON.stringify(favs));
    hideLoader(); // Hide loader after action

    // If you're on favorites page, re-render list
    if (window.location.pathname.includes("favorites")) {
      loadFavorites();
    }
  }, 600); // slight delay to show spinner
}

// -------- Initialize --------
if (document.getElementById("recipeContainer")) {
  fetchRecipes();
  renderTags();
}
