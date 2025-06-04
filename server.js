const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 配置multer用于文件上传
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    // 支持的图片格式
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'image/heif',
      'application/octet-stream' // HEIC文件有时会被识别为这种类型
    ];
    
    // 检查文件扩展名（用于HEIC格式的额外验证）
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片文件（JPG, PNG, GIF, WebP, HEIC, HEIF）'), false);
    }
  }
});

// 植物识别API
app.post('/api/identify', upload.single('image'), async (req, res) => {
  try {
    const language = req.body.language || 'en';
    
    if (!req.file) {
      const errorMsg = language === 'zh' ? '请上传图片文件' : 'Please upload an image file';
      return res.status(400).json({ error: errorMsg });
    }

    // 压缩图片以减少API调用成本
    // Sharp会自动检测输入格式，包括HEIC/HEIF
    const compressedImage = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 }) // 统一转换为JPEG格式发送给API
      .toBuffer();

    const base64Image = compressedImage.toString('base64');

    // 构建识别提示词
    const identifyPrompt = language === 'zh' 
      ? "请识别这张图片中的植物，并提供以下信息（请用中文回答）：\n1. 植物名称（中文名和学名）\n2. 识别置信度（高/中/低）\n3. 植物特征（3-4个要点）\n4. 生长习性（生长环境和生长方式）\n5. 护理建议（浇水频率、光照需求等）\n\n请按照以下JSON格式返回：\n{\n  \"name\": \"植物中文名\",\n  \"scientificName\": \"学名\",\n  \"confidence\": \"高/中/低\",\n  \"features\": [\"特征1\", \"特征2\", \"特征3\"],\n  \"habitat\": \"生长环境描述\",\n  \"growthPattern\": \"生长方式描述\",\n  \"care\": {\n    \"watering\": \"浇水建议\",\n    \"light\": \"光照需求\",\n    \"soil\": \"土壤要求\"\n  }\n}"
      : "Please identify the plant in this image and provide the following information (respond in English):\n1. Plant name (common name and scientific name)\n2. Identification confidence (High/Medium/Low)\n3. Plant characteristics (3-4 key points)\n4. Growth habits (growing environment and growth pattern)\n5. Care recommendations (watering frequency, light requirements, etc.)\n\nPlease return in the following JSON format:\n{\n  \"name\": \"Common plant name\",\n  \"scientificName\": \"Scientific name\",\n  \"confidence\": \"High/Medium/Low\",\n  \"features\": [\"Feature 1\", \"Feature 2\", \"Feature 3\"],\n  \"habitat\": \"Growing environment description\",\n  \"growthPattern\": \"Growth pattern description\",\n  \"care\": {\n    \"watering\": \"Watering advice\",\n    \"light\": \"Light requirements\",\n    \"soil\": \"Soil requirements\"\n  }\n}";

    // 调用OpenRouter API
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "qwen/qwen2.5-vl-32b-instruct:free",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: identifyPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    
    // 尝试解析JSON响应
    let plantInfo;
    try {
      // 提取JSON部分
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plantInfo = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI响应');
      }
    } catch (parseError) {
      // 如果JSON解析失败，返回原始文本
      plantInfo = language === 'zh' ? {
        name: "未知植物",
        scientificName: "",
        confidence: "低",
        features: ["AI识别结果解析失败"],
        habitat: aiResponse,
        growthPattern: "",
        care: {
          watering: "请咨询专业人士",
          light: "请咨询专业人士",
          soil: "请咨询专业人士"
        }
      } : {
        name: "Unknown Plant",
        scientificName: "",
        confidence: "Low",
        features: ["AI identification result parsing failed"],
        habitat: aiResponse,
        growthPattern: "",
        care: {
          watering: "Please consult a professional",
          light: "Please consult a professional",
          soil: "Please consult a professional"
        }
      };
    }

    res.json(plantInfo);

  } catch (error) {
    console.error('植物识别错误:', error);
    const errorMsg = language === 'zh' ? '植物识别失败，请稍后重试' : 'Plant identification failed, please try again later';
    res.status(500).json({ 
      error: errorMsg,
      details: error.message 
    });
  }
});

// AI聊天API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, plantInfo, language = 'en' } = req.body;

    if (!message) {
      const errorMsg = language === 'zh' ? '请输入消息' : 'Please enter a message';
      return res.status(400).json({ error: errorMsg });
    }

    let systemPrompt;
    if (language === 'zh') {
      systemPrompt = plantInfo ? 
        `你是一个植物专家AI助手。用户刚刚识别了一种植物：${plantInfo.name}（${plantInfo.scientificName}）。请基于这个植物的信息回答用户的问题。请用中文回答。` :
        '你是一个植物专家AI助手。请用中文回答用户关于植物的问题。';
    } else {
      systemPrompt = plantInfo ? 
        `You are a plant expert AI assistant. The user just identified a plant: ${plantInfo.name} (${plantInfo.scientificName}). Please answer the user's questions based on this plant information. Please respond in English.` :
        'You are a plant expert AI assistant. Please answer user questions about plants in English.';
    }

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "qwen/qwen2.5-vl-32b-instruct:free",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('AI聊天错误:', error);
    const errorMsg = language === 'zh' ? 'AI聊天失败，请稍后重试' : 'AI chat failed, please try again later';
    res.status(500).json({ 
      error: errorMsg,
      details: error.message 
    });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 提供主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`植物识别服务器运行在 http://localhost:${PORT}`);
  console.log('请确保设置了OPENROUTER_API_KEY环境变量');
}); 