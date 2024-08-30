document.addEventListener("DOMContentLoaded", () => {
  generateItems();
  updateSum();
  formEvents("#revenues-form");
  formEvents("#expenses-form");
});

function formEvents(formID) {
  const form = document.querySelector(formID);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = Array.from(new FormData(form).entries());
    const name = formData[0][1];
    const value = formData[1][1];
    const isNameValid = validateInput(name, "name");
    const isValueValid = validateInput(value, "value");
    const nameInput = form.querySelector('[id$="-name-input"]');
    const valueInput = form.querySelector('[id$="-value-input"]');
    const newItem = createItem(name, value, true);
    const itemsList = form.parentNode.querySelector('[id$="-list"]');

    if (isNameValid && isValueValid) {
      nameInput.classList.remove("error");
      valueInput.classList.remove("error");
      itemsList.prepend(newItem);
      updateSum();
      updateStorage();
      form.reset();
    } else if (!isNameValid && isValueValid) {
      nameInput.classList.add("error");
      valueInput.classList.remove("error");
    } else if (!isValueValid && isNameValid) {
      nameInput.classList.remove("error");
      valueInput.classList.add("error");
    } else {
      nameInput.classList.add("error");
      valueInput.classList.add("error");
    }
  });
}

function validateInput(value, type) {
  const maxLength = {
    name: 100,
    value: 15,
  };

  const valueSize = 0.01;

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
      size: "Podana wartość kwoty jest mniejsza od 0.01!",
    },
  };

  const regexPatterns = {
    name: /^[a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ,.\-()!?:\s]*$/,
    value: /^\s*\d+(\s*\d+)*(\s*[.,]\s*\d+(\s*\d+)*)?$/,
  };

  if (value.trim() === "") {
    createNotification(errorMessages[type].empty);
    return false;
  }

  if (!regexPatterns[type].test(value)) {
    createNotification(errorMessages[type].invalid);

    return false;
  }

  if (value.length > maxLength[type]) {
    createNotification(errorMessages[type].length);
    return false;
  }

  if (type === "value") {
    if (convertValue(value) < valueSize) {
      createNotification(errorMessages[type].size);
      return false;
    }
  }

  return true;

  function createNotification(text) {
    const notificationsContainer = document.querySelector("#notifications");

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
  item.innerHTML = "";

  const form = document.createElement("form");
  form.className = "edit-form";

  const newInputName = document.createElement("input");
  newInputName.type = "text";
  newInputName.placeholder = "Nazwa";
  newInputName.name = "new-name-input";
  newInputName.className = "new-name";
  newInputName.value = copyItem.dataset.name;

  const newInputValue = document.createElement("input");
  newInputValue.type = "text";
  newInputValue.placeholder = "Kwota";
  newInputValue.name = "new-value-input";
  newInputValue.className = "new-value";
  newInputValue.value = copyItem.dataset.value;

  const acceptBtn = document.createElement("button");
  acceptBtn.type = "submit";
  acceptBtn.className = "accept";

  const declineBtn = document.createElement("button");
  declineBtn.className = "decline";

  declineBtn.addEventListener("click", () => {
    copyItem.classList.remove("fade-in");

    newItem.querySelector(".edit-btn").addEventListener("click", (e) => {
      const listElement = e.target.parentNode.parentNode;
      editListItem(listElement);
    });

    newItem.querySelector(".remove-btn").addEventListener("click", (e) => {
      e.target.parentNode.parentNode.remove();
      updateSum();
      updateStorage();
    });

    item.replaceWith(copyItem);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newFormData = Array.from(new FormData(form).entries());
    const newName = newFormData[0][1];
    const newValue = newFormData[1][1];
    const isNewNameValid = validateInput(newName, "name");
    const isNewValueValid = validateInput(newValue, "value");

    if (isNewNameValid && isNewValueValid) {
      newInputName.classList.remove("error");
      newInputValue.classList.remove("error");

      const newItem = copyItem;
      const convertedValue = convertValue(newValue);
      newItem.firstChild.textContent = `${newName} - ${convertedValue} zł`;
      newItem.dataset.name = newName;
      newItem.dataset.value = convertedValue;
      newItem.classList.remove("fade-in");

      newItem.querySelector(".edit-btn").addEventListener("click", (e) => {
        const listElement = e.target.parentNode.parentNode;
        editListItem(listElement);
      });

      newItem.querySelector(".remove-btn").addEventListener("click", (e) => {
        e.target.parentNode.parentNode.remove();
        updateSum();
        updateStorage();
      });

      item.replaceWith(newItem);

      updateSum();
      updateStorage();
    } else if (!isNewNameValid && isNewValueValid) {
      newInputName.classList.add("error");
      newInputValue.classList.remove("error");
    } else if (!isNewValueValid && isNewNameValid) {
      newInputName.classList.remove("error");
      newInputValue.classList.add("error");
    } else {
      newInputName.classList.add("error");
      newInputValue.classList.add("error");
    }
  });

  form.appendChild(newInputName);
  form.appendChild(newInputValue);
  form.appendChild(acceptBtn);
  form.appendChild(declineBtn);

  item.appendChild(form);
}

function updateSavings(value) {
  const savingsContainer = document.querySelector("#savings-content");
  const savingsHeader = savingsContainer.querySelector(".heading");
  const savingsValue = savingsContainer.querySelector(".value");
  const emojis = savingsContainer.querySelector(".emojis");

  savingsValue.textContent = `${value} zł`;
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isTooBig = value > 999999;

  if (isPositive) {
    savingsHeader.textContent = "Możesz jeszcze wydać:";
  } else if (isNegative) {
    savingsHeader.textContent = "Bilans jest ujemny. Jesteś na minusie:";
  } else {
    savingsHeader.textContent = "Bilans wynosi zero!";
  }

  if (isTooBig) {
    savingsValue.classList.add("smaller-font");
  } else {
    savingsValue.classList.remove("smaller-font");
  }

  emojis.querySelector(".sad-emoji").classList.toggle("visible", isNegative);
  emojis.querySelector(".smile-emoji").classList.toggle("visible", isPositive);
}

function createItem(name, value, animation = false) {
  const convertedValue = convertValue(value);

  const listItem = document.createElement("li");
  listItem.className = "list-element";
  listItem.dataset.value = convertedValue;
  listItem.dataset.name = name;

  if (animation) {
    listItem.classList.add("fade-in");
  }

  const nameParagraph = document.createElement("p");
  nameParagraph.className = "name";
  nameParagraph.textContent = `${name} - ${convertedValue} zł`;

  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "buttons";

  const editButton = document.createElement("button");
  editButton.className = "edit-btn";
  editButton.textContent = "Edytuj";

  editButton.addEventListener("click", (e) => {
    const listElement = e.target.parentNode.parentNode;
    editListItem(listElement);
  });

  const removeButton = document.createElement("button");
  removeButton.className = "remove-btn";
  removeButton.textContent = "Usuń";

  removeButton.addEventListener("click", (e) => {
    e.target.parentNode.parentNode.remove();
    updateSum();
    updateStorage();
  });

  buttonsDiv.appendChild(editButton);
  buttonsDiv.appendChild(removeButton);

  listItem.appendChild(nameParagraph);
  listItem.appendChild(buttonsDiv);

  return listItem;
}

function generateItems() {
  const revenuesList = document.querySelector("#revenues-list");
  const expensesList = document.querySelector("#expenses-list");

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
  const revenuesSum = document.querySelector("#revenues .sum .font-bold");
  const expensesSum = document.querySelector("#expenses .sum .font-bold");
  const revenuesListChildren = document.querySelectorAll("#revenues .list .list-element");
  const expensesListChildren = document.querySelectorAll("#expenses .list .list-element");
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

  revenuesSum.textContent = parseFloat(sumForRevenues).toFixed(2) + " zł";
  expensesSum.textContent = parseFloat(sumForExpenses).toFixed(2) + " zł";

  const savings = parseFloat(sumForRevenues - sumForExpenses).toFixed(2);
  updateSavings(savings);
}

function updateStorage() {
  const revenuesListChildren = document.querySelectorAll("#revenues .list .list-element");
  const expensesListChildren = document.querySelectorAll("#expenses .list .list-element");
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
  value = parseFloat(parseFloat(value).toFixed(2));
  return value;
}
