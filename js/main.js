document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".money-saver-main-container .money-saver-app .element-form");
  inputs.forEach((element) => {
    element.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-to-list-btn")) {
        const nameInput = e.currentTarget.querySelector(".name-input");
        const valueInput = e.currentTarget.querySelector(".value-input");
        const isNameInputValidate = validateInput(nameInput, "name");
        const isValueInputValidate = validateInput(valueInput, "value");

        if (isNameInputValidate && isValueInputValidate) {
          updateList(e.currentTarget.parentElement.querySelector(".list"), nameInput.value, valueInput.value);
        }
      }
    });
  });
});

function validateInput(input, type) {
  const errorMessages = {
    name: {
      empty: "Nie wypełniono pola z nazwą!",
      invalid: "Użyto niedozwolonych znaków w nazwie!",
    },
    value: {
      empty: "Nie wypełniono pola z kwotą!",
      invalid: "Użyto niedozwolonych znaków w kwocie!",
    },
  };

  const regexPatterns = {
    name: /^[a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ,.\-()!?:]*$/,
    value: /^\d+([ \d]*[\.,]?\d*)?$/,
  };

  if (input.value === "") {
    createNotification(errorMessages[type].empty);
    input.classList.add("error");
    return false;
  } else {
    const regex = regexPatterns[type];
    if (!regex.test(input.value)) {
      createNotification(errorMessages[type].invalid);
      input.classList.add("error");
      return false;
    } else {
      input.classList.remove("error");
      return true;
    }
  }
}

function updateSavings(value) {
  const savingsContainer = document.querySelector(".money-saver-main-container .money-saver-app .savings-content");
  const [savingsHeader, savingsValue, emojis] = [savingsContainer.querySelector(".heading"), savingsContainer.querySelector(".value"), savingsContainer.querySelector(".emojis")];

  savingsValue.textContent = `${value} zł`;
  const isPositive = value > 0;
  const isNegative = value < 0;

  savingsHeader.textContent = isPositive ? "Możesz jeszcze wydać:" : isNegative ? "Bilans jest ujemny. Jesteś na minusie:" : "Bilans wynosi zero.";

  emojis.querySelector(".sad-emoji").classList.toggle("visible", isNegative);
  emojis.querySelector(".smile-emoji").classList.toggle("visible", isPositive);
}

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

function updateList(list, name, value) {
  const cleanedValue = value.replace(/[ ]/g, "");
  const newElement = document.createElement("li");
  newElement.classList.add("list-element", "fade-in");
  newElement.innerHTML = `<p class="name" data-value="${cleanedValue}">${name} - ${cleanedValue} zł</p>
                        <div class="buttons">
                            <button class="edit-btn">Edytuj</button>
                            <button class="remove-btn">Usuń</button>
                        </div>`;
  setTimeout(() => {
    newElement.classList.remove("fade-in");
  }, 1000);

  list.prepend(newElement);
}
