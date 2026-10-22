// ============================================================
// db.js —— 数据库层
//
// 这一层只做一件事：和 SQLite 打交道。
// 它不知道 HTTP、不知道前端页面，所以以后想换数据库，
// 改动范围基本只在这个文件里 —— 这就是"分层"的意义。
// ============================================================

// node:sqlite 是 Node 22.5 才内置的模块。老版本 Node 上会直接抛错，
// 这里提前判断一下，给出人话提示——别人拿到你的项目跑不起来时最需要的东西。
let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch {
  console.error(
    `\n❌ 需要 Node.js 22.5 或更高版本，当前是 ${process.version}。\n` +
    `   请到 https://nodejs.org 安装新版 Node 后再运行 npm start。\n`
  );
  process.exit(1);
}

const fs = require('node:fs');
const path = require('node:path');

// 数据文件放在 data/todo.db，第一次运行时自动创建
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'todo.db'));

// 建表：IF NOT EXISTS 保证重复运行不会报错
// SQLite 没有真正的布尔类型，所以 done 用 0/1 存
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    done       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

// 把数据库里的 0/1 转成 true/false，让 API 返回的数据更干净
const toTodo = (row) => (row ? { ...row, done: row.done === 1 } : null);

// ---------- 下面 6 个函数是给 server.js 用的 ----------

function listTodos(filter = 'all') {
  const where =
    filter === 'active' ? 'WHERE done = 0' :
    filter === 'done'   ? 'WHERE done = 1' : '';

  // 未完成的排前面，同组内新添加的排前面
  return db
    .prepare(`SELECT * FROM todos ${where} ORDER BY done ASC, id DESC`)
    .all()
    .map(toTodo);
}

function getTodo(id) {
  return toTodo(db.prepare('SELECT * FROM todos WHERE id = ?').get(id));
}

function createTodo(title) {
  // run() 返回 { changes, lastInsertRowid }
  // 注意：lastInsertRowid 可能是 bigint，所以要 Number() 一下
  const { lastInsertRowid } = db.prepare('INSERT INTO todos (title) VALUES (?)').run(title);
  return getTodo(Number(lastInsertRowid));
}

function updateTodo(id, patch) {
  const sets = [];
  const values = [];

  if (patch.title !== undefined) { sets.push('title = ?'); values.push(patch.title); }
  if (patch.done !== undefined) { sets.push('done = ?'); values.push(patch.done ? 1 : 0); }

  if (sets.length > 0) {
    db.prepare(`UPDATE todos SET ${sets.join(', ')} WHERE id = ?`).run(...values, id);
  }
  return getTodo(id); // 不存在时返回 null
}

function deleteTodo(id) {
  return db.prepare('DELETE FROM todos WHERE id = ?').run(id).changes > 0;
}

function deleteCompleted() {
  // changes = 实际删掉了几条
  return db.prepare('DELETE FROM todos WHERE done = 1').run().changes;
}

module.exports = {
  listTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  deleteCompleted,
};
