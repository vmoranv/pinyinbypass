import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

interface Dictionary {
  [key: string]: string[];
}

// 字典缓存
let homophoneCharMap: Dictionary = {};
let homophoneWordMap: Dictionary = {};

// 加载字典
const loadDictionary = async (filePath: string): Promise<Dictionary> => {
  const map: Dictionary = {};
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line: string) => {
      const parts = line.trim().split('\t');
      if (parts.length >= 2) {
        const pinyin = parts[0];
        const chars = parts.slice(1).filter((char: string) => char.trim());
        
        chars.forEach((char: string) => {
          if (!map[char]) {
            map[char] = [];
          }
          chars.forEach((otherChar: string) => {
            if (char !== otherChar && !map[char].includes(otherChar)) {
              map[char].push(otherChar);
            }
          });
        });
      }
    });
    
    console.log(`字典加载完成，共有 ${Object.keys(map).length} 个字符`);
    return map;
  } catch (error) {
    console.error('加载字典失败:', error);
    return {};
  }
};

// 初始化字典
const initDictionaries = async (): Promise<void> => {
  try {
    const charDictPath = path.join(__dirname, '../dictionaries/chinese_homophone_char.txt');
    const wordDictPath = path.join(__dirname, '../dictionaries/chinese_homophone_word.txt');
    
    console.log('加载单字同音字典:', charDictPath);
    homophoneCharMap = await loadDictionary(charDictPath);
    console.log('加载词组同音字典:', wordDictPath);
    homophoneWordMap = await loadDictionary(wordDictPath);
    
    console.log('字典加载完成');
    console.log(`- 单字同音字典: ${Object.keys(homophoneCharMap).length} 个字符`);
    console.log(`- 词组同音字典: ${Object.keys(homophoneWordMap).length} 个词组`);
  } catch (error) {
    console.error('初始化字典失败:', error);
    process.exit(1);
  }
};

// 获取同音字
const getHomophones = (char: string): string[] => {
  return homophoneCharMap[char] || homophoneWordMap[char] || [];
};

// 随机选择同音字
const getRandomHomophone = (char: string, seed: number): string => {
  const homophones = homophoneCharMap[char] || [];
  if (homophones.length === 0) return char;

  // 使用更好的伪随机数生成算法
  const x = Math.sin(seed) * 10000;
  const randomValue = x - Math.floor(x);
  const randomIndex = Math.floor(randomValue * homophones.length);
  
  const result = homophones[randomIndex];
  // 如果结果与原字相同且有其他选择，选择下一个
  if (result === char && homophones.length > 1) {
    return homophones[(randomIndex + 1) % homophones.length];
  }
  
  return result;
};

interface ConvertRequest {
  text: string;
  count?: number;
}

// API 路由
app.post('/api/convert', async (req: Request<{}, {}, ConvertRequest>, res: Response) => {
  const { text } = req.body;
  
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: '请提供要转换的文本' });
  }

  try {
    const timestamp = Date.now();
    const chars: string[] = Array.from(text);
    
    // 分批处理大文本，每批1000个字符
    const batchSize = 1000;
    let result = '';
    
    // 只生成一个结果
    for (let i = 0; i < chars.length; i += batchSize) {
      const batch = chars.slice(i, i + batchSize);
      const batchResult = batch
        .map((char: string, index: number) => {
          // 使用字符位置和时间戳生成唯一种子
          const seed = timestamp + i + index;
          return getRandomHomophone(char, seed);
        })
        .join('');
      result += batchResult;
    }

    // 返回单个结果
    const response = {
      results: [result], // 确保只返回一个结果
      timestamp,
      originalText: text,
      timelineName: `转换 ${new Date(timestamp).toLocaleTimeString('zh-CN')}`
    };

    console.log('转换结果:', response); // 添加日志
    res.json(response);
  } catch (error) {
    console.error('转换失败:', error);
    res.status(500).json({ error: '转换失败，请稍后重试' });
  }
});

// 健康检查
app.get('/api/health', (_: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    dictionaries: {
      chars: Object.keys(homophoneCharMap).length,
      words: Object.keys(homophoneWordMap).length
    }
  });
});

// 启动服务器
initDictionaries().then(() => {
  app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
  });
});
