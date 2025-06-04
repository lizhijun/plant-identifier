// 国际化支持
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.translations = {
            en: {
                // Header
                title: 'Plant Identifier',
                subtitle: 'AI-powered plant identification with free Qwen2.5-VL model',
                
                // Upload section
                uploadTitle: 'Plant Identification',
                uploadText: 'Click to upload or drag and drop plant images',
                uploadButton: 'Upload New Image',
                supportedFormats: 'Supported formats: JPG, PNG, GIF, WebP, HEIC, HEIF (Max 10MB)',
                
                // Results section
                resultsTitle: 'Identification Results',
                noResults: 'No identification results yet. Please upload a plant image.',
                plantName: 'Plant Name',
                scientificName: 'Scientific Name',
                confidence: 'Confidence',
                characteristics: 'Characteristics',
                growthHabits: 'Growth Habits',
                
                // Chat section
                chatTitle: 'AI Plant Assistant',
                chatPlaceholder: 'Ask questions about plants...',
                sendButton: 'Send',
                quickQuestions: 'Quick Questions',
                questions: {
                    care: 'How to care for this plant?',
                    watering: 'How often should I water it?',
                    light: 'What lighting conditions does it need?',
                    propagation: 'How to propagate this plant?',
                    diseases: 'Common diseases and pests?',
                    fertilizer: 'What fertilizer should I use?'
                },
                
                // Status messages
                uploading: 'Uploading image...',
                identifying: 'Identifying plant...',
                processing: 'Processing...',
                error: 'Error',
                success: 'Success',
                
                // Error messages
                errorUpload: 'Failed to upload image. Please try again.',
                errorIdentify: 'Failed to identify plant. Please try again.',
                errorChat: 'Failed to send message. Please try again.',
                errorFileSize: 'File size exceeds 10MB limit.',
                errorFileType: 'Unsupported file format. Please upload JPG, PNG, GIF, WebP, HEIC, or HEIF files.',
                
                // Language switcher
                language: 'Language',
                english: 'English',
                chinese: '中文'
            },
            zh: {
                // Header
                title: '植物识别器',
                subtitle: '基于免费Qwen2.5-VL模型的AI植物识别',
                
                // Upload section
                uploadTitle: '植物识别',
                uploadText: '点击上传或拖拽植物图片',
                uploadButton: '上传新图片',
                supportedFormats: '支持格式：JPG、PNG、GIF、WebP、HEIC、HEIF（最大10MB）',
                
                // Results section
                resultsTitle: '识别结果',
                noResults: '暂无识别结果，请上传植物图片。',
                plantName: '植物名称',
                scientificName: '学名',
                confidence: '置信度',
                characteristics: '特征',
                growthHabits: '生长习性',
                
                // Chat section
                chatTitle: 'AI植物助手',
                chatPlaceholder: '询问关于植物的问题...',
                sendButton: '发送',
                quickQuestions: '快速提问',
                questions: {
                    care: '如何护理这种植物？',
                    watering: '多久浇一次水？',
                    light: '需要什么光照条件？',
                    propagation: '如何繁殖这种植物？',
                    diseases: '常见病虫害有哪些？',
                    fertilizer: '应该使用什么肥料？'
                },
                
                // Status messages
                uploading: '正在上传图片...',
                identifying: '正在识别植物...',
                processing: '处理中...',
                error: '错误',
                success: '成功',
                
                // Error messages
                errorUpload: '图片上传失败，请重试。',
                errorIdentify: '植物识别失败，请重试。',
                errorChat: '消息发送失败，请重试。',
                errorFileSize: '文件大小超过10MB限制。',
                errorFileType: '不支持的文件格式。请上传JPG、PNG、GIF、WebP、HEIC或HEIF文件。',
                
                // Language switcher
                language: '语言',
                english: 'English',
                chinese: '中文'
            }
        };
    }

    // 获取当前语言
    getCurrentLang() {
        return this.currentLang;
    }

    // 设置语言
    setLang(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.updateUI();
        }
    }

    // 获取翻译文本
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                break;
            }
        }
        
        return value || key;
    }

    // 更新UI文本
    updateUI() {
        // 更新所有带有data-i18n属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        });

        // 更新页面标题
        document.title = this.t('title');

        // 更新语言选择器
        this.updateLanguageSelector();
    }

    // 更新语言选择器状态
    updateLanguageSelector() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === this.currentLang) {
                btn.classList.add('active');
            }
        });
    }

    // 初始化
    init() {
        this.createLanguageSelector();
        this.updateUI();
    }

    // 创建语言选择器
    createLanguageSelector() {
        const header = document.querySelector('header .container');
        if (!header) return;

        const langSwitcher = document.createElement('div');
        langSwitcher.className = 'language-switcher';
        langSwitcher.innerHTML = `
            <div class="lang-selector">
                <span data-i18n="language">Language</span>
                <div class="lang-buttons">
                    <button class="lang-btn" data-lang="en" data-i18n="english">English</button>
                    <button class="lang-btn" data-lang="zh" data-i18n="chinese">中文</button>
                </div>
            </div>
        `;

        header.appendChild(langSwitcher);

        // 添加点击事件
        langSwitcher.addEventListener('click', (e) => {
            if (e.target.classList.contains('lang-btn')) {
                const lang = e.target.getAttribute('data-lang');
                this.setLang(lang);
            }
        });
    }
}

// 创建全局实例
window.i18n = new I18n(); 