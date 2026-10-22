// ============================================================
// app.js —— 前端逻辑
//
// 职责只有两件事：
//   ① 调用后端 API 拿数据 / 改数据
//   ② 根据数据重新渲染页面
// 它不碰数据库，也不需要知道数据存在哪里。
// ============================================================

const $ = (selector) => document.querySelector(selector);

// ---------- 1. 把接口封装成函数 ----------

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // 后端约定出错时返回 { error: "原因" }
    throw new Error((data && data.error) || `请求失败（${res.status}）`);
  }
  return data;
}

const api = {
  list: (filter) => request(`/api/todos?filter=${filter}`),

  create: (title) =>
    request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    }),

  update: (id, patch) =>
    request(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }),

  remove: (id) => request(`/api/todos/${id}`, { method: 'DELETE' }),

  clearDone: () => request('/api/todos/completed', { method: 'DELETE' }),
};

// ---------- 2. 界面状态 ----------

let currentFilter = 'all';

// ---------- 3. 渲染：拿数据 -> 清空 -> 重建 ----------

async function render() {
  const todos = await api.list(currentFilter);

  const list = $('#list');
  list.innerHTML = '';

  for (const todo of todos) {
    list.appendChild(createItem(todo));
  }

  $('#empty').hidden = todos.length > 0;

  // 统计需要"全部"的数据，切到筛选页时再单独请求一次
  const all = currentFilter === 'all' ? todos : await api.list('all');
  const left = all.filter((t) => !t.done).length;
  $('#count').textContent = `共 ${all.length} 条 · 未完成 ${left} 条`;
}

// 用 DOM API 一个个创建元素，而不是拼 innerHTML 字符串。
// 好处：标题里的 < > & 之类的字符会被当成普通文字，天然避免 XSS。
function createItem(todo) {
  const li = document.createElement('li');
  li.className = 'item' + (todo.done ? ' is-done' : '');
  li.dataset.id = todo.id;

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'item__check';
  check.checked = todo.done;
  check.dataset.action = 'toggle';

  const title = document.createElement('span');
  title.className = 'item__title';
  title.textContent = todo.title;
  title.dataset.action = 'edit';
  title.title = '双击可以修改';

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'item__del';
  del.textContent = '×';
  del.title = '删除';
  del.dataset.action = 'remove';

  li.append(check, title, del);
  return li;
}

// ---------- 4. 点击列表：勾选 / 删除 ----------
// 事件委托：只在 <ul> 上挂一个监听器，靠 dataset.action 区分点了什么，
// 这样后续新增的条目自动生效，不用逐条绑定。

$('#list').addEventListener('click', async (event) => {
  const action = event.target.dataset.action;
  const li = event.target.closest('.item');
  if (!action || !li) return;

  // 单击标题不需要请求后端：双击时浏览器会先发两次 click，
  // 如果这里也去 render()，就会把刚打开的编辑框冲掉。所以直接返回。
  if (action !== 'remove' && action !== 'toggle') return;

  const id = Number(li.dataset.id);

  try {
    if (action === 'remove') await api.remove(id);
    if (action === 'toggle') await api.update(id, { done: event.target.checked });
  } catch (err) {
    // 请求失败也要提示，但下面照常 render()，把界面恢复成数据库里的真实状态
    toast(err.message);
  }

  await render();
});

// ---------- 5. 双击标题：行内编辑 ----------

$('#list').addEventListener('dblclick', (event) => {
  if (event.target.dataset.action === 'edit') {
    startEdit(event.target);
  }
});

function startEdit(span) {
  const li = span.closest('.item');
  const id = Number(li.dataset.id);
  const oldText = span.textContent;

  const input = document.createElement('input');
  input.className = 'item__edit';
  input.value = oldText;
  input.maxLength = 200;

  span.replaceWith(input);
  input.focus();
  input.select();

  let finished = false;

  const finish = async (save) => {
    if (finished) return;
    finished = true;

    const value = input.value.trim();
    try {
      if (save && value && value !== oldText) {
        await api.update(id, { title: value });
      }
    } catch (err) {
      toast(err.message);
    }
    await render(); // 不管保存与否，都把界面恢复成正常状态
  };

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') finish(true);
    if (event.key === 'Escape') finish(false);
  });
  input.addEventListener('blur', () => finish(true));
}

// ---------- 6. 添加 ----------

$('#add-form').addEventListener('submit', async (event) => {
  event.preventDefault(); // 阻止表单默认的"刷新页面"行为

  const input = $('#add-input');
  const title = input.value.trim();
  if (!title) return;

  try {
    await api.create(title);
    input.value = '';
    input.focus();

    // 在"已完成"筛选下新加的条目会看不见，自动切回全部
    if (currentFilter === 'done') {
      currentFilter = 'all';
      syncFilters();
    }
  } catch (err) {
    toast(err.message);
  }

  await render();
});

// ---------- 7. 筛选切换 ----------

$('#filters').addEventListener('click', async (event) => {
  const button = event.target.closest('.filter');
  if (!button) return;

  currentFilter = button.dataset.filter;
  syncFilters();
  await render();
});

function syncFilters() {
  for (const button of document.querySelectorAll('.filter')) {
    button.classList.toggle('is-active', button.dataset.filter === currentFilter);
  }
}

// ---------- 8. 清除已完成 ----------

$('#clear-done').addEventListener('click', async () => {
  try {
    const { deleted } = await api.clearDone();
    if (deleted === 0) toast('没有已完成的项目');
  } catch (err) {
    toast(err.message);
  }
  await render();
});

// ---------- 9. 轻提示 ----------

let toastTimer;

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 2600);
}

// ---------- 10. 启动 ----------

render().catch((err) => toast(err.message));
