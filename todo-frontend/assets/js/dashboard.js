
// const BASE_URL = 'http://localhost:5000'; // Ganti sesuai URL backend-mu

// Mendapatkan elemen nama pengguna di sidebar
const sidebarUserName = document.getElementById("sidebarUserName");
const dateDisplay = document.getElementById("dateDisplay");
const taskInput = document.getElementById("taskInput");
const todoList = document.getElementById("todoList"); // Main task list for non-completed
const doneList = document.getElementById("doneList"); // Done tasks, potentially hidden or shown differently
const myDayTaskCount = document.getElementById("myDayTaskCount");

const detailPanel = document.querySelector(".task-detail-panel");
// Null check added for safety, as these might not exist until the panel is visible/selected
const detailHeaderTitle = detailPanel ? detailPanel.querySelector(".detail-header h3") : null;
const detailTaskTitle = detailPanel ? detailPanel.querySelector(".detail-section .task-title") : null;
const detailTaskCheckbox = detailPanel ? detailPanel.querySelector(".detail-section .task-checkbox") : null;
const detailDeadlineOption = detailPanel ? detailPanel.querySelector(".detail-option.deadline-option") : null;
const detailDeadlineInput = document.getElementById("detailDeadlineInput");
const detailNoteInput = detailPanel ? detailPanel.querySelector(".note-input") : null; // Mapped to description
const detailCreatedInfo = detailPanel ? detailPanel.querySelector(".created-info") : null;
const detailDeleteButton = detailPanel ? detailPanel.querySelector(".detail-footer .material-icons:first-child") : null; // Trash icon
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");

let selectedTaskElement = null; // To keep track of the currently selected task LI
let selectedTaskData = null; // To keep track of the full task object for the selected task

// --- DOM Elements for Task Form ---
const taskPrioritySelect = document.getElementById('detailPrioritySelect');
const taskIsImportantCheckbox = document.getElementById('detailIsImportantCheckbox');
const taskAddedToMyDayCheckbox = document.getElementById('detailAddedToMyDayCheckbox');
const taskStepsDiv = document.getElementById('detailTaskSteps');
const addStepButton = document.getElementById('addStepButtonDetail');
const detailUpdateTaskButton = document.getElementById('detailUpdateTaskButton');

// --- DOM Elements for Manager Feature ---
const messageDashboard = document.getElementById('messageDashboard'); // General message display area
const managerSection = document.getElementById('manager-section');
const usersList = document.getElementById('usersList');
const employeeTasksView = document.getElementById('employee-tasks-view');
const employeeNameSpan = document.getElementById('employee-name');
const employeeTasksList = document.getElementById('employeeTasksList');
const backToUsersListBtn = document.getElementById('backToUsersList');


// Function to get authentication headers
function getAuthHeaders() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
        };
    }
    return { 'Content-Type': 'application/json' };
}

// Function to get current user
function getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        return { _id: 'mockUserId123', name: 'Dev User', email: 'dev@example.com', role: 'karyawan', jabatan: 'Staf', token: 'mockToken' };
        // return { _id: 'mockManagerId456', name: 'Dev Manager', email: 'manager@example.com', role: 'manajer', jabatan: 'Head', token: 'mockManagerToken' };
    }
    return user;
}

// Simple message display function
function displayMessage(element, message, isError) {
    if (element) {
        element.textContent = message;
        element.style.color = isError ? 'red' : 'green';
        setTimeout(() => {
            element.textContent = '';
            element.style.color = '';
        }, 3000);
    } else {
        console.log(`Message: ${message} (Error: ${isError})`);
    }
}

// Function to update the sidebar username display
function displayUserName() {
    const userData = localStorage.getItem('user');

    if (userData) {

        try {

            const user = JSON.parse(userData);

            if (user && user.name && sidebarUserName) { // Add null check for sidebarUserName
                sidebarUserName.textContent = user.name;
            } else if (sidebarUserName) {
                sidebarUserName.textContent = "Pengguna"; // Fallback if name is missing but user data exists
            }
        } catch (e) {

            console.error("Error parsing user data from localStorage:", e);

            if (sidebarUserName) {
                sidebarUserName.textContent = "Pengguna";
            }
        }
    } else if (sidebarUserName) {
        sidebarUserName.textContent = "Guest";
    }
}

function updateDateDisplay() {
    
    const now = new Date();
    if (dateDisplay) { // Null check for dateDisplay
        dateDisplay.textContent = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }
}

function createTaskElement(task) { //Mesin pencetak 1 kartu berisi informasi lengkap tentang 1 tugas

  // 1. Membuat Kartu Kosong
  const li = document.createElement("li"); // createElement adalah perintah untuk membuat elemen HTML baru dari nol
  li.classList.add("task-item"); // Menambahkan kelas CSS "task-item" untuk styling

  // 2. Memberi Ciri Khusus pada Kartu
  if (task.isCompleted) li.classList.add("completed"); // Jika tugas selesai, beri tanda "sudah selesai"
  if (task.isImportant) li.classList.add("important"); // Jika tugas penting, beri tanda "penting"

  // 3. Menyimpan Informasi Rahasia di Balik Kartu (PANEL)
  li.dataset.taskId = task._id;
  li.dataset.title = task.title;
  li.dataset.description = task.description || "";
  li.dataset.deadline = task.deadline ? new Date(task.deadline).toISOString() : "";
  li.dataset.priority = task.priority;
  li.dataset.isImportant = task.isImportant;
  li.dataset.addedToMyDay = task.addedToMyDay;
  li.dataset.steps = JSON.stringify(task.steps || []);

  // 4. Menulis Isi Kartu (Apa yang Terlihat)
  li.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.isCompleted ? "checked" : ""}>
        <span class="task-title">${task.title}</span>
        ${task.isImportant ? '<span class="material-icons important-icon">star</span>' : ""}
        ${task.deadline ? `
            <span class="task-deadline">
                ${new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                ${new Date(task.deadline).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>` : ""}     
        <span class="material-icons delete-task-icon" data-id="${task._id}">delete_outline</span>
        `;

  // 5. Menambahkan Tombol dan Interaksi pada Kartu
  // Tombol centang (checklist)
  const checkbox = li.querySelector(".task-checkbox");
  if (checkbox) {
    checkbox.addEventListener("change", (e) => {
      e.stopPropagation(); // Mencegah klik ganda
      toggleTaskComplete(task._id, checkbox.checked); // Memberi tahu sistem tugas selesai/belum
    });
  }

  // Klik untuk melihat detail kartu
  li.addEventListener("click", () => {
    selectTask(li, task); // Memberi tahu sistem untuk menampilkan detail tugas ini
  });

  // Tombol hapus
  const deleteIcon = li.querySelector(".delete-task-icon");
  if (deleteIcon) {
    deleteIcon.addEventListener("click", (e) => {
      e.stopPropagation(); // Mencegah klik ganda
      deleteTask(e.target.dataset.id);
    });
  }

  // Mengembalikan kartu yang sudah jadi
  return li;
}

function selectTask(taskElement, taskData) {
    // Deselect previously selected task
    if (selectedTaskElement) {
        selectedTaskElement.classList.remove("active-task");
    }

    // Select new task
    selectedTaskElement = taskElement;
    selectedTaskData = taskData; // Store the full task object
    selectedTaskElement.classList.add("active-task");

    // Populate detail panel - add null checks for safety
    if (detailHeaderTitle) detailHeaderTitle.textContent = taskData.title;
    if (detailTaskTitle) detailTaskTitle.textContent = taskData.title;
    if (detailTaskCheckbox) detailTaskCheckbox.checked = taskData.isCompleted;
    if (detailNoteInput) detailNoteInput.value = taskData.description || '';
    if (taskPrioritySelect) taskPrioritySelect.value = taskData.priority || 'Medium';
    if (taskIsImportantCheckbox) taskIsImportantCheckbox.checked = taskData.isImportant;
    if (taskAddedToMyDayCheckbox) taskAddedToMyDayCheckbox.checked = taskData.addedToMyDay;

    // Update deadline display
    if (detailDeadlineOption && detailDeadlineInput) {
        if (taskData.deadline) {
            const deadlineDate = new Date(taskData.deadline);
            // Ensure childNodes[3] exists before accessing
            if (detailDeadlineOption.childNodes[3]) {
                detailDeadlineOption.childNodes[3].nodeValue = `Jatuh tempo ${deadlineDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long' })}`;
            }
            detailDeadlineInput.value = deadlineDate.toISOString().slice(0, 16); // Format for datetime-local
        } else {
            if (detailDeadlineOption.childNodes[3]) {
                detailDeadlineOption.childNodes[3].nodeValue = `Jatuh tempo`; // Reset text
            }
            detailDeadlineInput.value = '';
        }
    }

    // "Created Today" info
    if (detailCreatedInfo) {
        if (taskData.createdAt) {
            const createdDate = new Date(taskData.createdAt);
            detailCreatedInfo.textContent = `Dibuat ${createdDate.toLocaleDateString('id-ID')}`;
        } else {
            detailCreatedInfo.textContent = `Dibuat Tidak diketahui`;
        }
    }

    // Clear and populate steps
    if (taskStepsDiv) {
        taskStepsDiv.innerHTML = '<h4>Langkah-langkah:</h4>';
        if (taskData.steps && taskData.steps.length > 0) {
            taskData.steps.forEach((step, index) => {
                const stepWrapper = document.createElement('div');
                stepWrapper.classList.add('step-item-wrapper'); // Wrapper for input and button

                const stepInput = document.createElement('input');
                stepInput.type = 'text';
                stepInput.className = 'taskStepInput';
                stepInput.value = step.text;
                stepInput.placeholder = `Langkah ${index + 1}`;
                stepWrapper.appendChild(stepInput);

                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'X';
                removeBtn.classList.add('remove-step-btn');
                removeBtn.addEventListener('click', () => {
                    stepWrapper.remove(); // Remove the entire step wrapper
                });
                stepWrapper.appendChild(removeBtn);
                taskStepsDiv.appendChild(stepWrapper);
            });
        } else {
            // Add a default empty step if no steps exist
            const defaultStepWrapper = document.createElement('div');
            defaultStepWrapper.classList.add('step-item-wrapper');
            const defaultStepInput = document.createElement('input');
            defaultStepInput.type = 'text';
            defaultStepInput.className = 'taskStepInput';
            defaultStepInput.placeholder = 'Langkah 1';
            defaultStepWrapper.appendChild(defaultStepInput);
            taskStepsDiv.appendChild(defaultStepWrapper);
        }
    }

    // Show the detail panel (if it's dynamically hidden)
    if (detailPanel) {
        detailPanel.style.display = 'flex'; // Ensure it's visible
    }
}

function updateTaskCounts() {
    if (myDayTaskCount && todoList) {
        myDayTaskCount.textContent = todoList.children.length; // Only count tasks in "Hari Saya" for now
    }
}

function checkOverdueTasks() {
    const now = new Date();
    if (todoList) {
        todoList.querySelectorAll(".task-item:not(.completed)").forEach((item) => {
            const deadline = item.dataset.deadline;
            if (deadline) {
                const deadlineDate = new Date(deadline);
                if (now > deadlineDate) {
                    item.classList.add("overdue");
                } else {
                    item.classList.remove("overdue");
                }
            } else {
                item.classList.remove("overdue"); // No deadline, not overdue
            }
        });
    }
}

// --- Backend Interaction Functions ---

// start{code} “Tambah Tugas”
async function addTaskToBackend(taskData) {
  try {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(), // Kirim token dan tipe data JSON
      body: JSON.stringify(taskData) // Ubah data ke format JSON
    });

    const data = await response.json();

    if (response.ok) {
      displayMessage(messageDashboard, 'Tugas berhasil ditambahkan!', false);
      fetchTasks(); // Refresh daftar tugas
    } else {
      displayMessage(messageDashboard, data.message || 'Gagal menambahkan tugas.', true);
    }
  } catch (error) {
    console.error('Gagal menyimpan tugas:', error);
    displayMessage(messageDashboard, 'Terjadi kesalahan saat menyimpan.', true);
  }
}

function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    'Content-Type': 'application/json',
    ...(user?.token && { Authorization: `Bearer ${user.token}` })
  };
}


// Event listener tombol "Tambah Tugas"

document.getElementById('addBtn').addEventListener('click', () => {
  const title = document.getElementById('taskInput').value.trim();
  const deadline = document.getElementById('deadline').value;
  const priority = document.getElementById('priority').value;
  const isImportant = document.getElementById('isImportantCheckbox').checked;

  if (!title || !deadline || !priority) {
    alert('Harap isi semua kolom tugas!');
    return;
  }

  const taskData = {
    title,
    description: '',
    deadline,
    priority,
    isImportant,
    addedToMyDay: true,
    steps: []
  };

  addTaskToBackend(taskData); // Kirim ke server
});


// end{code} “Tambah Tugas”


async function fetchTasks() {
    try {
        const response = await fetch(`${BASE_URL}/tasks`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (response.ok) {
            displayTasks(data);
        } else {
            displayMessage(messageDashboard, data.message || 'Gagal memuat tugas.', true);
            if (todoList) todoList.innerHTML = '<p>Tidak ada tugas ditemukan atau terjadi kesalahan.</p>';
            if (doneList) doneList.innerHTML = '';
        }
    } catch (error) {
        displayMessage(messageDashboard, 'Terjadi kesalahan jaringan.', true);
        console.error('Error fetching tasks:', error);
    }
}

function displayTasks(tasks) {
    if (todoList) todoList.innerHTML = ''; // Clear existing
    if (doneList) doneList.innerHTML = ''; // Clear existing

    let firstTaskElement = null;

    tasks.forEach(task => {
        const element = createTaskElement(task); // Use the modified createTaskElement
        if (task.isCompleted) {
            if (doneList) doneList.appendChild(element);
        } else {
            if (todoList) todoList.appendChild(element);
            if (!firstTaskElement) {
                firstTaskElement = element;
            }
        }
    });

    updateTaskCounts();
    checkOverdueTasks();

    // Select the first non-completed task or the first completed task if no non-completed
    if (firstTaskElement) {
        selectTask(firstTaskElement, tasks.find(t => t._id === firstTaskElement.dataset.taskId));
    } else if (doneList && doneList.firstChild) {
        selectTask(doneList.firstChild, tasks.find(t => t._id === doneList.firstChild.dataset.taskId));
    } else {
        // No tasks, clear detail panel
        if (detailPanel) detailPanel.style.display = 'none';
    }
}

// `taskDataToUpdate` now explicitly contains all fields to be updated
async function editTask(id, taskDataToUpdate) {
    try {
        const response = await fetch(`${BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(taskDataToUpdate)
        });
        const data = await response.json();
        if (response.ok) {
            displayMessage(messageDashboard, 'Tugas diperbarui!', false);
            // After update, re-fetch tasks to refresh the UI
            fetchTasks();
        } else {
            displayMessage(messageDashboard, data.message || 'Gagal memperbarui tugas.', true);
        }
    } catch (error) {
        displayMessage(messageDashboard, 'Terjadi kesalahan jaringan.', true);
        console.error('Error updating task:', error);
    }
}

async function deleteTask(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
        return;
    }
    try {
        const response = await fetch(`${BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (response.ok) {
            displayMessage(messageDashboard, 'Tugas berhasil dihapus!', false);
            // Clear selected task if it was the one deleted
            if (selectedTaskData && selectedTaskData._id === id) {
                selectedTaskData = null;
                selectedTaskElement = null;
                if (detailPanel) detailPanel.style.display = 'none'; // Hide detail panel
            }
            fetchTasks(); // Muat ulang daftar tugas
        } else {
            displayMessage(messageDashboard, data.message || 'Gagal menghapus tugas.', true);
        }
    } catch (error) {
        displayMessage(messageDashboard, 'Terjadi kesalahan jaringan.', true);
        console.error('Error deleting task:', error);
    }
}

async function toggleTaskComplete(id, isCompleted) {
    try {
        const response = await fetch(`${BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ isCompleted: isCompleted })
        });
        const data = await response.json();
        if (response.ok) {
            displayMessage(messageDashboard, 'Status tugas diperbarui!', false);
            fetchTasks(); // Muat ulang daftar tugas untuk update UI
        } else {
            displayMessage(messageDashboard, data.message || 'Gagal memperbarui status tugas.', true);
        }
    } catch (error) {
        displayMessage(messageDashboard, 'Terjadi kesalahan jaringan.', true);
        console.error('Error toggling task completion:', error);
    }
}

// --- Logika Fitur Manajer ---
async function fetchUsers() {
    const user = getCurrentUser(); // Re-fetch user in case it changed
    if (!user || user.role !== 'manajer') return; // Hanya manajer yang boleh fetch ini
    try {
        const response = await fetch(`${BASE_URL}/tasks/users-list`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (response.ok) {
            displayUsers(data);
        } else {
            displayMessage(messageDashboard, data.message || 'Gagal memuat daftar pengguna.', true);
        }
    } catch (error) {
        displayMessage(messageDashboard, 'Terjadi kesalahan jaringan.', true);
        console.error('Error fetching users:', error);
    }
}

function displayUsers(users) {
    if (usersList) usersList.innerHTML = '';
    if (users.length === 0) {
        if (usersList) usersList.innerHTML = '<p>Tidak ada pengguna ditemukan.</p>';
        return;
    }
    users.forEach(emp => {
        const li = document.createElement('li');
        li.textContent = `${emp.name} (${emp.email}) - ${emp.jabatan || 'N/A'}`;
        if (emp.role === 'karyawan') {
            const viewTasksBtn = document.createElement('button');
            viewTasksBtn.textContent = 'Lihat Tugas';
            viewTasksBtn.dataset.userId = emp._id;
            viewTasksBtn.classList.add('view-tasks-btn');
            viewTasksBtn.addEventListener('click', (e) => fetchEmployeeTasks(e.target.dataset.userId, emp.name));
            li.appendChild(viewTasksBtn);
        }
        if (usersList) usersList.appendChild(li);
    });
}

async function fetchEmployeeTasks(userId, userName) {
    const user = getCurrentUser(); // Re-fetch user in case it changed
    if (!user || user.role !== 'manajer') return; // Hanya manajer yang boleh fetch ini
    try {
        const response = await fetch(`${BASE_URL}/tasks/user/${userId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (response.ok) {
            if (employeeNameSpan) employeeNameSpan.textContent = userName;
            displayEmployeeSpecificTasks(data); // `data` itself is the array of tasks from tasks.js route
            if (managerSection) managerSection.style.display = 'none'; // Sembunyikan daftar user
            if (employeeTasksView) employeeTasksView.style.display = 'block'; // Tampilkan tugas karyawan
        } else {
            displayMessage(messageDashboard, data.message || `Gagal memuat tugas untuk ${userName}.`, true);
        }
    } catch (error) {
        displayMessage(messageDashboard, 'Terjadi kesalahan jaringan.', true);
        console.error('Error fetching employee tasks:', error);
    }
}

function displayEmployeeSpecificTasks(tasks) {
    if (employeeTasksList) employeeTasksList.innerHTML = '';
    if (tasks.length === 0) {
        if (employeeTasksList) employeeTasksList.innerHTML = '<p>Tidak ada tugas untuk karyawan ini.</p>';
        return;
    }
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.isCompleted ? 'completed' : ''}`;
        li.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description || ''}</p>
            <p><strong>Prioritas:</strong> ${task.priority} | <strong>Batas Waktu:</strong> ${task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID') : 'N/A'}</p>
            ${task.isCompleted ? '<span style="color: green; font-weight: bold;">&#10004; Selesai</span>' : ''}
            <div class="task-steps-display">
                ${task.steps && task.steps.length > 0 ? '<h5>Langkah-langkah:</h5><ul>' + task.steps.map(step => `<li>${step.isCompleted ? '&#10004; ' : ''}${step.text}</li>`).join('') + '</ul>' : ''}
            </div>
        `;
        if (employeeTasksList) employeeTasksList.appendChild(li);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser(); // Get current user

    // --- Initial Dashboard View Logic ---
    if (user) {
        // Tampilkan atau sembunyikan bagian manajer
        if (user.role === 'manajer' && managerSection) {
            managerSection.style.display = 'block';
            fetchUsers(); // Muat daftar pengguna jika manajer
        } else if (managerSection) {
            managerSection.style.display = 'none';
        }
        fetchTasks(); // Muat tugas untuk user yang login
    } else {
        // Jika tidak ada user, redirect ke login
        window.location.href = 'login.html';
    }

    // Event listener for the "Jatuh tempo" option to open date picker
    if (detailDeadlineOption) {
        detailDeadlineOption.addEventListener('click', () => {
            if (detailDeadlineInput) {
                detailDeadlineInput.showPicker();
            }
        });
    }

    // Event listener for main task input field (to add new tasks quickly)
    if (taskInput) {
        taskInput.addEventListener("keypress", async (e) => {
            if (e.key === "Enter") {
                const title = taskInput.value.trim();
                if (title !== "") {
                    const taskData = {
                        title: title,
                        description: '', // No description on quick add
                        deadline: null, // No deadline on quick add
                        priority: 'Medium', // Default priority
                        isImportant: false,
                        addedToMyDay: true, // Default to added to My Day
                        steps: []
                    };
                    try {
                        const response = await fetch(`${BASE_URL}/tasks`, {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            body: JSON.stringify(taskData)
                        });
                        const data = await response.json();
                        if (response.ok) {
                            displayMessage(messageDashboard, 'Tugas baru berhasil dibuat!', false);
                            taskInput.value = "";
                            fetchTasks(); // Reload tasks to update list
                        } else {
                            displayMessage(messageDashboard, data.message || 'Gagal membuat tugas baru.', true);
                        }
                    } catch (error) {
                        displayMessage(messageDashboard, 'Terjadi kesalahan jaringan saat membuat tugas baru.', true);
                        console.error('Error adding task:', error);
                    }
                }
            }
        });
    }

    // Event listener for the "Update Task" button in detail panel
    if (detailUpdateTaskButton) {
        detailUpdateTaskButton.addEventListener('click', async () => {
            if (!selectedTaskData) {
                displayMessage(messageDashboard, 'Tidak ada tugas yang dipilih untuk diperbarui.', true);
                return;
            }

            const updatedTitle = detailTaskTitle ? detailTaskTitle.textContent.trim() : ''; // Get title from editable span
            const updatedDescription = detailNoteInput ? detailNoteInput.value : '';
            const updatedDeadline = detailDeadlineInput ? detailDeadlineInput.value : null;
            const updatedPriority = taskPrioritySelect ? taskPrioritySelect.value : 'Medium';
            const updatedIsImportant = taskIsImportantCheckbox ? taskIsImportantCheckbox.checked : false;
            const updatedAddedToMyDay = taskAddedToMyDayCheckbox ? taskAddedToMyDayCheckbox.checked : false;
            const updatedIsCompleted = detailTaskCheckbox ? detailTaskCheckbox.checked : false;

            const updatedSteps = taskStepsDiv ? Array.from(taskStepsDiv.querySelectorAll('.taskStepInput'))
                .map(input => ({ text: input.value, isCompleted: false })) // Assuming step completion is handled separately or not via this form
                .filter(step => step.text.trim() !== '') : [];

            const taskDataToUpdate = {
                title: updatedTitle,
                description: updatedDescription,
                deadline: updatedDeadline || null, // Send null if empty
                priority: updatedPriority,
                isImportant: updatedIsImportant,
                addedToMyDay: updatedAddedToMyDay,
                isCompleted: updatedIsCompleted,
                steps: updatedSteps
            };

            editTask(selectedTaskData._id, taskDataToUpdate);
        });
    }

    // Event listener for the detail panel checkbox (to mark task as complete/incomplete)
    if (detailTaskCheckbox) {
        detailTaskCheckbox.addEventListener('change', (e) => {
            if (selectedTaskData) {
                toggleTaskComplete(selectedTaskData._id, e.target.checked);
            }
        });
    }

    // Event listener for the trash icon in the detail panel
    if (detailDeleteButton) {
        detailDeleteButton.addEventListener('click', () => {
            if (selectedTaskData) {
                deleteTask(selectedTaskData._id);
            }
        });
    }

    // Event listener for adding a new step in the detail panel
    if (addStepButton) {
        addStepButton.addEventListener('click', () => {
            const stepCount = taskStepsDiv ? taskStepsDiv.querySelectorAll('.taskStepInput').length : 0;
            const newStepWrapper = document.createElement('div');
            newStepWrapper.classList.add('step-item-wrapper');

            const newStepInput = document.createElement('input');
            newStepInput.type = 'text';
            newStepInput.className = 'taskStepInput';
            newStepInput.placeholder = `Langkah ${stepCount + 1}`;
            newStepWrapper.appendChild(newStepInput);

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'X';
            removeBtn.classList.add('remove-step-btn');
            removeBtn.addEventListener('click', () => {
                newStepWrapper.remove();
            });
            newStepWrapper.appendChild(removeBtn);
            if (taskStepsDiv) taskStepsDiv.appendChild(newStepWrapper);
        });
    }

    // Sidebar Navigation (simplified - triggers fetchTasks for now)
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".sidebar-nav .nav-item").forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            // In a real app, this would load different task lists based on data-listType.
            // For now, simply refetch all tasks.
            fetchTasks();
            // If "Hari Saya" is selected, ensure the list is displayed
            if (item.dataset.listType === 'my-day') {
                if (todoList) todoList.style.display = 'block';
                if (doneList) doneList.style.display = 'none';
            } else {
                // For other lists, you might want to filter the fetched tasks
                if (todoList) todoList.style.display = 'block';
                if (doneList) doneList.style.display = 'none';
            }
        });
    });

    if (backToUsersListBtn) {
        backToUsersListBtn.addEventListener('click', () => {
            if (employeeTasksView) employeeTasksView.style.display = 'none'; // Sembunyikan tugas karyawan
            if (managerSection) managerSection.style.display = 'block'; // Tampilkan kembali daftar user
            fetchUsers(); // Muat ulang daftar user (opsional, jika ingin selalu terbaru)
        });
    }

// --- New Search Functionality ---
function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const allTasks = document.querySelectorAll("#todoList .task-item, #doneList .task-item");

    allTasks.forEach(task => {
        const taskText = task.dataset.taskText.toLowerCase();
        const isDone = task.classList.contains("done");

        let matchesSearch = taskText.includes(searchTerm);
        let showInTodoList = !isDone && matchesSearch;
        let showInDoneList = isDone && matchesSearch;

        // Determine which list is currently active (My Day vs Tasks)
        const myDayActive = document.querySelector(".sidebar-nav .nav-item[data-list-type='my-day']").classList.contains("active");
        const tasksActive = document.querySelector(".sidebar-nav .nav-item[data-list-type='tasks']").classList.contains("active");

        // Logic to display tasks based on active sidebar and search term
        if (searchTerm === '') {
            // If no search term, display based on original list logic
            if (myDayActive) {
                if (!isDone) {
                    todoList.appendChild(task);
                    task.style.display = '';
                } else {
                    task.style.display = 'none';
                }
            } else if (tasksActive) {
                // For 'Tasks' show both todo and done tasks
                if (!isDone) {
                    todoList.appendChild(task);
                } else {
                    doneList.appendChild(task);
                }
                task.style.display = '';
            } else {
                task.style.display = 'none'; // Hide for other lists if not applicable
            }
        } else {
            // If there's a search term, only show tasks that match the search
            if (matchesSearch) {
                if (!isDone) {
                    todoList.appendChild(task);
                } else {
                    doneList.appendChild(task);
                }
                task.style.display = '';
            } else {
                task.style.display = 'none';
            }
        }
    });

    // Re-append tasks to ensure correct order within filtered lists if needed
    // This is a simplified approach; a more robust solution might re-render from an array.
    const reorderedTodo = Array.from(todoList.children).sort((a, b) => a.dataset.taskText.localeCompare(b.dataset.taskText));
    reorderedTodo.forEach(task => todoList.appendChild(task));
    const reorderedDone = Array.from(doneList.children).sort((a, b) => a.dataset.taskText.localeCompare(b.dataset.taskText));
    reorderedDone.forEach(task => doneList.appendChild(task));

    updateTaskCounts(); // Update task counts based on visible tasks
}


searchInput.addEventListener("input", () => {
    filterTasks();
    if (searchInput.value.trim() !== "") {
        clearSearchBtn.style.display = "inline-block";
    } else {
        clearSearchBtn.style.display = "none";
    }
});

clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearSearchBtn.style.display = "none";
    filterTasks(); // Clear search and re-filter
});


    // Initial calls when DOM is ready
    displayUserName();
    updateDateDisplay();
    checkOverdueTasks(); // This function relies on tasks being loaded, which fetchTasks() handles.

    // Update time and check overdue tasks every minute
    setInterval(() => {
        updateDateDisplay();
        checkOverdueTasks();
    }, 60000);
});



// HEADER RIGHT SIDE

// DOM Elements untuk header
const headerProfileIcon = document.getElementById("headerProfileIcon");
const headerProfileName = document.getElementById("headerProfileName");
const userStatusSpan = document.getElementById("user-status");
const logoutButton = document.getElementById("logout-button");

// Fungsi untuk mendapatkan inisial dari nama
function getInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Fungsi untuk memperbarui tampilan profil di header
function updateHeaderProfile() {
    const user = getCurrentUser();

    // Perbarui ikon profil
    if (user && headerProfileIcon) {
        headerProfileIcon.textContent = getInitials(user.name);
    } else if (headerProfileIcon) {
        headerProfileIcon.textContent = "GU"; // Guest User
    }

    // Perbarui nama profil
    if (user && headerProfileName) {
        headerProfileName.textContent = user.name;
        headerProfileName.title = user.name;
    } else if (headerProfileName) {
        headerProfileName.textContent = "Guest";
        headerProfileName.title = "Guest User";
    }

    // Perbarui status pengguna
    if (userStatusSpan) {
        if (user && user.role) {
            userStatusSpan.textContent = '';
            userStatusSpan.classList.remove('offline');
            userStatusSpan.classList.add('online');
            userStatusSpan.title = `Status: Online (${user.role.charAt(0).toUpperCase() + user.role.slice(1)})`;
        } else {
            userStatusSpan.textContent = '';
            userStatusSpan.classList.add('offline');
            userStatusSpan.title = 'Status: Offline';
        }
    }
}

// Fungsi untuk menangani logout
function handleLogout() {
    localStorage.removeItem('user'); // Hapus data user dari localStorage
    window.location.href = 'login.html'; // Redirect ke halaman login
}

// Event listener saat DOM siap
document.addEventListener('DOMContentLoaded', () => {

    updateHeaderProfile();

    // Event listener untuk tombol logout
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    const profileArea = document.querySelector('.profile-area');
    if (profileArea) {
        profileArea.addEventListener('click', () => {
            // Contoh: Arahkan ke halaman profil user atau tampilkan dropdown menu
            console.log('Profil area diklik!');
            window.location.href = 'profile.html'; // Contoh: redirect ke halaman profil
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
  const addBtn = document.getElementById("addBtn");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.querySelector(".task-list");

  addBtn.addEventListener("click", function (e) {
    e.preventDefault(); // Jangan reload form

    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const taskItem = document.createElement("li");
    taskItem.className = "task-item";
    taskItem.textContent = taskText;

    taskList.appendChild(taskItem);
    taskInput.value = "";
  });
});


document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.querySelector(".menu-icon");
  const sidebar = document.getElementById("sidebar");

  menuBtn.addEventListener("click", function () {
    sidebar.classList.toggle("show"); // Ganti sidebar-hidden → show
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.querySelector(".menu-icon");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", function () {
      sidebar.classList.toggle("sidebar-hidden");
    });
  }
});

document.querySelectorAll('.task-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelector('.task-detail-panel').classList.add('open');
  });
});

document.querySelector('.detail-actions .material-icons:last-child').addEventListener('click', () => {
  document.querySelector('.task-detail-panel').classList.remove('open');
});

document.querySelectorAll('.task-item').forEach((item) => {
  item.addEventListener('click', () => {
    const title = item.dataset.title || item.querySelector('.task-title').textContent;
    const deadline = item.dataset.deadline || '';
    const desc = item.dataset.desc || '';

    // Tampilkan panel
    document.querySelector('.task-detail-panel').classList.add('open');

    // Isi detail
    document.querySelector('.task-title-detail').textContent = title;
    document.querySelector('.detail-header h3').textContent = title;
    document.querySelector('#detailDeadlineInput').value = deadline;
    document.querySelector('.note-input').value = desc;
  });
});






