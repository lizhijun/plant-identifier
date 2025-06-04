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
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    // 压缩图片以减少API调用成本
    // Sharp会自动检测输入格式，包括HEIC/HEIF
    const compressedImage = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 }) // 统一转换为JPEG格式发送给API
      .toBuffer();

    const base64Image = compressedImage.toString('base64');

    // 调用OpenRouter API
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "qwen/qwen2.5-vl-32b-instruct:free",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请识别这张图片中的植物，并提供以下信息（请用中文回答）：\n1. 植物名称（中文名和学名）\n2. 识别置信度（高/中/低）\n3. 植物特征（3-4个要点）\n4. 生长习性（生长环境和生长方式）\n5. 护理建议（浇水频率、光照需求等）\n\n请按照以下JSON格式返回：\n{\n  \"name\": \"植物中文名\",\n  \"scientificName\": \"学名\",\n  \"confidence\": \"高/中/低\",\n  \"features\": [\"特征1\", \"特征2\", \"特征3\"],\n  \"habitat\": \"生长环境描述\",\n  \"growthPattern\": \"生长方式描述\",\n  \"care\": {\n    \"watering\": \"浇水建议\",\n    \"light\": \"光照需求\",\n    \"soil\": \"土壤要求\"\n  }\n}"
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
      plantInfo = {
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
      };
    }

    res.json(plantInfo);

  } catch (error) {
    console.error('植物识别错误:', error);
    res.status(500).json({ 
      error: '植物识别失败，请稍后重试',
      details: error.message 
    });
  }
});

// AI聊天API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, plantInfo } = req.body;

    if (!message) {
      return res.status(400).json({ error: '请输入消息' });
    }

    const systemPrompt = plantInfo ? 
      `你是一个植物专家AI助手。用户刚刚识别了一种植物：${plantInfo.name}（${plantInfo.scientificName}）。请基于这个植物的信息回答用户的问题。请用中文回答。` :
      '你是一个植物专家AI助手。请用中文回答用户关于植物的问题。';

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
    res.status(500).json({ 
      error: 'AI聊天失败，请稍后重试',
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