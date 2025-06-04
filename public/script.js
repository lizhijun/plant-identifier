class PlantIdentifier {
    constructor() {
        this.currentPlantInfo = null;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileInput = document.getElementById('fileInput');
        this.resultSection = document.getElementById('resultSection');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
    }

    bindEvents() {
        // 文件上传事件
        this.uploadBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // 拖拽上传
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && this.isValidImageFile(files[0])) {
                this.handleFileUpload(files[0]);
            } else if (files.length > 0) {
                this.showError('请上传有效的图片文件（支持JPG, PNG, GIF, WebP, HEIC, HEIF格式）');
            }
        });

        // 聊天功能
        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // 问题标签点击
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-btn')) {
                const question = e.target.getAttribute('data-question');
                this.chatInput.value = question;
                this.sendMessage();
            }
        });
    }

    async handleFileUpload(file) {
        try {
            this.showLoading(true);
            
            // 显示上传的图片
            this.displayUploadedImage(file);
            
            // 创建FormData
            const formData = new FormData();
            formData.append('image', file);

            // 发送到后端识别
            const response = await fetch('/api/identify', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const plantInfo = await response.json();
            this.currentPlantInfo = plantInfo;
            this.displayPlantInfo(plantInfo);
            this.updateChatHeader(plantInfo.name);
            
        } catch (error) {
            console.error('植物识别失败:', error);
            this.showError('植物识别失败，请稍后重试。');
        } finally {
            this.showLoading(false);
        }
    }

    displayUploadedImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const uploadContent = this.uploadArea.querySelector('.upload-content');
            uploadContent.innerHTML = `
                <img src="${e.target.result}" alt="上传的植物图片" style="max-width: 200px; max-height: 200px; border-radius: 10px; margin-bottom: 15px;">
                <h3>正在识别植物...</h3>
                <p class="plant-description">请稍等，AI正在分析您的图片</p>
            `;
        };
        reader.readAsDataURL(file);
    }

    displayPlantInfo(plantInfo) {
        // 更新植物名称
        document.getElementById('plantName').textContent = 
            `${plantInfo.name} ${plantInfo.scientificName ? `(${plantInfo.scientificName})` : ''}`;

        // 更新置信度
        document.getElementById('confidenceText').textContent = 
            `${plantInfo.confidence}。${this.getConfidenceDescription(plantInfo.confidence)}`;

        // 更新特征列表
        const featuresList = document.getElementById('featuresList');
        featuresList.innerHTML = '';
        if (plantInfo.features && Array.isArray(plantInfo.features)) {
            plantInfo.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                featuresList.appendChild(li);
            });
        }

        // 更新生长习性
        document.getElementById('habitatText').textContent = plantInfo.habitat || '暂无信息';
        document.getElementById('growthText').textContent = plantInfo.growthPattern || '暂无信息';

        // 更新上传区域显示
        const uploadContent = this.uploadArea.querySelector('.upload-content');
        uploadContent.innerHTML = `
            <div class="plant-icon">🌿</div>
            <h3>已识别植物:</h3>
            <p class="plant-name">${plantInfo.name}</p>
            <p class="plant-description">与我们的AI聊天了解更多关于这种植物的信息</p>
        `;

        // 显示结果区域
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    getConfidenceDescription(confidence) {
        switch(confidence) {
            case '高':
                return '该植物的特征与识别结果高度吻合。';
            case '中':
                return '该植物的特征与识别结果较为吻合。';
            case '低':
                return '识别结果仅供参考，建议咨询专业人士。';
            default:
                return '识别完成。';
        }
    }

    updateChatHeader(plantName) {
        const chatHeader = document.querySelector('.chat-header h3');
        chatHeader.textContent = `与植物AI聊天了解${plantName}`;
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // 显示用户消息
        this.addMessage(message, 'user');
        this.chatInput.value = '';

        try {
            // 发送到后端
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    plantInfo: this.currentPlantInfo
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.addMessage(data.response, 'ai');

        } catch (error) {
            console.error('AI聊天失败:', error);
            this.addMessage('抱歉，AI暂时无法回应，请稍后重试。', 'ai');
        }
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (type === 'ai') {
            // AI消息支持Markdown格式
            messageContent.innerHTML = this.parseMarkdown(content);
        } else {
            // 用户消息使用纯文本
            messageContent.textContent = content;
        }
        
        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    parseMarkdown(text) {
        // 改进的Markdown解析器
        let html = text;
        
        // 处理代码块（先处理，避免被其他规则影响）
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // 处理行内代码
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 处理标题（从大到小）
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // 处理引用
        html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
        
        // 处理分割线
        html = html.replace(/^---$/gm, '<hr>');
        
        // 处理粗体和斜体（避免冲突）
        // 先标记粗体，避免被斜体规则影响
        html = html.replace(/\*\*([^*]+)\*\*/g, '___BOLD_START___$1___BOLD_END___');
        html = html.replace(/__([^_]+)__/g, '___BOLD_START___$1___BOLD_END___');
        
        // 处理斜体
        html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
        html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>');
        
        // 恢复粗体标记
        html = html.replace(/___BOLD_START___([^_]+)___BOLD_END___/g, '<strong>$1</strong>');
        
        // 处理链接
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // 分割成行处理列表
        const lines = html.split('\n');
        const processedLines = [];
        let inList = false;
        let listType = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // 检查是否是列表项
            const unorderedMatch = line.match(/^[\s]*[-*] (.+)$/);
            const orderedMatch = line.match(/^[\s]*\d+\. (.+)$/);
            
            if (unorderedMatch) {
                if (!inList || listType !== 'ul') {
                    if (inList) processedLines.push(`</${listType}>`);
                    processedLines.push('<ul>');
                    inList = true;
                    listType = 'ul';
                }
                processedLines.push(`<li>${unorderedMatch[1]}</li>`);
            } else if (orderedMatch) {
                if (!inList || listType !== 'ol') {
                    if (inList) processedLines.push(`</${listType}>`);
                    processedLines.push('<ol>');
                    inList = true;
                    listType = 'ol';
                }
                processedLines.push(`<li>${orderedMatch[1]}</li>`);
            } else {
                if (inList) {
                    processedLines.push(`</${listType}>`);
                    inList = false;
                    listType = null;
                }
                processedLines.push(line);
            }
        }
        
        // 关闭未关闭的列表
        if (inList) {
            processedLines.push(`</${listType}>`);
        }
        
        html = processedLines.join('\n');
        
        // 处理段落（避免影响已有的HTML标签）
        const paragraphs = html.split('\n\n');
        const processedParagraphs = paragraphs.map(p => {
            p = p.trim();
            if (!p) return '';
            
            // 如果已经是HTML标签，不要包装
            if (p.startsWith('<') || p.includes('<h') || p.includes('<ul>') || 
                p.includes('<ol>') || p.includes('<pre>') || p.includes('<blockquote>') || 
                p.includes('<hr>')) {
                return p;
            }
            
            // 包装为段落
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        });
        
        html = processedParagraphs.join('');
        
        // 清理多余的换行
        html = html.replace(/\n+/g, '');
        
        return html;
    }

    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    isValidImageFile(file) {
        // 检查MIME类型
        const validMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png', 
            'image/gif',
            'image/webp',
            'image/heic',
            'image/heif'
        ];
        
        // 检查文件扩展名
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
        
        // HEIC文件有时MIME类型不准确，所以同时检查扩展名
        return validMimeTypes.includes(file.type) || hasValidExtension;
    }

    showError(message) {
        alert(message);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PlantIdentifier();
}); 