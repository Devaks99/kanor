const STORAGE_KEY = 'kanban_tasks_v2';

const form = document.getElementById('taskForm');
const lists = document.querySelectorAll('.task-list');

let tasks = load();

/* ---------- STORAGE ---------- */
function load() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* ---------- REGRAS ---------- */
function statusToColumn(status) {
  if (status === 'nao') return 'alta';
  if (status === 'em') return 'andamento';
  if (status === 'concluido') return 'sobdemanda';
}

/* ---------- CRUD ---------- */
function createTask(data) {
  tasks.push({
    id: crypto.randomUUID(),
    ...data,
    column: statusToColumn(data.status)
  });
  save();
  render();
}

function updateStatus(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.status = newStatus;
  task.column = statusToColumn(newStatus);

  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

/* ---------- RENDER ---------- */
function render() {
  lists.forEach(l => (l.innerHTML = ''));

  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = `task ${task.status === 'concluido' ? 'concluido' : ''}`;

    card.innerHTML = `
      <strong>${task.title}</strong>
      <p>${task.description || ''}</p>

      <div class="tags">
        ${task.tags.map(t => `<span class="tag-${t}">${t}</span>`).join('')}
      </div>

      <select class="status-select">
        <option value="nao" ${task.status === 'nao' ? 'selected' : ''}>
          Não iniciado
        </option>
        <option value="em" ${task.status === 'em' ? 'selected' : ''}>
          Em andamento
        </option>
        <option value="concluido" ${task.status === 'concluido' ? 'selected' : ''}>
          Concluído
        </option>
      </select>

      <button class="delete-btn" style="margin-top:8px;">🗑 Excluir</button>
    `;

    /* STATUS CHANGE */
    card.querySelector('.status-select').addEventListener('change', e => {
      updateStatus(task.id, e.target.value);
    });

    /* DELETE */
    card.querySelector('.delete-btn').addEventListener('click', () => {
      deleteTask(task.id);
    });

    document
      .querySelector(`[data-column="${task.column}"] .task-list`)
      .appendChild(card);
  });
}

/* ---------- FORM ---------- */
form.addEventListener('submit', e => {
  e.preventDefault();

  const data = {
    title: form.title.value,
    description: form.description.value,
    status: form.status.value,
    tags: [...form.querySelectorAll('.tags input:checked')].map(i => i.value)
  };

  createTask(data);
  form.reset();
});

render();
