# 🌍 多语言支持指南 / Multilingual Support Guide

## 📋 功能概述 / Feature Overview

植物识别网站现已支持英文和中文双语言，用户可以随时切换语言，享受本地化的体验。

The Plant Identifier website now supports both English and Chinese languages, allowing users to switch languages at any time for a localized experience.

## ✨ 支持的语言 / Supported Languages

- **🇺🇸 English** - 默认语言 / Default language
- **🇨🇳 中文** - 完整中文支持 / Full Chinese support

## 🔧 功能特性 / Features

### 🎯 智能语言检测 / Smart Language Detection
- 自动保存用户语言偏好到本地存储
- 页面刷新后保持语言设置
- Auto-save user language preference to local storage
- Maintain language settings after page refresh

### 🌐 全面本地化 / Complete Localization

#### 界面文本 / UI Text
- 页面标题和描述 / Page titles and descriptions
- 按钮和标签 / Buttons and labels
- 错误消息和提示 / Error messages and prompts
- 加载状态文本 / Loading status text

#### AI交互 / AI Interaction
- 植物识别结果 / Plant identification results
- AI聊天回复 / AI chat responses
- 快速问题标签 / Quick question tags
- 系统提示信息 / System prompts

## 🎮 使用方法 / How to Use

### 切换语言 / Switch Language

1. **桌面端 / Desktop**
   - 点击页面右上角的语言切换器
   - 选择 "English" 或 "中文"
   - Click the language switcher in the top-right corner
   - Select "English" or "中文"

2. **移动端 / Mobile**
   - 语言切换器位于页面顶部
   - 点击相应的语言按钮
   - Language switcher is located at the top of the page
   - Tap the corresponding language button

### 语言特定功能 / Language-Specific Features

#### 🔍 植物识别 / Plant Identification

**中文模式 / Chinese Mode:**
- AI使用中文识别和描述植物
- 返回中文植物名称和学名
- 提供中文护理建议

**英文模式 / English Mode:**
- AI identifies and describes plants in English
- Returns English plant names and scientific names
- Provides care advice in English

#### 💬 AI聊天 / AI Chat

**中文模式 / Chinese Mode:**
- AI助手用中文回答问题
- 支持中文植物护理咨询
- 理解中文植物相关术语

**英文模式 / English Mode:**
- AI assistant responds in English
- Supports English plant care consultation
- Understands English botanical terminology

## 🛠️ 技术实现 / Technical Implementation

### 前端架构 / Frontend Architecture

```javascript
// 国际化类结构
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.translations = { en: {...}, zh: {...} };
    }
    
    // 核心方法
    t(key)              // 获取翻译文本
    setLang(lang)       // 设置语言
    updateUI()          // 更新界面
}
```

### 后端支持 / Backend Support

```javascript
// API支持多语言
app.post('/api/identify', (req, res) => {
    const language = req.body.language || 'en';
    // 根据语言构建不同的AI提示词
});

app.post('/api/chat', (req, res) => {
    const { language = 'en' } = req.body;
    // AI根据语言回复
});
```

### 数据属性 / Data Attributes

HTML元素使用 `data-i18n` 属性标记需要翻译的文本：

```html
<h1 data-i18n="title">Plant Identifier</h1>
<button data-i18n="uploadButton">Upload New Image</button>
<input data-i18n="chatPlaceholder" placeholder="Ask questions about plants...">
```

## 📱 响应式设计 / Responsive Design

### 桌面端 / Desktop
- 语言切换器位于右上角
- 紧凑的按钮设计
- Language switcher in top-right corner
- Compact button design

### 移动端 / Mobile
- 语言切换器移至页面顶部中央
- 更大的触摸目标
- Language switcher moved to top center
- Larger touch targets

## 🔄 语言切换流程 / Language Switch Flow

1. **用户点击语言按钮 / User clicks language button**
2. **保存到本地存储 / Save to local storage**
3. **更新所有UI文本 / Update all UI text**
4. **更新页面标题 / Update page title**
5. **更新HTML lang属性 / Update HTML lang attribute**
6. **后续API调用使用新语言 / Subsequent API calls use new language**

## 🎯 最佳实践 / Best Practices

### 用户体验 / User Experience
- ✅ 即时切换，无需刷新页面 / Instant switching without page refresh
- ✅ 保持用户当前操作状态 / Maintain current user operation state
- ✅ 清晰的语言标识 / Clear language indicators
- ✅ 一致的术语翻译 / Consistent terminology translation

### 开发建议 / Development Tips
- ✅ 使用语义化的翻译键名 / Use semantic translation key names
- ✅ 支持嵌套翻译结构 / Support nested translation structure
- ✅ 提供回退机制 / Provide fallback mechanism
- ✅ 考虑文本长度差异 / Consider text length differences

## 🚀 扩展支持 / Extension Support

### 添加新语言 / Adding New Languages

1. **更新翻译文件 / Update translation file**
```javascript
// 在 i18n.js 中添加新语言
this.translations = {
    en: { ... },
    zh: { ... },
    es: { ... }  // 新增西班牙语
};
```

2. **添加语言按钮 / Add language button**
```html
<button class="lang-btn" data-lang="es" data-i18n="spanish">Español</button>
```

3. **更新服务器端 / Update server-side**
```javascript
// 在服务器端添加对应的AI提示词
const systemPrompt = language === 'es' 
    ? 'Eres un experto en plantas...' 
    : existingPrompts[language];
```

## 📊 支持的功能范围 / Supported Feature Scope

| 功能 / Feature | 英文 / English | 中文 / Chinese |
|----------------|----------------|----------------|
| 界面文本 / UI Text | ✅ | ✅ |
| 植物识别 / Plant ID | ✅ | ✅ |
| AI聊天 / AI Chat | ✅ | ✅ |
| 错误消息 / Error Messages | ✅ | ✅ |
| 快速问题 / Quick Questions | ✅ | ✅ |
| 加载提示 / Loading Text | ✅ | ✅ |

## 🔍 测试建议 / Testing Recommendations

### 功能测试 / Functional Testing
1. 测试语言切换的即时性
2. 验证本地存储的持久性
3. 检查API调用的语言参数
4. 确认AI回复的语言一致性

### 界面测试 / UI Testing
1. 检查不同语言下的文本显示
2. 验证移动端的响应式布局
3. 测试长文本的显示效果
4. 确认按钮和标签的对齐

## 📝 更新日志 / Changelog

### v2.0.0 - 多语言支持 / Multilingual Support
- ✅ 添加英文/中文双语支持
- ✅ 实现智能语言切换
- ✅ 优化移动端体验
- ✅ 完善AI多语言交互

---

## 🤝 贡献 / Contributing

欢迎为多语言功能贡献代码和翻译！

Welcome to contribute code and translations for multilingual features!

### 翻译贡献 / Translation Contributions
- 检查现有翻译的准确性
- 添加新语言支持
- 改进术语一致性

### 代码贡献 / Code Contributions
- 优化语言切换性能
 