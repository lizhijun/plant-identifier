# ⚡ 快速部署指南

## 🚀 一键部署（推荐）

```bash
# 运行一键部署脚本
./deploy.sh
```

## 🌟 Vercel部署（最简单）

### 方法1：命令行部署
```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署
vercel --prod
```

### 方法2：GitHub集成
1. 推送代码到GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入GitHub仓库
4. 自动部署

### 环境变量设置
在Vercel控制台添加：
- `OPENROUTER_API_KEY`: 您的API密钥

## 🚂 Railway部署

```bash
# 1. 安装Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 部署
railway up
```

## 🐳 Docker部署

```bash
# 1. 构建镜像
docker build -t plant-identifier .

# 2. 运行容器
docker run -d -p 3000:3000 --env-file .env plant-identifier

# 或使用docker-compose
docker-compose up -d
```

## 🧪 本地测试

```bash
# 1. 安装依赖
npm install

# 2. 设置环境变量
cp env.example .env
# 编辑.env文件，设置OPENROUTER_API_KEY

# 3. 启动服务器
npm start
```

## 📋 部署检查清单

- [ ] 设置API密钥
- [ ] 测试本地运行
- [ ] 选择部署平台
- [ ] 配置环境变量
- [ ] 测试生产环境
- [ ] 设置自定义域名（可选）

## 🆘 常见问题

**Q: 端口被占用怎么办？**
```bash
lsof -ti:3000 | xargs kill -9
```

**Q: 如何更新部署？**
- Vercel: 推送代码自动更新
- Railway: `railway up`
- Docker: 重新构建镜像

**Q: 如何查看日志？**
- Vercel: 控制台查看
- Railway: `railway logs`
- Docker: `docker logs container_name`

---

🎉 **选择最适合您的部署方式，几分钟内即可上线！** 