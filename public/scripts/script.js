const form = document.querySelector("form");
const find = document.getElementById("find");
const add = document.getElementById("add");
const save = document.getElementById("save");
const reset = document.querySelector("button[type=reset]");
const back = document.getElementById("back");
const list = document.querySelector(".list");
const name = document.querySelector("input[name=username]");
const age = document.querySelector("input[name=age]");
const nameError = document.getElementById("nameError");
const ageError = document.getElementById("ageError");
let currentSaveForRedactHandler = null;

function clearList() {
  list.innerHTML = "";
  name.value = "";
  age.value = "";
}

function checkName() {
  if (!/^[A-Za-zА-Яа-яёЁ\s]+$/.test(name.value)) {
    nameError.style.display = "block";
    name.style.outline = "#530000 solid 2px";
    return false;
  }

  nameError.style.display = "none";
  name.style.outline = "none";
  return true;
}

function checkAge() {
  if (!/^[0-9\.,]+$/.test(age.value)) {
    ageError.style.display = "block";
    age.style.outline = "#530000 solid 2px";
    return false;
  }
  ageError.style.display = "none";
  age.style.outline = "none";
  return true;
}

function test() {
  let isValid = true;

  if (!checkName()) {
    nameError.style.display = "block";
    isValid = false;
  } else {
    nameError.style.display = "none";
  }

  if (!checkAge()) {
    ageError.style.display = "block";
    isValid = false;
  } else {
    ageError.style.display = "none";
  }

  return isValid;
}

function addListeners() {
  const deleteButtons = document.querySelectorAll(".delete");
  Array.from(deleteButtons).forEach((element) => {
    element.addEventListener("click", (e) => deleteUser(e.target));
  });

  const redact = document.querySelectorAll(".redact");
  redact.forEach((element) => {
    element.addEventListener("click", (e) => {
      e.preventDefault();
      redactUser(e.target);
    });
  });
}

function backToTheMain() {
  find.style.display = "block";
  add.style.display = "block";
  list.style.display = "grid";
  save.style.display = "none";
  back.style.display = "none";
  clearList();
  getUsers();
}

function redactUser(e) {
  find.style.display = "none";
  add.style.display = "none";
  list.style.display = "none";
  save.style.display = "block";
  back.style.display = "block";
  const elem = e.closest("li");
  name.value = elem.children[0].textContent;
  age.value = elem.children[1].textContent;
  const id = elem.children[2].textContent;

  if (currentSaveForRedactHandler) {
    save.removeEventListener("click", currentSaveForRedactHandler);
  }

  currentSaveForRedactHandler = function (event) {
    event.preventDefault();
    if (!test()) return;
    saveForRedact(id);
  };

  save.addEventListener("click", currentSaveForRedactHandler);
}

async function getUsers() {
  try {
    nameError.style.display = "none";
    ageError.style.display = "none";
    const response = await fetch("/getUsers");
    if (!response.ok) return;
    const result = await response.json();
    result.forEach((element) => {
      list.insertAdjacentHTML(
        "beforeend",
        `<li class="item">
              <span>${element.name}</span>
              <span>${element.age}</span>
              <span>${element.id}</span>
              <button class='redact'>Редактировать</button>
              <button class='delete'>Удалить</button>
            </li>`
      );
    });
    addListeners();
  } catch (error) {
    console.error(error);
  }
}

async function getOneUser() {
  try {
    const response = await fetch(`/getOneUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: DOMPurify.sanitize(name.value, { USE_PROFILES: { html: true } }),
        age: DOMPurify.sanitize(age.value, { USE_PROFILES: { html: true } }),
      }),
    });
    if (!response.ok) return;
    const result = await response.json();
    if (result.success) {
      back.style.display = "block";
      clearList();
      if (!result.results.length) {
        list.style.display = "block";
        return list.insertAdjacentHTML(
          "beforeend",
          "<div>Пользователь не найден<div>"
        );
      }
      result.results.forEach((element) => {
        list.insertAdjacentHTML(
          "beforeend",
          `<li class="item">
                <span>${element.name}</span>
                <span>${element.age}</span>
                <span>${element.id}</span>
                <button class='redact'>Редактировать</button>
                <button class='delete'>Удалить</button>
        </li>`
        );
      });

      addListeners();
    } else {
      alert("Ошибка при вводе данных");
    }
  } catch (error) {
    console.error(error);
  }
}

async function addUser() {
  try {

    const response = await fetch(`/addUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: DOMPurify.sanitize(name.value, { USE_PROFILES: { html: true } }),
        age: DOMPurify.sanitize(age.value, { USE_PROFILES: { html: true } }),
      }),
    });
    if (!response.ok) return;
    const result = await response.json();
    back.style.display = "block";
    if (result.success) {
      clearList();
      list.style.display = "block";
      return list.insertAdjacentHTML(
        "beforeend",
        "<div>Пользователь успешно добавлен<div>"
      );
    } else {
      alert("Ошибка при вводе данных");
    }
  } catch (error) {
    console.error(error);
  }
}

async function deleteUser(e) {
  try {
    const elem = e.closest("li");
    const id = elem.children[2].textContent;
    const response = await fetch(`/users/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) return;
    const result = await response.json();
    if (result.success) {
      elem.remove();
      clearList();
      getUsers();
    } else {
      alert("Ошибка при вводе данных");
    }
  } catch (error) {
    console.error(error);
  }
}

async function saveForRedact(id) {
  if (!name.value && !age.value) return;
  try {
    const response = await fetch(`/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: DOMPurify.sanitize(name.value, { USE_PROFILES: { html: true } }),
        age: DOMPurify.sanitize(age.value, { USE_PROFILES: { html: true } }),
      }),
    });
    if (!response.ok) return;
    const result = await response.json();
    if (result.success) {
      backToTheMain();
    } else {
      alert("Ошибка при вводе данных");
    }
  } catch (error) {
    console.error(error);
  }
}

find.addEventListener("click", (e) => {
  e.preventDefault();
  if (!test()) return;
  if (!name.value && !age.value) return;
  getOneUser();
});

reset.addEventListener("click", (e) => {
  e.preventDefault();
  if (!test()) return;
  if (!name.value && !age.value) return;
  clearList();
  getUsers();
});

add.addEventListener("click", (e) => {
  e.preventDefault();
  if (!test()) return;
  if (!name.value && !age.value) return;
  addUser();
  clearList();
});

back.addEventListener("click", (e) => {
  e.preventDefault();
  backToTheMain();
});
getUsers();
