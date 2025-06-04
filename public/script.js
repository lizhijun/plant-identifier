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
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.handleFileUpload(files[0]);
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
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        alert(message);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PlantIdentifier();
}); 