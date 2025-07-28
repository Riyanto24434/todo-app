// 🔵 Elemen DOM
const form = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const deadlineInput = document.getElementById("deadline-input");
const priorityInput = document.getElementById("priority-input");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filter-btn");

const usernameInput = document.getElementById("username-input");
const jabatanInput = document.getElementById("jabatan-input");
const saveUsernameBtn = document.getElementById("save-username-btn");
const usernameDisplay = document.getElementById("username-display");
const clearTasksBtn = document.getElementById("clear-tasks-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// 🔵 Simpan ke localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// 🔵 Urutan Prioritas
function getPriorityValue(priority) {
  return { High: 3, Medium: 2, Low: 1 }[priority] || 0;
}

// 🔵 Render
function renderTasks() {
  taskList.innerHTML = "";

  let filtered = tasks;
  if (currentFilter === "completed") filtered = tasks.filter(t => t.completed);
  else if (currentFilter === "active") filtered = tasks.filter(t => !t.completed);

  filtered.sort((a, b) => getPriorityValue(b.priority) - getPriorityValue(a.priority));

  filtered.forEach((task, index) => {
    const li = document.createElement("li");
    const overdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed;
    const textStyle = task.completed
      ? "line-through text-gray-400"
      : overdue
        ? "text-red-500"
        : "";

    const priorityColor = {
      Low: "text-green-500",
      Medium: "text-yellow-500",
      High: "text-red-500"
    };

    li.className = "bg-white p-3 rounded shadow flex justify-between items-start";
    li.innerHTML = `
      <div class="flex-1 ${textStyle}">
        <p>${task.text}</p>
        <small class="text-sm text-gray-500">${task.deadline || "-"}</small><br>
        <span class="text-xs font-medium ${priorityColor[task.priority]}">🔥 ${task.priority}</span>
      </div>
      <div class="flex items-center gap-2 ml-4">
        <input type="checkbox" class="toggle" data-index="${index}" ${task.completed ? "checked" : ""}>
        <button class="delete text-red-500" data-index="${index}">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// 🔵 Tambah Tugas
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTask = {
    text: taskInput.value.trim(),
    deadline: deadlineInput.value,
    priority: priorityInput.value,
    completed: false,
  };

  if (!newTask.text) return;
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  form.reset();
});

// 🔵 Toggle & Delete
taskList.addEventListener("click", (e) => {
  const index = +e.target.dataset.index;
  if (e.target.classList.contains("toggle")) {
    tasks[index].completed = !tasks[index].completed;
  } else if (e.target.classList.contains("delete")) {
    tasks.splice(index, 1);
  }
  saveTasks();
  renderTasks();
});

// 🔵 Filter
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    renderTasks();
    updateFilterStyles();
  });
});

function updateFilterStyles() {
  filterButtons.forEach(btn => {
    const active = btn.dataset.filter === currentFilter;
    btn.classList.toggle("bg-blue-500", active);
    btn.classList.toggle("text-white", active);
    btn.classList.toggle("bg-gray-200", !active);
    btn.classList.toggle("text-gray-800", !active);
  });
}

// 🔵 Username + Jabatan
function loadUsername() {
  const storedName = localStorage.getItem("username");
  const storedJabatan = localStorage.getItem("jabatan");

  if (storedName && storedJabatan) {
    usernameDisplay.innerHTML = `👤 Halo, <strong>${storedName}</strong><br><span class="text-sm text-gray-600">${storedJabatan}</span>`;
    usernameInput.classList.add("hidden");
    jabatanInput.classList.add("hidden");
    saveUsernameBtn.classList.add("hidden");
  }
}

saveUsernameBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  const jabatan = jabatanInput.value.trim();

  if (name && jabatan) {
    localStorage.setItem("username", name);
    localStorage.setItem("jabatan", jabatan);
    loadUsername();
  }
});

// 🔵 Jam sekarang
function showCurrentTime() {
  const now = new Date();
  document.getElementById("current-time").textContent = "🕒 " + now.toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
setInterval(showCurrentTime, 1000);

// 🔵 Hapus Semua
clearTasksBtn.addEventListener("click", () => {
  if (confirm("Yakin ingin menghapus semua tugas?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

// 🔵 Init
loadUsername();
renderTasks();
updateFilterStyles();
showCurrentTime();
