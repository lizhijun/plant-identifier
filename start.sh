#!/bin/bash

echo "🌿 植物识别网站启动脚本"
echo "========================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "访问 https://nodejs.org/ 下载安装"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm"
    exit 1
fi

echo "✅ npm版本: $(npm --version)"

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已存在"
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到.env文件，正在创建..."
    cp env.example .env
    echo "📝 请编辑.env文件，添加您的OpenRouter API密钥"
    echo "   OPENROUTER_API_KEY=your_api_key_here"
    echo ""
    echo "🔗 获取API密钥: https://openrouter.ai/"
    echo ""
    read -p "按Enter键继续（确保已设置API密钥）..."
fi

# 启动服务器
echo "🚀 正在启动服务器..."
echo "📱 访问地址: http://localhost:3000"
echo "⏹️  按Ctrl+C停止服务器"
echo ""

npm start 