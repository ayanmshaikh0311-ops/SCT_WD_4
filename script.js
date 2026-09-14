let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let lists = JSON.parse(localStorage.getItem("lists")) || [
  "Personal",
  "Work",
  "Study",
];

let currentList = lists[0];

let currentFilter = "all";

// DOM elements
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskList = document.getElementById("taskList");

const taskContainer = document.getElementById("taskContainer");
const listContainer = document.getElementById("listContainer");

const listTitle = document.getElementById("listTitle");
const taskCount = document.getElementById("taskCount");

// Save data
function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("lists", JSON.stringify(lists));
}

// Render lists
function renderLists() {
  listContainer.innerHTML = "";
  lists.forEach((list) => {
    const div = document.createElement("div");
    div.className = "list-item " + (list === currentList ? "active" : "");
    div.innerHTML = `
            <span>${list}</span>

            ${
              lists.length > 1
                ? `<button class="delete-list"
                    onclick="deleteList(event, '${list}')">
                    🗑️
                   </button>`
                : ""
            }
        `;

    div.onclick = () => {
      currentList = list;
      renderLists();
      renderTasks();
    };
    listContainer.appendChild(div);
  });

  // Update task list dropdown
  taskList.innerHTML = "";
  lists.forEach((list) => {
    const option = document.createElement("option");
    option.value = list;
    option.textContent = list;
    taskList.appendChild(option);
  });
  taskList.value = currentList;
}

// Add list
document.getElementById("addListBtn").addEventListener("click", () => {
  const name = prompt("Enter list name:");
  if (!name) return;
  const cleanName = name.trim();
  if (!cleanName) return;
  if (lists.includes(cleanName)) {
    alert("This list already exists.");
    return;
  }

  lists.push(cleanName);
  currentList = cleanName;
  saveData();
  renderLists();
  renderTasks();
});

// Delete list
function deleteList(event, list) {
  event.stopPropagation();
  if (lists.length === 1) {
    alert("You need at least one list.");
    return;
  }

  if (!confirm(`Delete "${list}" list?`)) {
    return;
  }
  lists = lists.filter((item) => item !== list);
  tasks = tasks.filter((task) => task.list !== list);
  currentList = lists[0];
  saveData();
  renderLists();
  renderTasks();
}

// Add task
document.getElementById("addTaskBtn").addEventListener("click", addTask);
taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

function addTask() {
  const title = taskInput.value.trim();
  if (!title) {
    alert("Please enter a task.");
    return;
  }
  const newTask = {
    id: Date.now(),
    title: title,
    list: taskList.value,
    date: taskDate.value,
    completed: false,
  };

  tasks.push(newTask);
  saveData();
  taskInput.value = "";
  taskDate.value = "";
  renderTasks();
}

// Render tasks
function renderTasks() {
  listTitle.textContent = currentList;
  let filteredTasks = tasks.filter((task) => task.list === currentList);
  if (currentFilter === "active") {
    filteredTasks = filteredTasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    filteredTasks = filteredTasks.filter((task) => task.completed);
  }

  taskContainer.innerHTML = "";
  if (filteredTasks.length === 0) {
    taskContainer.innerHTML = `
            <div class="empty">
                <h3>you have no task </h3>
                <p>Add a task to get started.</p>
            </div>
        `;
  }

  filteredTasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = "task " + (task.completed ? "completed" : "");
    let dateText = "";
    if (task.date) {
      const date = new Date(task.date);
      dateText = date.toLocaleString();
    }

    div.innerHTML = `

            <input
                type="checkbox"
                class="checkbox"
                ${task.completed ? "checked" : ""}
                onchange="toggleTask(${task.id})"
            >

            <div class="task-info">

                <div class="task-title">
                    ${escapeHTML(task.title)}
                </div>

                ${
                  dateText
                    ? `<div class="task-date">
                        📅 ${dateText}
                       </div>`
                    : ""
                }

            </div>

            <div class="task-actions">
                <button onclick="editTask(${task.id})">
                    ✏️
                </button>
                <button onclick="deleteTask(${task.id})">
                    🗑️
                </button>
            </div>
        `;
    taskContainer.appendChild(div);
  });
  updateCount();
}

// Complete task

function toggleTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveData();
  renderTasks();
}

// Edit task
function editTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;
  const newTitle = prompt("Edit task:", task.title);
  if (newTitle === null) return;
  const title = newTitle.trim();
  if (!title) return;
  task.title = title;
  saveData();
  renderTasks();
}

// Delete task
function deleteTask(id) {
  if (!confirm("Delete this task?")) {
    return;
  }

  tasks = tasks.filter((task) => task.id !== id);
  saveData();
  renderTasks();
}

// Clear completed
document.getElementById("clearCompletedBtn").addEventListener("click", () => {
  tasks = tasks.filter(
    (task) => !(task.list === currentList && task.completed),
  );

  saveData();
  renderTasks();
});

// Filters
document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".filter")
      .forEach((btn) => btn.classList.remove("active"));

    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

// Count
function updateCount() {
  const listTasks = tasks.filter((task) => task.list === currentList);
  const activeTasks = listTasks.filter((task) => !task.completed);
  taskCount.textContent = `${activeTasks.length} active / ${listTasks.length} total`;
}

// Dark mode
document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", dark);
  document.getElementById("themeBtn").textContent = dark ? "☀️" : "🌙";
});

// Load dark mode
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
  document.getElementById("themeBtn").textContent = "☀️";
}

// Prevent HTML injection
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Initial render
renderLists();
renderTasks();
