# 🚀 植物识别网站部署指南

## 📋 部署选项概览

| 平台 | 难度 | 成本 | 推荐度 |
|------|------|------|--------|
| **Vercel** | ⭐ 简单 | 免费 | ⭐⭐⭐⭐⭐ |
| **Netlify** | ⭐ 简单 | 免费 | ⭐⭐⭐⭐ |
| **Railway** | ⭐⭐ 中等 | 免费额度 | ⭐⭐⭐⭐ |
| **Render** | ⭐⭐ 中等 | 免费额度 | ⭐⭐⭐ |
| **Heroku** | ⭐⭐ 中等 | 付费 | ⭐⭐⭐ |
| **VPS服务器** | ⭐⭐⭐ 复杂 | 付费 | ⭐⭐ |

## 🌟 推荐方案：Vercel部署

### 为什么选择Vercel？
- ✅ **完全免费**：个人项目无限制
- ✅ **零配置**：自动检测Node.js项目
- ✅ **全球CDN**：访问速度快
- ✅ **自动HTTPS**：安全可靠
- ✅ **Git集成**：推送代码自动部署

### 🔧 Vercel部署步骤

#### 1. 准备项目
```bash
# 确保项目结构正确
npm install
npm test  # 可选：运行测试
```

#### 2. 创建vercel.json配置
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 3. 部署方式

**方式A：通过Vercel CLI（推荐）**
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel

# 生产环境部署
vercel --prod
```

**方式B：通过GitHub集成**
1. 将代码推送到GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 连接GitHub仓库
4. 自动部署

#### 4. 环境变量配置
在Vercel控制台设置：
- `OPENROUTER_API_KEY`: 您的OpenRouter API密钥
- `NODE_ENV`: production

## 🚂 备选方案：Railway部署

### Railway部署步骤

#### 1. 创建railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 2. 部署命令
```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录Railway
railway login

# 初始化项目
railway init

# 部署
railway up
```

## 🌐 备选方案：Netlify部署

### Netlify部署步骤

#### 1. 创建netlify.toml
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "public"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. 创建Netlify Functions
需要将API路由转换为Netlify Functions格式。

## 🐳 Docker部署

### 创建Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 创建docker-compose.yml
```yaml
version: '3.8'
services:
  plant-identifier:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    restart: unless-stopped
```

### Docker部署命令
```bash
# 构建镜像
docker build -t plant-identifier .

# 运行容器
docker run -d -p 3000:3000 --env-file .env plant-identifier

# 或使用docker-compose
docker-compose up -d
```

## 🔒 生产环境配置

### 1. 环境变量
创建生产环境的`.env`文件：
```env
NODE_ENV=production
PORT=3000
OPENROUTER_API_KEY=your_api_key_here
```

### 2. 安全配置
```javascript
// 在server.js中添加安全中间件
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 安全头
app.use(helmet());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100次请求
});
app.use('/api/', limiter);
```

### 3. 性能优化
```javascript
// 启用gzip压缩
const compression = require('compression');
app.use(compression());

// 静态文件缓存
app.use(express.static('public', {
  maxAge: '1d',
  etag: false
}));
```

## 📊 监控和日志

### 1. 添加日志记录
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. 健康检查端点
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🌍 域名和SSL

### 1. 自定义域名
- Vercel：在项目设置中添加自定义域名
- Cloudflare：配置DNS解析
- 自动获得SSL证书

### 2. CDN配置
- 启用全球CDN加速
- 配置缓存策略
- 优化图片加载

## 📈 性能优化建议

### 1. 前端优化
- 压缩CSS和JavaScript
- 优化图片格式和大小
- 启用浏览器缓存

### 2. 后端优化
- 实现API响应缓存
- 优化数据库查询
- 使用连接池

### 3. 图片处理优化
```javascript
// 在server.js中优化Sharp配置
const compressedImage = await sharp(req.file.buffer)
  .resize(800, 800, { 
    fit: 'inside', 
    withoutEnlargement: true,
    kernel: sharp.kernel.lanczos3
  })
  .jpeg({ 
    quality: 80,
    progressive: true,
    mozjpeg: true
  })
  .toBuffer();
```

## 🚨 故障排除

### 常见问题

**1. 端口占用错误**
```bash
# 查找占用端口的进程
lsof -ti:3000

# 杀死进程
kill -9 <PID>
```

**2. 内存不足**
```bash
# 增加Node.js内存限制
node --max-old-space-size=4096 server.js
```

**3. API密钥问题**
- 确保环境变量正确设置
- 检查API密钥是否有效
- 验证API调用限制

## 📞 技术支持

如果遇到部署问题，可以：
1. 查看平台官方文档
2. 检查服务器日志
3. 验证环境变量配置
4. 测试本地运行是否正常

---

**推荐部署流程**：
1. 本地测试 → 2. 推送到GitHub → 3. Vercel自动部署 → 4. 配置环境变量 → 5. 测试生产环境

🎉 **恭喜！您的植物识别网站即将上线！** 