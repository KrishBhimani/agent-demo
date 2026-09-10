const storageKey = "everyday-tasks";
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const clearCompleted = document.querySelector("#clear-completed");
const storageStatus = document.querySelector("#storage-status");

function showStorageWarning(message) {
  storageStatus.textContent = message;
  storageStatus.hidden = false;
}

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (
      !Array.isArray(savedTasks) ||
      !savedTasks.every(
        (task) =>
          task !== null &&
          typeof task === "object" &&
          typeof task.text === "string" &&
          task.text.trim().length > 0 &&
          task.text.length <= 200 &&
          typeof task.completed === "boolean",
      )
    ) {
      throw new Error("Invalid saved tasks");
    }
    return savedTasks;
  } catch {
    showStorageWarning("Saved tasks could not be loaded. You can still use this list.");
    return [];
  }
}

let tasks = loadTasks();

function saveTasks() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    storageStatus.hidden = true;
  } catch {
    showStorageWarning("Tasks cannot be saved in this browser. Keep this page open to retain your list.");
  }
}

function updateSummary() {
  const remaining = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;
  clearCompleted.disabled = !tasks.some((task) => task.completed);
  emptyState.hidden = tasks.length > 0;
}

function renderTasks() {
  taskList.replaceChildren();

  tasks.forEach((task, taskIndex) => {
    const taskItem = document.createElement("li");
    taskItem.className = "task-item";
    taskItem.classList.toggle("completed", task.completed);

    const taskLabel = document.createElement("label");
    taskLabel.className = "task-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      taskItem.classList.toggle("completed", task.completed);
      saveTasks();
      updateSummary();
    });

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;
    taskLabel.append(checkbox, taskText);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.addEventListener("click", () => {
      tasks.splice(taskIndex, 1);
      saveTasks();
      renderTasks();
      const nextTask = taskList.children[Math.min(taskIndex, tasks.length - 1)];
      (nextTask?.querySelector("button") ?? taskInput).focus();
    });

    taskItem.append(taskLabel, deleteButton);
    taskList.append(taskItem);
  });

  updateSummary();
}

taskInput.addEventListener("input", () => {
  taskInput.setCustomValidity("");
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.setCustomValidity("Please enter a task, not just spaces.");
    taskInput.reportValidity();
    return;
  }

  tasks.push({ text, completed: false });
  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
  taskInput.focus();
});

renderTasks();
