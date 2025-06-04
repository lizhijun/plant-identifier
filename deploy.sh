#!/bin/bash

# 植物识别网站一键部署脚本
# 支持多种部署平台

set -e

echo "🚀 植物识别网站部署脚本"
echo "=========================="

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  .env文件不存在，正在创建..."
    cp env.example .env
    echo "请编辑.env文件，设置您的OPENROUTER_API_KEY"
    echo "然后重新运行此脚本"
    exit 1
fi

# 检查API密钥
if ! grep -q "OPENROUTER_API_KEY=" .env || grep -q "your_api_key_here" .env; then
    echo "❌ 请在.env文件中设置有效的OPENROUTER_API_KEY"
    exit 1
fi

echo "✅ 环境变量配置正确"

# 选择部署平台
echo ""
echo "请选择部署平台："
echo "1) Vercel (推荐 - 免费)"
echo "2) Railway (免费额度)"
echo "3) Docker (本地/VPS)"
echo "4) 仅本地测试"
echo ""
read -p "请输入选择 (1-4): " choice

case $choice in
    1)
        echo "🌟 部署到Vercel..."
        
        # 检查Vercel CLI
        if ! command -v vercel &> /dev/null; then
            echo "📦 安装Vercel CLI..."
            npm install -g vercel
        fi
        
        echo "🔑 请登录Vercel账户..."
        vercel login
        
        echo "🚀 开始部署..."
        vercel --prod
        
        echo "✅ Vercel部署完成！"
        echo "📝 请在Vercel控制台设置环境变量 OPENROUTER_API_KEY"
        ;;
        
    2)
        echo "🚂 部署到Railway..."
        
        # 检查Railway CLI
        if ! command -v railway &> /dev/null; then
            echo "📦 安装Railway CLI..."
            npm install -g @railway/cli
        fi
        
        echo "🔑 请登录Railway账户..."
        railway login
        
        echo "🚀 开始部署..."
        railway up
        
        echo "✅ Railway部署完成！"
        ;;
        
    3)
        echo "🐳 Docker部署..."
        
        # 检查Docker
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker未安装，请先安装Docker"
            exit 1
        fi
        
        echo "🔨 构建Docker镜像..."
        docker build -t plant-identifier .
        
        echo "🚀 启动容器..."
        docker run -d -p 3000:3000 --env-file .env --name plant-identifier plant-identifier
        
        echo "✅ Docker部署完成！"
        echo "🌐 访问地址: http://localhost:3000"
        ;;
        
    4)
        echo "🧪 本地测试模式..."
        
        # 检查端口占用
        if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
            echo "⚠️  端口3000被占用，正在释放..."
            lsof -ti:3000 | xargs kill -9
        fi
        
        echo "🚀 启动本地服务器..."
        npm start
        ;;
        
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 后续步骤："
echo "1. 测试网站功能"
echo "2. 配置自定义域名（可选）"
echo "3. 设置监控和日志"
echo "4. 优化性能和安全性"
echo ""
echo "📚 更多信息请查看 DEPLOYMENT_GUIDE.md" 