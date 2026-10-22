@echo off
cd /d "%~dp0"
title 待办清单 - 本地启动

echo.
echo  ==========================================
echo    待办清单 Todo App  -  本地启动
echo  ==========================================
echo.

REM ---------- 1. 检查 Node.js 是否安装 ----------
where node >nul 2>nul
if errorlevel 1 (
    echo  [错误] 没有找到 Node.js。
    echo.
    echo  请先安装 Node.js 22.5 或更高版本：
    echo    https://nodejs.org/zh-cn/download
    echo.
    echo  安装时请勾选 Add to PATH，装完重新双击本文件。
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node -v') do set NODE_VER=%%v
echo  [1/3] Node.js 版本: %NODE_VER%

node -e "const v=process.versions.node.split('.').map(Number);process.exit(v[0]>22||(v[0]===22&&v[1]>=5)?0:1)"
if errorlevel 1 (
    echo.
    echo  [错误] Node.js 版本太低，本项目需要 22.5 或更高版本。
    echo  你当前是 %NODE_VER%，请到 https://nodejs.org 下载新版后重试。
    echo.
    pause
    exit /b 1
)
echo        版本检查通过

REM ---------- 2. 检查依赖 ----------
if exist "node_modules\express" (
    echo  [2/3] 依赖已安装，跳过
) else (
    echo  [2/3] 第一次运行，正在安装依赖，大约需要 1-2 分钟...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [错误] 依赖安装失败，请检查网络连接后重试。
        echo  如果一直失败，可以在项目目录手动执行: npm install
        echo.
        pause
        exit /b 1
    )
    echo.
)

REM ---------- 3. 启动服务并打开浏览器 ----------
echo  [3/3] 正在启动服务...
echo.
echo  ------------------------------------------
echo   服务地址: http://localhost:3000
echo   浏览器会自动打开，稍等 3 秒左右
echo   停止服务: 关闭本窗口，或者按 Ctrl+C
echo  ------------------------------------------
echo.

start "" /b cmd /c "timeout /t 3 >nul & rundll32 url.dll,FileProtocolHandler http://localhost:3000"

node server.js

echo.
echo  服务已停止。
pause
