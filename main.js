const ul = document.getElementById("toDoList");
const loader = document.getElementById("loader");
const input = document.getElementById("newTaskInput");
const addBtn = document.getElementById("addBtn");

const classList = "px-4 py-2 flex items-center justify-between";
const getCheckboxTemplate = (completed, id) =>
  completed
    ? `<input type="checkbox" data-id="${id}" checked>`
    : `<input type="checkbox" data-id=${id}>`;
const getTemplate = (task, completed, id) => `<span class="text-gray-800">
${getCheckboxTemplate(completed, id)}
${task}
</span>
<button class="text-red-600 hover:text-red-800" data-id="${id}">
  Remove
</button>`;

function addItem(todoData, toStart = false) {
  const { userId, id, title, completed } = todoData;
  const liEl = document.createElement("li");
  liEl.classList.value = classList;
  liEl.innerHTML = getTemplate(title, completed, id);

  if (toStart) {
    ul.prepend(liEl);
  } else {
    ul.appendChild(liEl);
  }
}

function toggleLoader() {
  loader.classList.toggle("hidden");
}

function init() {
  toggleLoader();

  let data = [];

  fetch("https://jsonplaceholder.typicode.com/todos")
    .then((response) => response.json())
    .then((json) => {
      data = json;
      console.log(data);
      loadPage();
    });

  function loadPage() {
    if (data.length) {
      console.log("Before splice: ", data.length);
      const firstPage = data.splice(0, 14);
      console.log("After splice: ", data.length);

      firstPage.forEach((element) => {
        addItem(element);
      });
    }
    toggleLoader();
  }

  return {
    loadPage: loadPage,
    data: data,
  };
}

async function removeElement(targetEl) {
  const id = targetEl.dataset.id;
  const fetchResponse = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${id}`,
    {
      method: "DELETE",
    }
  );
  const responseJson = await fetchResponse.status;
  console.log("status: ", responseJson);

  if (responseJson === 200) {
    console.log("target removed: ", targetEl.parentNode);
    targetEl.parentNode.remove();
  }
}

const dataLoader = init();

function addListeners() {
  ul.addEventListener("scroll", function (event) {
    const { scrollHeight, clientHeight, scrollTop } = event.target;
    if (Math.round(scrollTop) + clientHeight >= scrollHeight) {
      toggleLoader();
      setTimeout(dataLoader.loadPage, 1000);
    }
  });
  ul.addEventListener("click", function (event) {
    console.log(event);
    if (event.target.tagName === "BUTTON") {
      removeElement(event.target);
    }
  });

  input.addEventListener("input", function (event) {
    const value = event.target.value;
    const regex = new RegExp(/^[a-zA-Z0-9_.-]*$/);
    const isValid = regex.test(value);
    const inputInvalidClass = "border-red-500";
    const btnInvalidClass = "disabled:bg-sky-500/50";
    if (!isValid) {
      addBtn.setAttribute("disabled", true);
      input.classList.add(inputInvalidClass);
      addBtn.classList.add(btnInvalidClass);
      return;
    } else {
      addBtn.removeAttribute("disabled");
      input.classList.remove(inputInvalidClass);
      addBtn.classList.remove(btnInvalidClass);
    }
  });
  addBtn.addEventListener("click", function (event) {
    const value = input.value;
    const regex = new RegExp(/^[a-zA-Z0-9_.-\s]*$/);
    const isValid = regex.test(value);

    if (isValid) {
      fetch("https://jsonplaceholder.typicode.com/todos", {
        method: "POST",
        body: JSON.stringify({
          title: value,
          completed: false,
          userId: 1,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .then((json) => {
          console.log(json);
          addItem(json, true);
        });
    }
  });
}

addListeners();
