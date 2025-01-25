interface HomophoneMap {
  [key: string]: string[];
}

export class HomophoneConverter {
  private homophoneMap: HomophoneMap = {};

  public async loadDictionary(fileContent: string) {
    console.log('开始加载字典...');
    const lines = fileContent.split('\n');
    console.log(`总行数: ${lines.length}`);

    lines.forEach((line, index) => {
      const parts = line.trim().split('\t');
      if (parts.length >= 2) {
        const pinyin = parts[0];
        const chars = parts.slice(1).filter(char => char.trim());
        
        if (chars.length > 0) {
          console.log(`处理第 ${index + 1} 行: 拼音=${pinyin}, 字符数=${chars.length}`);
          
          // 为每个字符添加其他所有同音字
          chars.forEach(char => {
            const otherChars = chars.filter(c => c !== char);
            if (!this.homophoneMap[char]) {
              this.homophoneMap[char] = [];
            }
            otherChars.forEach(otherChar => {
              if (!this.homophoneMap[char].includes(otherChar)) {
                this.homophoneMap[char].push(otherChar);
              }
            });
          });
        }
      }
    });

    // 输出一些统计信息
    const totalChars = Object.keys(this.homophoneMap).length;
    const sampleChar = Object.keys(this.homophoneMap)[0];
    const sampleHomophones = this.homophoneMap[sampleChar] || [];
    
    console.log(`字典加载完成，共有 ${totalChars} 个字符`);
    if (sampleChar) {
      console.log(`示例：字符 "${sampleChar}" 的同音字：${sampleHomophones.join(',')}`);
    }
  }

  public getHomophones(char: string): string[] {
    const homophones = this.homophoneMap[char] || [];
    console.log(`获取 "${char}" 的同音字:`, homophones);
    return homophones;
  }

  public convertText(text: string): string {
    console.log('开始转换文本:', text);
    
    const result = Array.from(text)
      .map((char, index) => {
        const homophones = this.getHomophones(char);
        if (homophones.length > 0) {
          // 使用字符位置和时间戳生成随机种子
          const seed = Date.now() + index;
          const randomValue = Math.sin(seed) * 10000;
          const randomIndex = Math.floor(Math.abs(randomValue) % homophones.length);
          
          console.log(`字符 "${char}" 的随机索引: ${randomIndex}, 可选同音字: ${homophones.length}个`);
          return homophones[randomIndex];
        }
        return char;
      })
      .join('');
    
    console.log('转换结果:', result);
    return result;
  }

  public convertTextMultiple(text: string, count: number = 5): string[] {
    console.log(`开始生成 ${count} 个不同版本`);
    const results = new Set<string>();
    const maxAttempts = count * 5;
    let attempts = 0;

    while (results.size < count && attempts < maxAttempts) {
      const newResult = this.convertText(text);
      if (newResult !== text) {  // 只添加与原文不同的结果
        results.add(newResult);
      }
      attempts++;
      
      console.log(`尝试 ${attempts}: ${newResult}`);
      // 添加延迟以确保时间戳不同
      const delay = 10;
      const start = Date.now();
      while (Date.now() - start < delay) {
        // 空循环等待
      }
    }

    const finalResults = Array.from(results);
    console.log('最终结果:', finalResults);
    return finalResults;
  }

  public getAllPossibleCombinations(text: string): string[] {
    const chars = Array.from(text);
    const combinations: string[][] = chars.map(char => {
      const homophones = this.getHomophones(char);
      return homophones.length > 0 ? homophones : [char];
    });

    const result: string[] = [];
    const generateCombinations = (current: string, index: number) => {
      if (index === chars.length) {
        result.push(current);
        return;
      }

      for (const char of combinations[index]) {
        generateCombinations(current + char, index + 1);
      }
    };

    generateCombinations('', 0);
    return result;
  }
}
