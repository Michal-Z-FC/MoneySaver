document.addEventListener("DOMContentLoaded", () => {
  appEvents();
  generateItems();
  updateSum();
});

function appEvents() {
  const appElements = document.querySelectorAll(".money-saver-app .app-element");

  appElements.forEach((element) => {
    element.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-to-list-btn")) {
        const nameInput = e.currentTarget.querySelector(".name-input");
        const valueInput = e.currentTarget.querySelector(".value-input");
        const isNameInputValidate = validateInput(nameInput, "name");
        const isValueInputValidate = validateInput(valueInput, "value");

        if (isNameInputValidate && isValueInputValidate) {
          const newItem = createItem(nameInput.value, valueInput.value, true);
          e.currentTarget.querySelector(".list").prepend(newItem);
          nameInput.value = "";
          valueInput.value = "";
          updateSum();
          updateStorage();
        }
      }

      if (e.target.classList.contains("edit-btn")) {
        const listItem = e.target.closest(".list-element");
        editListItem(listItem);
      }

      if (e.target.classList.contains("remove-btn")) {
        e.target.closest(".list-element").remove();
        updateSum();
        updateStorage();
      }
    });
  });
}

function validateInput(input, type) {
  const maxLength = {
    name: 100,
    value: 15,
  };

  const errorMessages = {
    name: {
      empty: "Nie wypełniono pola z nazwą!",
      invalid: "Użyto niedozwolonych znaków w nazwie!",
      length: `Podano zbyt długi tekst (max ${maxLength[type]} znaków)!`,
    },
    value: {
      empty: "Nie wypełniono pola z kwotą!",
      invalid: "Użyto niedozwolonych znaków w kwocie!",
      length: `Podano zbyt dużą kwotę (max ${maxLength[type]} znaków)!`,
    },
  };

  const regexPatterns = {
    name: /^[a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ,.\-()!?:\s]*$/,
    value: /^\s*\d+(\s*\d*)*([\.,]\s*\d*)*\s*$/,
  };

  if (input.value.trim() === "") {
    createNotification(errorMessages[type].empty);
    input.classList.add("error");
    return false;
  }

  if (!regexPatterns[type].test(input.value)) {
    createNotification(errorMessages[type].invalid);
    input.classList.add("error");
    return false;
  }

  if (input.value.length > maxLength[type]) {
    createNotification(errorMessages[type].length);
    input.classList.add("error");
    return false;
  }

  input.classList.remove("error");
  return true;

  function createNotification(text) {
    const notificationsContainer = document.querySelector(".money-saver-main-container .notifications");

    if (![...notificationsContainer.children].some((child) => child.textContent === text)) {
      const notificationTile = document.createElement("div");
      notificationTile.classList.add("notification-tile");
      notificationTile.textContent = text;

      notificationsContainer.appendChild(notificationTile);

      const removeNotification = () => {
        notificationTile.classList.add("fade-out");
        setTimeout(() => notificationTile.remove(), 500);
      };

      setTimeout(removeNotification, 4000);

      notificationTile.addEventListener("click", () => {
        clearTimeout(removeNotification);
        removeNotification();
      });
    }
  }
}

function editListItem(item) {
  const copyItem = item.cloneNode(true);

  item.classList.add("edited");
  item.innerHTML = `
                    <input type="text" class="new-name" placeholder="Nowa nazwa"/>
                    <input type="text" class="new-value" placeholder="Nowa kwota"/>
                    <button class="accept"></button>
                    <button class="decline"</button>
                    `;

  item.querySelector(".new-name").value = copyItem.dataset.name;
  item.querySelector(".new-value").value = copyItem.dataset.value;

  item.addEventListener("click", (e) => {
    if (e.target.classList.contains("accept")) {
      const newName = e.currentTarget.querySelector(".new-name");
      const newValue = e.currentTarget.querySelector(".new-value");
      const isNewNameValid = validateInput(newName, "name");
      const isNewValueValid = validateInput(newValue, "value");

      if (isNewNameValid && isNewValueValid) {
        const newItem = copyItem;
        const convertedValue = convertValue(newValue.value);
        newItem.querySelector(".name").textContent = `${newName.value} - ${convertedValue} zł`;
        newItem.dataset.value = convertedValue;
        newItem.dataset.name = newName.value;
        newItem.classList.remove("fade-in");
        item.replaceWith(newItem);
        updateSum();
        updateStorage();
      }
    }

    if (e.target.classList.contains("decline")) {
      copyItem.classList.remove("fade-in");
      item.replaceWith(copyItem);
    }
  });
}

function updateSavings(value) {
  const savingsContainer = document.querySelector(".money-saver-main-container .money-saver-app .savings-content");
  const [savingsHeader, savingsValue, emojis] = [savingsContainer.querySelector(".heading"), savingsContainer.querySelector(".value"), savingsContainer.querySelector(".emojis")];

  savingsValue.textContent = `${value} zł`;
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isToBig = value > 100000000;
  const isToSmall = value < -100000000;

  if (isToBig) {
    savingsHeader.textContent = "Wartość jest zbyt duża!";
    savingsValue.textContent = "∞";
  } else if (isPositive && !isToBig) {
    savingsHeader.textContent = "Możesz jeszcze wydać:";
  } else if (isToSmall) {
    savingsHeader.textContent = "Wartość jest zbyt mała!";
    savingsValue.textContent = "∞";
  } else if (isNegative && !isToSmall) {
    savingsHeader.textContent = "Bilans jest ujemny. Jesteś na minusie:";
  } else {
    savingsHeader.textContent = "Bilans wynosi zero!";
  }

  emojis.querySelector(".sad-emoji").classList.toggle("visible", isNegative);
  emojis.querySelector(".smile-emoji").classList.toggle("visible", isPositive);
}

function createItem(name, value, animation = false) {
  const convertedValue = convertValue(value);
  const newItem = document.createElement("li");
  const newItemContent = `<p class="name">${name} - ${convertedValue} zł</p>
                          <div class="buttons">
                            <button class="edit-btn">Edytuj</button>
                            <button class="remove-btn">Usuń</button>
                          </div>`;

  newItem.classList.add("list-element");
  if (animation) {
    newItem.classList.add("fade-in");
  }
  newItem.dataset.value = convertedValue;
  newItem.dataset.name = name;
  newItem.innerHTML = newItemContent;

  return newItem;
}

function generateItems() {
  const revenuesList = document.querySelector(".money-saver-app .revenues .list");
  const expensesList = document.querySelector(".money-saver-app .expenses .list");

  const revenuesItemsList = JSON.parse(localStorage.getItem("revenuesItems"));
  const expensesItemsList = JSON.parse(localStorage.getItem("expensesItems"));

  if (revenuesItemsList) {
    revenuesItemsList.forEach((element) => {
      const newElement = createItem(element.name, element.value);
      revenuesList.prepend(newElement);
    });
  }

  if (expensesItemsList) {
    expensesItemsList.forEach((element) => {
      const newElement = createItem(element.name, element.value);
      expensesList.prepend(newElement);
    });
  }
}

function updateSum() {
  const revenuesSum = document.querySelector(".money-saver-app .revenues .sum .font-bold");
  const expensesSum = document.querySelector(".money-saver-app .expenses .sum .font-bold");
  const revenuesListChildren = document.querySelectorAll(".money-saver-app .revenues .list .list-element");
  const expensesListChildren = document.querySelectorAll(".money-saver-app .expenses .list .list-element");
  let sumForRevenues = 0;
  let sumForExpenses = 0;

  revenuesListChildren.forEach((child) => {
    const childValue = parseFloat(child.dataset.value);
    sumForRevenues += childValue;
  });

  expensesListChildren.forEach((child) => {
    const childValue = parseFloat(child.dataset.value);
    sumForExpenses += childValue;
  });

  revenuesSum.textContent = sumForRevenues + " zł";
  expensesSum.textContent = sumForExpenses + " zł";

  const savings = parseFloat(sumForRevenues - sumForExpenses);
  updateSavings(savings);
}

function updateStorage() {
  const revenuesListChildren = document.querySelectorAll(".money-saver-app .revenues .list .list-element");
  const expensesListChildren = document.querySelectorAll(".money-saver-app .expenses .list .list-element");
  let revenuesArray = [];
  let expensesArray = [];

  revenuesListChildren.forEach((child) => {
    revenuesArray = [{ name: child.dataset.name, value: child.dataset.value }, ...revenuesArray];
  });

  expensesListChildren.forEach((child) => {
    expensesArray = [{ name: child.dataset.name, value: child.dataset.value }, ...expensesArray];
  });

  localStorage.setItem("revenuesItems", JSON.stringify(revenuesArray));
  localStorage.setItem("expensesItems", JSON.stringify(expensesArray));
}

function convertValue(value) {
  value = value.replace(/\s+/g, "").replace(/,/g, ".");
  value = parseFloat(value).toFixed(2);
  value = parseFloat(value);
  return value;
}
