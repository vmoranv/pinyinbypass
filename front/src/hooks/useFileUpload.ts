import { useState } from 'react';

interface FileUploadHook {
  handleFileUpload: (file: File) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export const useFileUpload = (): FileUploadHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });

      setIsLoading(false);
      return text;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '文件读取失败';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    handleFileUpload,
    isLoading,
    error,
  };
};
