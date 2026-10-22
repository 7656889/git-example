// ============================================================
// server.js —— 后端入口
//
// 一个最小的 REST API + 静态文件服务。
// 启动：npm start     然后浏览器打开 http://localhost:3000
// ============================================================

const path = require('node:path');
const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- 中间件：每个请求进来都会先经过这里 ----------
app.use(express.json());                                  // 把请求体里的 JSON 解析成 req.body
app.use(express.static(path.join(__dirname, 'public')));  // 把 public/ 当成网站根目录

// ---------- 路由：由"方法 + 路径"决定执行哪段代码 ----------

// 1) 查询列表   GET /api/todos?filter=all|active|done
app.get('/api/todos', (req, res) => {
  const filter = ['all', 'active', 'done'].includes(req.query.filter)
    ? req.query.filter
    : 'all';
  res.json(db.listTodos(filter));
});

// 2) 新增       POST /api/todos   请求体 {"title": "买牛奶"}
app.post('/api/todos', (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) return res.status(400).json({ error: '标题不能为空' });
  if (title.length > 200) return res.status(400).json({ error: '标题最多 200 个字' });
  res.status(201).json(db.createTodo(title)); // 201 = 已创建
});

// 3) 清除已完成  DELETE /api/todos/completed
//    必须写在 /:id 之前，否则 "completed" 会被当作 id 匹配走
app.delete('/api/todos/completed', (req, res) => {
  res.json({ deleted: db.deleteCompleted() });
});

// 4) 修改       PATCH /api/todos/3   请求体 {"done": true} 或 {"title": "新标题"}
app.patch('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id 不合法' });

  const patch = {};
  if (typeof req.body?.title === 'string') {
    const title = req.body.title.trim();
    if (!title) return res.status(400).json({ error: '标题不能为空' });
    patch.title = title;
  }
  if (typeof req.body?.done === 'boolean') patch.done = req.body.done;

  const todo = db.updateTodo(id, patch);
  if (!todo) return res.status(404).json({ error: '这条待办不存在' });
  res.json(todo);
});

// 5) 删除       DELETE /api/todos/3
app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id 不合法' });
  if (!db.deleteTodo(id)) return res.status(404).json({ error: '这条待办不存在' });
  res.json({ ok: true });
});

// ---------- 兜底处理 ----------
// 走到这里的 /api 请求说明没有匹配到任何路由
app.use('/api', (req, res) => res.status(404).json({ error: '接口不存在' }));

// 错误处理中间件：注意必须是 4 个参数，Express 靠参数个数识别它
app.use((err, req, res, next) => {
  // 请求体不是合法 JSON 时 express.json() 会抛错，这属于"客户端传错了"
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: '请求体不是合法的 JSON' });
  }
  console.error(err);
  res.status(500).json({ error: '服务器出错了' });
});

app.listen(PORT, () => {
  console.log(`✅ 待办清单已启动：http://localhost:${PORT}`);
});
