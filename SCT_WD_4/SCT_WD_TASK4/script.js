// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const taskCategory = document.getElementById('task-category');
const taskPriority = document.getElementById('task-priority');
const taskList = document.getElementById('task-list');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const tabButtons = document.querySelectorAll('.tab-btn');
const categoryButtons = document.querySelectorAll('.category-btn');
const themeButtons = document.querySelectorAll('.theme-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editInput = document.getElementById('edit-input');
const editDate = document.getElementById('edit-date');
const editCategory = document.getElementById('edit-category');
const editPriority = document.getElementById('edit-priority');
const closeModal = document.querySelector('.close-modal');

// App Data
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentCategory = 'all';
let currentEditId = null;

// Initialize the app
function init() {
    renderTasks();
    loadTheme();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Save theme to localStorage
function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;
}

// Add a new task
function addTask(text, dueDate = '', category = 'personal', priority = 'medium') {
    const newTask = {
        id: Date.now().toString(),
        text,
        completed: false,
        dueDate,
        category,
        priority
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Toggle task completion
function toggleTaskCompletion(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task,
                completed: !task.completed
            };
        }
        return task;
    });

    saveTasks();
    renderTasks();
}

// Edit a task
function editTask(id, newText, newDate, newCategory, newPriority) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                text: newText,
                dueDate: newDate,
                category: newCategory,
                priority: newPriority
            };
        }
        return task;
    });

    saveTasks();
    renderTasks();
}

// Clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// Filter tasks based on current filter and category
function getFilteredTasks() {
    let filtered = tasks;

    // First filter by completion status
    switch (currentFilter) {
        case 'active':
            filtered = filtered.filter(task => !task.completed);
            break;
        case 'completed':
            filtered = filtered.filter(task => task.completed);
            break;
    }

    // Then filter by category if not "all"
    if (currentCategory !== 'all') {
        filtered = filtered.filter(task => task.category === currentCategory);
    }

    return filtered;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
        return `Today at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }

    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }

    // Otherwise return formatted date
    return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Create task item HTML
function createTaskItemHTML(task) {
    const categoryClass = task.category || 'other';
    const priorityClass = task.priority || 'medium';

    return `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="task-content">
                <div class="task-text">${task.text}</div>
                <div class="task-meta">
                    <span class="task-category ${categoryClass}">${categoryClass}</span>
                    <span class="task-priority ${priorityClass}">${priorityClass}</span>
                </div>
                ${task.dueDate ? `<div class="task-time">${formatDate(task.dueDate)}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="edit-btn" data-id="${task.id}"><i class="fas fa-pencil-alt"></i></button>
                <button class="delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i></button>
            </div>
        </li>
    `;
}

// Render tasks to the DOM
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    taskList.innerHTML = filteredTasks.map(task => createTaskItemHTML(task)).join('');

    // Update tasks counter
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;

    // Add event listeners to task items
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            toggleTaskCompletion(this.dataset.id);
        });
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            openEditModal(this.dataset.id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            deleteTask(this.dataset.id);
        });
    });
}

// Open the edit modal
function openEditModal(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    currentEditId = id;
    editInput.value = task.text;
    editDate.value = task.dueDate ? task.dueDate : '';
    editCategory.value = task.category || 'personal';
    editPriority.value = task.priority || 'medium';

    editModal.style.display = 'flex';
}

// Close the edit modal
function closeEditModal() {
    editModal.style.display = 'none';
    currentEditId = null;
}

// Event Listeners
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    const date = taskDate.value;
    const category = taskCategory.value;
    const priority = taskPriority.value;

    if (text) {
        addTask(text, date, category, priority);
        taskInput.value = '';
        taskDate.value = '';
    }
});

editForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (currentEditId) {
        const newText = editInput.value.trim();
        const newDate = editDate.value;
        const newCategory = editCategory.value;
        const newPriority = editPriority.value;

        if (newText) {
            editTask(currentEditId, newText, newDate, newCategory, newPriority);
            closeEditModal();
        }
    }
});

closeModal.addEventListener('click', closeEditModal);
window.addEventListener('click', function(e) {
    if (e.target === editModal) {
        closeEditModal();
    }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.list;
        renderTasks();
    });
});

categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.category;
        renderTasks();
    });
});

themeButtons.forEach(button => {
    button.addEventListener('click', function() {
        const theme = `${this.dataset.theme}-theme`;
        document.body.className = theme;
        saveTheme(theme);
    });
});

// Initialize the app
init();