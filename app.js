const STORAGE_KEY = "today-three-todos";
const DAY_LIMIT = 3;

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todayList = document.getElementById("today-list");
const yesterdayList = document.getElementById("yesterday-list");
const todayGroupList = document.getElementById("today-group-list");
const tomorrowList = document.getElementById("tomorrow-list");
const limitMessage = document.getElementById("limit-message");
const weeklyProgress = document.getElementById("weekly-progress");
const weeklyLabel = document.getElementById("weekly-label");

function toDateKey(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function shiftDate(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function readTodos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function writeTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  const todos = readTodos();
  const todayKey = toDateKey(new Date());
  const todayCount = todos.filter((t) => t.dateKey === todayKey).length;

  if (todayCount >= DAY_LIMIT) {
    limitMessage.textContent = "오늘은 최대 3개까지 등록할 수 있어요.";
    return;
  }

  todos.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
    dateKey: todayKey,
    createdAt: new Date().toISOString(),
  });

  writeTodos(todos);
  input.value = "";
  limitMessage.textContent = "";
  render();
}

function toggleTodo(id) {
  const todos = readTodos().map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  writeTodos(todos);
  render();
}

function deleteTodo(id) {
  const todos = readTodos().filter((t) => t.id !== id);
  writeTodos(todos);
  render();
}

function renderList(el, items, withActions = false) {
  el.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "hint";
    li.textContent = "비어 있음";
    el.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const text = document.createElement("span");
    text.className = `todo-text ${item.completed ? "done" : ""}`;
    text.textContent = item.text;
    li.appendChild(text);

    if (withActions) {
      const row = document.createElement("div");
      row.className = "row";

      const doneBtn = document.createElement("button");
      doneBtn.className = "ghost";
      doneBtn.textContent = item.completed ? "취소" : "완료";
      doneBtn.addEventListener("click", () => toggleTodo(item.id));

      const delBtn = document.createElement("button");
      delBtn.textContent = "삭제";
      delBtn.addEventListener("click", () => deleteTodo(item.id));

      row.append(doneBtn, delBtn);
      li.appendChild(row);
    }

    el.appendChild(li);
  });
}

function renderWeeklyProgress(todos) {
  const today = new Date();
  const start = shiftDate(today, -6);
  const dayKeys = Array.from({ length: 7 }, (_, idx) => toDateKey(shiftDate(start, idx)));
  const weekTodos = todos.filter((t) => dayKeys.includes(t.dateKey));

  const completed = weekTodos.filter((t) => t.completed).length;
  const percentage = weekTodos.length === 0 ? 0 : Math.round((completed / weekTodos.length) * 100);

  weeklyProgress.style.width = `${percentage}%`;
  weeklyLabel.textContent = `${percentage}% (${completed}/${weekTodos.length || 0})`;
}

function render() {
  const todos = readTodos();
  const now = new Date();
  const today = toDateKey(now);
  const yesterday = toDateKey(shiftDate(now, -1));
  const tomorrow = toDateKey(shiftDate(now, 1));

  const todayTodos = todos.filter((t) => t.dateKey === today);
  const yesterdayTodos = todos.filter((t) => t.dateKey === yesterday);
  const tomorrowTodos = todos.filter((t) => t.dateKey === tomorrow);

  renderList(todayList, todayTodos, true);
  renderList(yesterdayList, yesterdayTodos);
  renderList(todayGroupList, todayTodos);
  renderList(tomorrowList, tomorrowTodos);

  limitMessage.textContent = `${todayTodos.length}/${DAY_LIMIT} 사용 중`;
  renderWeeklyProgress(todos);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) {
    return;
  }
  addTodo(text);
});

render();
