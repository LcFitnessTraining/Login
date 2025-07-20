import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyBEwcm6UoygkxdAnCRR3BDx2y43LHjRsXY",
  authDomain: "login-e54be.firebaseapp.com",
  projectId: "login-e54be",
  storageBucket: "login-e54be.firebasestorage.app",
  messagingSenderId: "1043421028655",
  appId: "1:1043421028655:web:17e4e4dc7ebe24886641da",
  measurementId: "G-JP9PE1MW6F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const fakeFoods = [
  { name: "Riso", calories: 130, carbs: 28, protein: 2.7, fat: 0.3 },
  { name: "Pollo", calories: 165, carbs: 0, protein: 31, fat: 3.6 },
  { name: "Tonno", calories: 132, carbs: 0, protein: 28, fat: 1.3 },
  { name: "Uova", calories: 155, carbs: 1.1, protein: 13, fat: 11 },
  { name: "Fiocchi di latte", calories: 98, carbs: 3.4, protein: 11.1, fat: 4.3 }
];

const meals = {
  colazione: [],
  pranzo: [],
  cena: [],
  spuntini: []
};

const goals = {
  calories: 0,
  carbs: 0,
  protein: 0,
  fat: 0
};

function updateGoals() {
  goals.carbs = parseInt(document.getElementById("goal-carbs").value) || 0;
  goals.protein = parseInt(document.getElementById("goal-protein").value) || 0;
  goals.fat = parseInt(document.getElementById("goal-fat").value) || 0;

  goals.calories = (goals.carbs * 4) + (goals.protein * 4) + (goals.fat * 9);
  document.getElementById("goal-calories").value = goals.calories;

  updateTotals();
}

function setProgressBar(id, value, max, warnId) {
  const bar = document.getElementById(id);
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  bar.style.width = percent + "%";
  bar.textContent = `${value.toFixed(1)}g / ${max}g`;

  const warnEl = document.getElementById(warnId);
  if (value > max) {
    warnEl.textContent = "⚠️";
    warnEl.title = "Hai superato il tuo obiettivo!";
  } else {
    warnEl.textContent = "";
    warnEl.removeAttribute("title");
  }
}

async function searchFood() {
  const query = document.getElementById("food-search").value.trim();
  if (!query) return;

  const container = document.getElementById("search-results");
  container.innerHTML = "Caricamento...";

  try {
    const foods = await searchFoodUSDA(query); // chiamata API

    container.innerHTML = ""; // pulisco i risultati

    foods.forEach(food => {
      const parsedFood = parseUSDAFood(food);

      const div = document.createElement("div");
      div.classList.add("food-item");

      const nameSpan = document.createElement("span");
      nameSpan.textContent = parsedFood.name;
      nameSpan.classList.add("food-name");

      const qtyInput = document.createElement("input");
      qtyInput.type = "number";
      qtyInput.min = "1";
      qtyInput.value = "100";
      qtyInput.classList.add("food-qty");

      const addBtn = document.createElement("button");
      addBtn.textContent = "Aggiungi";
      addBtn.onclick = () => {
        const qty = parseFloat(qtyInput.value);
        if (isNaN(qty) || qty <= 0) {
          alert("Inserisci una quantità valida");
          return;
        }

        const mealTypeSel = document.getElementById("meal-type").value;

        const foodWithQty = {
          name: parsedFood.name,
          calories: (parsedFood.calories * qty) / 100,
          carbs: (parsedFood.carbs * qty) / 100,
          protein: (parsedFood.protein * qty) / 100,
          fat: (parsedFood.fat * qty) / 100,
          qty: qty
        };

        addFood(mealTypeSel, foodWithQty);
      };

      div.appendChild(nameSpan);
      div.appendChild(qtyInput);
      div.appendChild(addBtn);

      container.appendChild(div);
    });

  } catch (error) {
    container.innerHTML = "Errore nella ricerca. Riprova.";
    console.error(error);
  }
}


function addFood(mealType, food) {
  const foodCopy = { ...food };
  meals[mealType].push(foodCopy);
  updateMealTable(mealType);
  updateTotals();
}

function removeFood(mealType, index) {
  meals[mealType].splice(index, 1);
  updateMealTable(mealType);
  updateTotals();
}

function updateMealTable(mealType) {
  const tbody = document.querySelector(`#${mealType}-table tbody`);
  tbody.innerHTML = "";
  let mealCalories = 0, mealCarbs = 0, mealProtein = 0, mealFat = 0;

  meals[mealType].forEach((item, index) => {
    mealCalories += item.calories;
    mealCarbs += item.carbs;
    mealProtein += item.protein;
    mealFat += item.fat;

    const row = document.createElement("tr");
    row.innerHTML = `
<td>${item.name}</td>
<td>${item.calories.toFixed(1)}</td>
<td>${item.carbs.toFixed(1)}</td>
<td>${item.protein.toFixed(1)}</td>
<td>${item.fat.toFixed(1)}</td>
<td>${(item.qty || 1)}g</td>
<td><button onclick="removeFood('${mealType}', ${index})">✖</button></td>
    `;
    tbody.appendChild(row);
  });

  if (meals[mealType].length > 0) {
    const totalRow = document.createElement("tr");
    totalRow.style.fontWeight = "bold";
    totalRow.innerHTML = `
      <td>Totale</td>
      <td>${mealCalories.toFixed(1)}</td>
      <td>${mealCarbs.toFixed(1)}</td>
      <td>${mealProtein.toFixed(1)}</td>
      <td>${mealFat.toFixed(1)}</td>
      <td></td>
      <td></td>
    `;
    tbody.appendChild(totalRow);
  }
}

function updateTotals() {
  let totalCalories = 0, totalCarbs = 0, totalProtein = 0, totalFat = 0;
  for (let type in meals) {
    meals[type].forEach(item => {
      totalCalories += item.calories;
      totalCarbs += item.carbs;
      totalProtein += item.protein;
      totalFat += item.fat;
    });
  }

  document.getElementById("total-calories").textContent = totalCalories.toFixed(1);
  document.getElementById("total-carbs").textContent = totalCarbs.toFixed(1);
  document.getElementById("total-protein").textContent = totalProtein.toFixed(1);
  document.getElementById("total-fat").textContent = totalFat.toFixed(1);

  setProgressBar("bar-carbs", totalCarbs, goals.carbs, "warn-carbs");
  setProgressBar("bar-protein", totalProtein, goals.protein, "warn-protein");
  setProgressBar("bar-fat", totalFat, goals.fat, "warn-fat");
}

function showSavedMessage() {
  const msg = document.getElementById("goal-saved-msg");
  msg.classList.add("show");
  setTimeout(() => msg.classList.remove("show"), 3000);
}
const apiKey = 'Im2rpNri91d10YiCAevSVCbfG9Xe54w1AYMEO0L4'; // sostituisci con la tua chiave

async function searchFoodUSDA(query) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: query,
      pageSize: 5  // numero di risultati che vuoi ricevere
    })
  });

  if (!response.ok) {
    throw new Error('Errore nella chiamata API');
  }
  
  const data = await response.json();
  console.log(data);
  return data.foods; // lista di alimenti trovati
}
searchFoodUSDA('apple').then(foods => {
  foods.forEach(food => {
    console.log(food.description);  // nome alimento
  });
});
function parseUSDAFood(food) {
  let calories = 0, carbs = 0, protein = 0, fat = 0;

  food.foodNutrients.forEach(nutrient => {
    switch(nutrient.nutrientName) {
      case 'Energy':
        calories = nutrient.value;
        break;
      case 'Carbohydrate, by difference':
        carbs = nutrient.value;
        break;
      case 'Protein':
        protein = nutrient.value;
        break;
      case 'Total lipid (fat)':
        fat = nutrient.value;
        break;
    }
  });

  return {
    name: food.description,
    calories,
    carbs,
    protein,
    fat
  };
}





