import { VercelRequest, VercelResponse } from '@vercel/node';
import { loadDictionary } from '../server/src/server';
import path from 'path';

let homophoneCharMap: { [key: string]: string[] } = {};
let homophoneWordMap: { [key: string]: string[] } = {};

// 初始化字典
const initDictionaries = async () => {
  try {
    const charDictPath = path.join(process.cwd(), 'server', 'dictionaries', 'chars.txt');
    const wordDictPath = path.join(process.cwd(), 'server', 'dictionaries', 'words.txt');
    
    homophoneCharMap = await loadDictionary(charDictPath);
    homophoneWordMap = await loadDictionary(wordDictPath);
    
    return {
      chars: Object.keys(homophoneCharMap).length,
      words: Object.keys(homophoneWordMap).length
    };
  } catch (error) {
    console.error('加载字典失败:', error);
    throw error;
  }
};

// 获取同音字
const getHomophones = (char: string): string[] => {
  return homophoneCharMap[char] || [];
};

// 随机选择同音字
const getRandomHomophone = (char: string, seed: number): string => {
  const homophones = getHomophones(char);
  if (homophones.length === 0) return char;
  
  const index = Math.floor(Math.abs(Math.sin(seed)) * homophones.length);
  return homophones[index];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET' && req.url === '/api/health') {
    try {
      const stats = await initDictionaries();
      res.json({ status: 'ok', dictionaries: stats });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器初始化失败' });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/convert') {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: '请提供要转换的文本' });
      return;
    }

    try {
      const seed = Date.now();
      const result = Array.from(text).map(char => {
        if (/[\u4e00-\u9fa5]/.test(char)) {
          return getRandomHomophone(char, seed);
        }
        return char;
      }).join('');

      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: '转换失败' });
    }
    return;
  }

  res.status(404).json({ error: '未找到请求的接口' });
}
