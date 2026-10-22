# 待办清单 · 全栈入门项目

一个**不依赖任何前端框架**的全栈小项目，用来把「浏览器 → HTTP 接口 → 数据库」这条链路完整走一遍。

技术栈：**HTML / CSS / 原生 JS + Node.js + Express + SQLite**

---

## 一、怎么跑起来

> **环境要求：Node.js 22.5 或更高版本**（推荐 24）。
> 项目用的是 Node 内置的 `node:sqlite`，版本不够会直接提示你升级，而不是报一堆看不懂的错。

```bash
cd todo-app        # 进入项目目录
npm install        # 只有一个依赖：express
npm start          # 启动服务
```

然后浏览器打开 <http://localhost:3000>

> **Windows 用户不想敲命令？** 直接双击项目根目录的 **`start.bat`**。
> 它会自动检查 Node 版本、安装依赖、启动服务，并自动打开浏览器；关掉黑色窗口就是停止服务。
> 第一次运行要等一两分钟装依赖，之后就很快了。

> **注意：不要直接双击 `public/index.html`**。那样浏览器只会打开一个没有样式、也没有数据的空壳，
> 因为页面引用的 `/style.css`、`/app.js` 和接口 `/api/todos` 都由 Node 服务提供。必须先启动服务。

开发时想改代码自动重启，用：

```bash
npm run dev        # node --watch server.js
```

数据存在 `data/todo.db`，想清空就删掉这个文件，下次启动会自动重建。

> **小提示**：本项目使用 Node 24 内置的 `node:sqlite`，所以不用安装 `better-sqlite3`
> 之类的原生模块。你在网上搜到的教程多用 `better-sqlite3`，用法几乎一样
> （`prepare` / `run` / `get` / `all`），理解其中一个就能看懂另一个。

---

## 二、目录结构

```
todo-app/
├── package.json        项目说明 + 依赖 + 启动命令
├── server.js           ★ 后端入口：定义 5 个接口
├── db.js               ★ 数据库层：建表 + 6 个操作函数
├── data/todo.db        SQLite 数据文件（自动生成，已在 .gitignore 里）
└── public/             前端，浏览器直接访问的静态文件
    ├── index.html      页面结构
    ├── style.css       样式（只用原生 CSS + CSS 变量）
    └── app.js          ★ 前端逻辑：调接口 + 渲染
```

**分层是重点**：

| 层 | 文件 | 只负责 |
|---|---|---|
| 数据库 | `db.js` | SQL 语句，不知道 HTTP |
| 后端 | `server.js` | 接请求、校验参数、返回 JSON |
| 前端 | `public/app.js` | 发请求、改页面 |

`server.js` 不直接写 SQL，`db.js` 不关心 URL，`app.js` 完全不知道数据库在哪 —— 这就是分层。

---

## 三、接口一览

| 方法 | 路径 | 说明 | 请求体 |
|---|---|---|---|
| GET | `/api/todos?filter=all\|active\|done` | 查询列表 | — |
| POST | `/api/todos` | 新增 | `{"title": "买牛奶"}` |
| PATCH | `/api/todos/:id` | 修改标题或完成状态 | `{"done": true}` 或 `{"title": "新标题"}` |
| DELETE | `/api/todos/:id` | 删除一条 | — |
| DELETE | `/api/todos/completed` | 清除所有已完成 | — |

用命令行测试接口（不用打开浏览器）：

```bash
curl http://localhost:3000/api/todos
curl -X POST http://localhost:3000/api/todos -H "Content-Type: application/json" -d "{\"title\":\"买牛奶\"}"
curl -X PATCH http://localhost:3000/api/todos/1 -H "Content-Type: application/json" -d "{\"done\":true}"
curl -X DELETE http://localhost:3000/api/todos/1
```

> Windows PowerShell 里 `curl` 是 `Invoke-WebRequest` 的别名，
> 想用上面这种写法请敲 `curl.exe`。

---

## 四、建议的学习顺序

不要一上来通读代码，按这个顺序看，边看边改：

1. **先跑起来**，在页面上增删改查，感受功能。
2. 打开浏览器 F12 → **Network（网络）** 面板，每点一次按钮看它发了什么请求、返回了什么。
3. 读 `db.js`：只有十几行 SQL，弄清楚一张表怎么建、怎么增删改。
4. 读 `server.js`：对照第 2 步看到的请求，找到对应的路由。
5. 读 `public/app.js`：看它是怎么用 `fetch` 发请求、怎么把数据变成 DOM 的。

### 五个练手小改动（由易到难）

1. **改配色**：`public/style.css` 最上面的 `:root` 变量，改 `--accent` 换个主题色。
2. **加"截止日期"字段**：`db.js` 建表加一列 → `server.js` 的 POST 接收它 → `app.js` 加个 `input type="date"`。
   这一步会逼你把整条链路改一遍，收获最大。
3. **加"按创建时间排序 / 按标题排序"**：改 `db.js` 里的 `ORDER BY`。
4. **加搜索框**：`app.js` 把输入带到查询参数里 → `server.js` 读 `req.query.q` → `db.js` 用 `WHERE title LIKE ?`。
5. **加用户登录**：这是从"练习"迈向"真实系统"的门槛，适合放到最后，用 Express session 或 Supabase。

---

## 五、常见问题

**Q：`npm start` 报 `EADDRINUSE: address already in use :::3000`**
端口被占了（可能上次的进程没关）。改端口：`$env:PORT=3001; npm start`，或把占用进程关掉。

**Q：改了页面没变化**
静态文件有缓存，`Ctrl + F5` 强制刷新。改了 `server.js` 需要重启（或用 `npm run dev`）。

**Q：`data/todo.db` 要不要提交到 Git？**
不要，已经在 `.gitignore` 里了。数据库是运行产物，不是源码。

**Q：为什么不用 React / Vue？**
现在用不上。框架解决的是"页面复杂时如何组织代码"的问题，这个项目只有一屏，
用原生 JS 能把"数据和界面如何对应"看得更清楚。等你能熟练写增删改查了，再上框架会顺畅很多。
