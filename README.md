# 免费植物识别网站

一个基于OpenRouter API和Qwen2.5-VL模型的植物识别网站，提供免费的植物识别服务和AI聊天功能。

## 功能特性

- 🌿 **植物识别**: 上传植物图片，AI自动识别植物种类
- 🌍 **多语言支持**: 支持英文和中文，可随时切换语言
- 📊 **详细信息**: 显示植物名称、学名、识别置信度
- 🌱 **植物特征**: 提供详细的植物特征描述
- 🌳 **生长习性**: 展示植物的生长环境和生长方式
- 💬 **AI聊天**: 与AI助手聊天，了解更多植物护理知识，支持Markdown格式回复
- 📱 **响应式设计**: 支持手机、平板和桌面设备
- 🎨 **现代化UI**: 美观的绿色主题界面

## 技术栈

### 后端
- Node.js + Express
- OpenRouter API (Qwen2.5-VL模型)
- Multer (文件上传)
- Sharp (图片处理)

### 前端
- 原生HTML/CSS/JavaScript
- 现代化响应式设计
- 拖拽上传功能

## 安装和运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd plant-identifier
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `env.example` 文件为 `.env`：
```bash
cp env.example .env
```

编辑 `.env` 文件，添加您的OpenRouter API密钥：
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
PORT=3000
```

### 4. 获取OpenRouter API密钥
1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账户并获取API密钥
3. 将密钥添加到 `.env` 文件中

### 5. 启动服务器
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 6. 访问网站
打开浏览器访问 `http://localhost:3000`

## 使用说明

1. **语言切换**: 点击页面右上角的语言切换器选择英文或中文
2. **上传图片**: 点击"上传新图片"按钮或直接拖拽图片到上传区域
3. **查看识别结果**: AI会自动识别植物并显示详细信息
4. **AI聊天**: 在聊天区域询问关于植物的问题
5. **快速提问**: 点击预设的问题标签快速提问
6. **Markdown支持**: AI回复支持丰富的Markdown格式，包括标题、列表、代码块等

## API接口

### POST /api/identify
植物识别接口
- 参数: `image` (文件)
- 返回: 植物信息JSON

### POST /api/chat
AI聊天接口
- 参数: `message` (字符串), `plantInfo` (可选)
- 返回: AI回复JSON

## 项目结构

```
plant-identifier/
├── server.js              # Express服务器
├── package.json           # 项目配置
├── env.example            # 环境变量示例
├── README.md              # 项目说明
├── MULTILINGUAL_GUIDE.md  # 多语言功能指南
└── public/                # 静态文件
    ├── index.html         # 主页面
    ├── style.css          # 样式文件
    ├── script.js          # 前端逻辑
    └── i18n.js            # 国际化支持
```

## 注意事项

- 确保您有有效的OpenRouter API密钥
- 图片大小限制为10MB
- 支持的图片格式：JPG, PNG, GIF, WebP, HEIC, HEIF
- 免费模型可能有使用限制，请查看OpenRouter的使用条款

## 许可证

MIT License

## 🌐 部署上线

### ⚡ 一键部署
```bash
./deploy.sh
```

### 🌟 推荐部署平台

| 平台 | 特点 | 部署命令 | 成本 |
|------|------|----------|------|
| **Vercel** | 免费、零配置、全球CDN | `vercel --prod` | 免费 |
| **Railway** | 免费额度、简单易用 | `railway up` | 免费额度 |
| **Docker** | 灵活部署、适合VPS | `docker-compose up -d` | 按需付费 |

### 📚 部署文档
- [完整部署指南](DEPLOYMENT_GUIDE.md) - 详细的部署说明和配置
- [快速部署指南](QUICK_DEPLOY.md) - 快速上手部署
- [多语言功能指南](MULTILINGUAL_GUIDE.md) - 多语言支持详细说明

### 🔧 生产环境配置
- 设置环境变量 `OPENROUTER_API_KEY`
- 配置HTTPS和自定义域名
- 启用CDN和缓存优化
- 设置监控和日志记录

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！ 