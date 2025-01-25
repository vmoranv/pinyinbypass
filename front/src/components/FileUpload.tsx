import React, { useRef } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  useToast,
  Progress,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useFileUpload } from '../hooks/useFileUpload';

const MotionBox = motion(Box);

interface FileUploadProps {
  onFileLoaded: (content: string) => void;
  label: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileUpload, isLoading, error } = useFileUpload();
  const toast = useToast();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await handleFileUpload(file);
      onFileLoaded(content);
      toast({
        title: '文件上传成功',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: '文件上传失败',
        description: error || '发生未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={4}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept=".txt"
          style={{ display: 'none' }}
        />
        <Button
          onClick={handleClick}
          colorScheme="teal"
          isLoading={isLoading}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          transition="all 0.2s"
        >
          {label}
        </Button>
        {isLoading && (
          <Box w="100%">
            <Progress size="xs" isIndeterminate colorScheme="teal" />
          </Box>
        )}
        {error && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}
      </VStack>
    </MotionBox>
  );
};

export default FileUpload;
