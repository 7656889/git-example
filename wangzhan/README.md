<div align="center">

# Loss 下降中 · 个人主页

**一个还在收敛的人，一条正在下降的曲线。**

人工智能专业在读 · 正在学习 Git 协作流程与 Agent 辅助开发

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-4ee1c1?style=flat-square)

</div>

---

## 这是什么

一个纯静态的个人主页，用来把我的自我介绍变成「真正上线的东西」。

它同时是我的 Git 练习场：从写代码、验证、初始化仓库，到提交、上传、开启 Pages，全程自己走一遍。

## 效果与功能

| 模块 | 说明 |
|---|---|
| **Hero** | 渐变流光标题 + 打字机效果 + 状态徽章 + 伪终端逐行输出 |
| **数据条** | 滚动到视口时数字从 0 递增 |
| **背景** | Canvas 粒子网络，光点缓慢下沉（呼应「loss 下降」），随鼠标被牵引 |
| **关于** | 自我介绍正文 + `profile.json` 玻璃拟态代码卡 |
| **技能** | 6 项技能，诚实标注进度，进度条进入视口后动画填充 |
| **路线** | 五阶段学习时间线，已完成 / 进行中 / 待解锁三态 |
| **日志** | 学习过程中踩过的坑，按 learn / fix / agent / build 分类 |
| **联系** | GitHub、邮箱，以及一条协作原则 |

**设计要点**

- 深空暗色主题 + 青/蓝/紫三色渐变强调
- 玻璃拟态卡片（`backdrop-filter`）+ 细颗粒噪点提升质感
- 滚动进度条、导航滚动后毛玻璃、移动端抽屉菜单
- 全站滚动揭示动效，卡片跟随鼠标微倾斜
- 完整响应式，适配到 420px 以下
- 尊重 `prefers-reduced-motion`，深色滚动条、键盘焦点环

## 健壮性：内容永远不会被动画藏起来

滚动揭示动效有个经典陷阱：**元素初始 `opacity: 0`，依赖 JS 加类才显示。一旦 JS 报错、被禁用或加载失败，整页就变成空白。**

这个项目用四层保险避免这件事：

| 层 | 机制 | 位置 |
|---|---|---|
| 1 | `IntersectionObserver` 正常触发 | `main.js` `initReveal()` |
| 2 | 无 `IntersectionObserver` 时直接全部显示 | `main.js` `initReveal()` 开头 |
| 3 | 每个元素独立超时兜底，到点强制显示 | `main.js` `initReveal()` 末尾 |
| 4 | 启动末尾全局兜底，仍有隐藏元素就全开 | `main.js` `boot()` 末尾 |

另外还有两层 CSS / HTML 层的保护：

- `<html class="no-js">` + 内联脚本**尽早**移除 `no-js`；脚本挂了就保留该类，`.no-js .reveal { opacity: 1 }` 让内容全部可见
- 渐变文字用 `@supports` 包裹：不支持 `background-clip: text` 的环境自动回退成纯色，不会变成隐形字

还有一个容易踩的坑：**观察器的 `threshold` 不要用比例值。** 像 `threshold: 0.5` 这种写法，对于高度超过视口的元素（比如长卡片）可能永远达不到 50%，结果就是永远不显示。本项目统一用 `threshold: 0` + `rootMargin` 控制节奏。

「动画可以失败，内容看不见不可以」—— 记住这条，能省掉很多深夜排查。

## 技术栈

**零依赖，零构建。** 只有三个文件：

```
index.html    结构
style.css     样式（设计变量集中在 :root）
main.js       交互（配置集中在顶部 SITE 对象）
```

不用框架、不用打包器、不装 npm 包。打开就能跑，改完刷新就见效 —— 对刚学 Git 的人最友好。

## 本地预览

直接双击 `index.html` 即可。

如果想用本地服务器（更接近线上环境）：

```bash
# Python 3
python -m http.server 8000

# 或 Node
npx serve .
```

然后访问 <http://localhost:8000>

## 上传到 GitHub

### 第 1 步：初始化仓库

在项目目录下打开终端：

```bash
git init
git add .
git commit -m "feat: 个人主页首次提交"
```

### 第 2 步：在 GitHub 上建仓库

打开 <https://github.com/new>：

- **Repository name** 填 `loss-descent`（或你喜欢的名字）
- 可见性选 **Public**（Pages 免费版需要公开仓库）
- **不要**勾选 "Add a README file"，因为本地已经有了

### 第 3 步：关联并推送

把下面的 `你的用户名` 换成你的 GitHub 用户名：

```bash
git branch -M main
git remote add origin https://github.com/你的用户名/loss-descent.git
git push -u origin main
```

第一次推送会弹出浏览器要求登录授权，按提示走完即可。

### 第 4 步：开启 GitHub Pages

1. 进入仓库页面 → **Settings**
2. 左侧找到 **Pages**
3. **Source** 选 `Deploy from a branch`
4. **Branch** 选 `main`，目录选 `/ (root)`
5. 点 **Save**

等 1–2 分钟，访问：

```
https://你的用户名.github.io/loss-descent/
```

## 上传前记得改这里

打开 `main.js`，最上面的配置区：

```js
const SITE = {
  name: "Loss 下降中",                          // 主页显示的名字
  githubUser: "your-github-username",           // ← 改成你的 GitHub 用户名
  email: "huangtianhao2026@stu.gdou.edu.cn",    // ← 改成你的邮箱
};
```

改完 `githubUser`，「GitHub」那张卡片的链接才会指向你自己的主页。

## 目录结构

```
loss-descent/
├── index.html      页面结构
├── style.css       样式
├── main.js         交互与配置
├── README.md       本文件
├── LICENSE         MIT
└── .gitignore      忽略规则
```

## 想继续改的话

| 想改什么 | 去哪里 |
|---|---|
| 名字、GitHub、邮箱 | `main.js` 顶部的 `SITE` |
| 配色 | `style.css` 的 `:root` 变量（`--accent*`） |
| 自我介绍正文 | `index.html` 里 `id="about"` 那一段 |
| 技能与进度 | `index.html` 里的 `.skill`，改 `data-level` 和文字 |
| 学习路线 | `index.html` 里的 `.timeline__item` |
| 学习日志 | `index.html` 里的 `.log` 卡片 |
| 终端演示内容 | `main.js` 里的 `TERMINAL_LINES` |

## 学习记录

这个项目本身就是日志的一部分。踩过的坑：

- **第一次 `push` 被拒绝** —— 远端比我新，要先 `pull` 再推
- **`commit` 后才发现改错文件** —— `git status` / `git diff` 要在提交**之前**看
- **Agent 写得快但不能不看** —— 看不懂的地方就去查、去问、去记
- **动画把内容藏没了** —— 滚动揭示的 `opacity: 0` 差点让整页空白，于是加了上面那四层保险

## License

[MIT](LICENSE) © 2026 Loss 下降中

<div align="center">

**还不准，但每一步都在变小。**

</div>