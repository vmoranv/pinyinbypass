import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  useColorMode,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';
import { MdExpandMore, MdChevronRight, MdMenu, MdAdd, MdMoreVert, MdEdit, MdDelete, MdContentCopy, MdDarkMode, MdLightMode } from 'react-icons/md';

const MotionHeading = motion(Heading);

// 定义渐变动画关键帧
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// 渐变文字组件
const GradientText = ({ children, ...props }: { children: React.ReactNode }) => {
  const { colorMode } = useColorMode();
  
  const lightGradient = 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)';
  const darkGradient = 'linear-gradient(-45deg, #ff3d00, #00a8ff, #ff00c8, #00ffd0)';
  
  return (
    <MotionHeading
      as="h1"
      size="xl"
      css={{
        background: colorMode === 'light' ? lightGradient : darkGradient,
        backgroundSize: '400% 400%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: `${gradientAnimation} 10s ease infinite`,
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      textAlign="center"
      letterSpacing="wide"
      fontWeight="extrabold"
      {...props}
    >
      {children}
    </MotionHeading>
  );
};

// 背景渐变组件
const GradientBackground = motion(Box);

const API_URL = 'http://localhost:3001/api';

// 时间线接口
interface Timeline {
  id: string;
  name: string;
  createdAt: number;
}

// 转换结果接口
interface ConversionItem {
  id: string;
  timelineId: string;
  originalText: string;
  results: string[];
  timestamp: number;
  isExpanded?: boolean;
}

// 时间线列表组件
const TimelineList: React.FC<{
  timelines: Timeline[];
  selectedTimelineId: string | null;
  onTimelineSelect: (timeline: Timeline) => void;
  onTimelineAction: (timeline: Timeline | null, action: 'rename' | 'delete' | 'new') => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  conversions: ConversionItem[];
}> = ({ 
  timelines, 
  selectedTimelineId, 
  onTimelineSelect, 
  onTimelineAction,
  searchQuery,
  onSearchChange,
  isCollapsed, 
  onToggleCollapse,
  conversions 
}) => {
  const filteredTimelines = timelines.filter(timeline => {
    // 搜索时间线名称
    const nameMatch = timeline.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 搜索该时间线下的所有原文
    const originalTextMatch = conversions
      .filter(c => c.timelineId === timeline.id)
      .some(c => c.originalText.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return nameMatch || originalTextMatch;
  });

  return (
    <Box
      width={isCollapsed ? "60px" : "300px"}
      transition="all 0.3s ease"
      overflow="hidden"
      borderRadius="lg"
      bg="white"
      _dark={{ bg: 'gray.800' }}
      boxShadow="md"
      height="calc(100vh - 200px)"
    >
      <VStack spacing={0} align="stretch" height="100%">
        <HStack 
          p={4} 
          borderBottomWidth="1px" 
          borderColor="gray.200"
          _dark={{ borderColor: 'gray.700' }}
        >
          {!isCollapsed && <Heading size="md" flex={1}>时间线</Heading>}
          <IconButton
            aria-label={isCollapsed ? "展开侧栏" : "收起侧栏"}
            icon={isCollapsed ? <MdChevronRight /> : <MdMenu />}
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
          />
        </HStack>
        
        {!isCollapsed && (
          <VStack spacing={2} p={4} overflowY="auto" flex={1}>
            <HStack width="100%">
              <Input
                placeholder="搜索时间线和原文..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                size="sm"
                flex={1}
              />
              <IconButton
                aria-label="新建时间线"
                icon={<MdAdd />}
                size="sm"
                onClick={() => onTimelineAction(null, 'new')}
              />
            </HStack>
            <VStack spacing={2} width="100%" align="stretch">
              {filteredTimelines.map(timeline => (
                <Box
                  key={timeline.id}
                  p={3}
                  bg={selectedTimelineId === timeline.id ? 'blue.100' : 'gray.50'}
                  _dark={{
                    bg: selectedTimelineId === timeline.id ? 'blue.700' : 'gray.700'
                  }}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => onTimelineSelect(timeline)}
                  _hover={{
                    bg: selectedTimelineId === timeline.id ? 'blue.200' : 'gray.100',
                    _dark: {
                      bg: selectedTimelineId === timeline.id ? 'blue.600' : 'gray.600'
                    }
                  }}
                >
                  <VStack align="stretch" spacing={1}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" noOfLines={1}>
                        {timeline.name}
                      </Text>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="时间线选项"
                          icon={<MdMoreVert />}
                          size="sm"
                          variant="ghost"
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<MdEdit />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTimelineAction(timeline, 'rename');
                            }}
                          >
                            重命名
                          </MenuItem>
                          <MenuItem 
                            icon={<MdDelete />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTimelineAction(timeline, 'delete');
                            }}
                          >
                            删除
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                    {searchQuery && conversions
                      .filter(c => 
                        c.timelineId === timeline.id && 
                        c.originalText.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .slice(0, 2)
                      .map((c, idx) => (
                        <Text key={idx} fontSize="xs" color="gray.500" noOfLines={1}>
                          {c.originalText}
                        </Text>
                      ))
                    }
                  </VStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

// 转换历史组件
const ConversionHistory: React.FC<{
  conversions: ConversionItem[];
  onConversionAction: (conversion: ConversionItem, action: 'toggle' | 'copy') => void;
}> = ({ conversions, onConversionAction }) => {
  return (
    <VStack spacing={4} align="stretch">
      {conversions.map((conversion) => (
        <Box
          key={conversion.id}
          p={4}
          borderRadius="md"
          bg="white"
          _dark={{ bg: 'gray.700' }}
          boxShadow="sm"
        >
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <IconButton
                aria-label={conversion.isExpanded ? "收起" : "展开"}
                icon={conversion.isExpanded ? <MdExpandMore /> : <MdChevronRight />}
                size="sm"
                variant="ghost"
                onClick={() => onConversionAction(conversion, 'toggle')}
              />
              <Text fontSize="sm" color="gray.500">
                {new Date(conversion.timestamp).toLocaleString()}
              </Text>
            </HStack>
            <Box>
              <Text fontSize="sm" color="gray.500">原文：</Text>
              <Text>{conversion.originalText}</Text>
              <Text fontSize="xs" color="gray.400">
                {conversion.originalText.length} 字
              </Text>
            </Box>
            {conversion.isExpanded && (
              <VStack align="stretch" spacing={2}>
                {conversion.results.map((result, idx) => (
                  <Box key={idx}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">转换结果 {idx + 1}：</Text>
                      <IconButton
                        aria-label="复制结果"
                        icon={<MdContentCopy />}
                        size="xs"
                        variant="ghost"
                        onClick={() => onConversionAction(conversion, 'copy')}
                      />
                    </HStack>
                    <Text>{result}</Text>
                  </Box>
                ))}
              </VStack>
            )}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
};

const HomophoneConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
  const [conversions, setConversions] = useState<ConversionItem[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTimelineName, setNewTimelineName] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { toggleColorMode, colorMode } = useColorMode();
  const toast = useToast();
  const bgRef = useRef<HTMLDivElement>(null);

  // 复制文本到剪贴板
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: '已复制到剪贴板',
        status: 'success',
        duration: 1000,
        isClosable: true,
      });
    } catch (error) {
      console.error('复制失败:', error);
      toast({
        title: '复制失败',
        description: '请手动复制文本',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // 检查服务器健康状态
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'ok') {
          console.log('服务器就绪，字典大小:', data.dictionaries);
          toast({
            title: '服务器连接成功',
            description: `已加载 ${data.dictionaries.chars + data.dictionaries.words} 个字符`,
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        } else {
          throw new Error('服务器未就绪');
        }
      } catch (error) {
        console.error('检查服务器状态失败:', error);
        toast({
          title: '服务器连接失败',
          description: '请确保后端服务器正在运行',
          status: 'error',
          duration: null,
          isClosable: true,
        });
      }
    };

    checkServerHealth();
  }, [toast]);

  // 从本地存储加载数据
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const savedTimelines = localStorage.getItem('timelines');
        const savedConversions = localStorage.getItem('conversions');
        const savedSelectedTimelineId = localStorage.getItem('selectedTimelineId');

        const parsedTimelines = savedTimelines ? JSON.parse(savedTimelines) : [];
        const parsedConversions = savedConversions ? JSON.parse(savedConversions) : [];

        setTimelines(parsedTimelines);
        setConversions(parsedConversions);
        
        if (savedSelectedTimelineId) {
          setSelectedTimelineId(savedSelectedTimelineId);
        }

        // 如果没有时间线，创建默认时间线
        if (parsedTimelines.length === 0) {
          const defaultTimeline: Timeline = {
            id: crypto.randomUUID(),
            name: '默认时间线',
            createdAt: Date.now()
          };
          setTimelines([defaultTimeline]);
          setSelectedTimelineId(defaultTimeline.id);
          
          toast({
            title: '已创建默认时间线',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('加载本地数据失败:', error);
        toast({
          title: '加载数据失败',
          description: '无法从本地存储加载数据',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      }
    };

    loadFromLocalStorage();
  }, [toast]); 

  // 保存数据到本地存储
  useEffect(() => {
    if (timelines.length === 0) return; // 避免在初始化前保存空数据
    
    try {
      localStorage.setItem('timelines', JSON.stringify(timelines));
      localStorage.setItem('conversions', JSON.stringify(conversions));
      if (selectedTimelineId) {
        localStorage.setItem('selectedTimelineId', selectedTimelineId);
      }
    } catch (error) {
      console.error('保存数据到本地存储失败:', error);
      toast({
        title: '保存数据失败',
        description: '无法保存到本地存储',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  }, [timelines, conversions, selectedTimelineId, toast, timelines.length]); 

  // 创建新时间线
  const createTimeline = () => {
    const newTimeline: Timeline = {
      id: Date.now().toString(),
      name: `时间线 ${timelines.length + 1}`,
      createdAt: Date.now()
    };
    setTimelines(prev => [...prev, newTimeline]);
    setSelectedTimelineId(newTimeline.id);
  };

  // 处理时间线操作
  const handleTimelineAction = (timeline: Timeline | null, action: 'rename' | 'delete' | 'new') => {
    if (action === 'new') {
      createTimeline();
      return;
    }
    
    if (!timeline) return;

    if (action === 'rename') {
      setNewTimelineName(timeline.name);
      onOpen();
    } else if (action === 'delete') {
      setTimelines(prev => prev.filter(t => t.id !== timeline.id));
      setConversions(prev => prev.filter(c => c.timelineId !== timeline.id));
      if (selectedTimelineId === timeline.id) {
        setSelectedTimelineId(null);
      }
      toast({
        title: '已删除时间线',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // 处理转换结果操作
  const handleConversionAction = (conversion: ConversionItem, action: 'toggle' | 'copy') => {
    if (action === 'toggle') {
      setConversions(prev => prev.map(c => 
        c.id === conversion.id
          ? { ...c, isExpanded: !c.isExpanded }
          : c
      ));
    } else if (action === 'copy') {
      handleCopy(conversion.results[0]);
    }
  };

  // 转换文本
  const handleConvert = async () => {
    if (!selectedTimelineId) {
      toast({
        title: '请先选择时间线',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const text = input.trim();
    if (!text) {
      toast({
        title: '请输入要转换的文字',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // 提取中文字符和位置
    const { chinese, positions } = extractChineseCharacters(text);
    if (!chinese) {
      toast({
        title: '未找到中文字符',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: chinese,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // 将转换后的中文字符放回原位置
      const convertedResults = data.results.map((result: string) => 
        insertConvertedChinese(text, result, positions)
      );

      // 添加新的转换结果
      const newConversion: ConversionItem = {
        id: Date.now().toString(),
        timelineId: selectedTimelineId,
        originalText: text,
        results: convertedResults,
        timestamp: Date.now(),
        isExpanded: true
      };

      setConversions(prev => [newConversion, ...prev]);

      toast({
        title: '转换完成',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('转换失败:', error);
      toast({
        title: '转换失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 工具函数：提取中文字符
  const extractChineseCharacters = (text: string): { chinese: string, positions: number[] } => {
    const chinese: string[] = [];
    const positions: number[] = [];
    const regex = /[\u4e00-\u9fa5]/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      chinese.push(match[0]);
      positions.push(match.index);
    }
    
    return { chinese: chinese.join(''), positions };
  };

  // 工具函数：将转换后的中文字符放回原位置
  const insertConvertedChinese = (originalText: string, convertedChinese: string, positions: number[]): string => {
    const result = originalText.split('');
    for (let i = 0; i < positions.length && i < convertedChinese.length; i++) {
      result[positions[i]] = convertedChinese[i];
    }
    return result.join('');
  };

  // 在组件加载时检查并创建默认时间线
  useEffect(() => {
    const initializeTimeline = async () => {
      try {
        // 检查是否有时间线
        if (timelines.length === 0) {
          // 创建默认时间线
          const defaultTimeline: Timeline = {
            id: crypto.randomUUID(),
            name: '默认时间线',
            createdAt: Date.now()
          };
          setTimelines([defaultTimeline]);
          setSelectedTimelineId(defaultTimeline.id);
          
          toast({
            title: '已创建默认时间线',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('初始化时间线失败:', error);
        toast({
          title: '初始化时间线失败',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      }
    };

    initializeTimeline();
  }, [timelines.length, toast]);

  return (
    <>
      <GradientBackground
        ref={bgRef}
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={-1}
        opacity={0.15}
        transition="all 0.5s ease"
        css={{
          background: useColorModeValue(
            'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
            'linear-gradient(-45deg, #1a1c20, #2d3436, #2c3e50, #243447)'
          ),
          backgroundSize: '400% 400%',
          animation: `${gradientAnimation} 15s ease infinite`,
        }}
      />
      <Container maxW="container.xl" py={10} px={4}>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>重命名时间线</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                value={newTimelineName}
                onChange={(e) => setNewTimelineName(e.target.value)}
                placeholder="输入新的时间线名称"
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={() => {
                if (selectedTimelineId && newTimelineName.trim()) {
                  setTimelines(prev => prev.map(t => 
                    t.id === selectedTimelineId
                      ? { ...t, name: newTimelineName.trim() }
                      : t
                  ));
                  onClose();
                  toast({
                    title: '已重命名时间线',
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                  });
                }
              }}>
                确认
              </Button>
              <Button variant="ghost" onClick={onClose}>取消</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Box position="relative" mb={6}>
          <GradientText>
            中文同音字转换器
          </GradientText>
          <IconButton
            aria-label="切换深浅色主题"
            icon={colorMode === 'light' ? <MdDarkMode /> : <MdLightMode />}
            position="absolute"
            right="0"
            top="50%"
            transform="translateY(-50%)"
            onClick={() => {
              if (!bgRef.current) return;
              
              const rect = (document.body as HTMLElement).getBoundingClientRect();
              const buttonX = rect.left + rect.width / 2;
              const buttonY = rect.top + rect.height / 2;
              
              bgRef.current.style.transformOrigin = `${buttonX}px ${buttonY}px`;
              bgRef.current.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
              bgRef.current.style.transform = 'scale(0)';
              bgRef.current.style.opacity = '0';
              
              toggleColorMode();
              
              requestAnimationFrame(() => {
                if (!bgRef.current) return;
                bgRef.current.style.transform = 'scale(1)';
                bgRef.current.style.opacity = '0.15';
              });
            }}
            variant="ghost"
            _hover={{ bg: 'transparent' }}
          />
        </Box>

        <HStack spacing={6} align="flex-start">
          {/* 左侧时间线列表 */}
          <TimelineList
            timelines={timelines}
            selectedTimelineId={selectedTimelineId}
            onTimelineSelect={(timeline) => {
              setSelectedTimelineId(timeline.id);
            }}
            onTimelineAction={handleTimelineAction}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            conversions={conversions}
          />

          {/* 右侧主要内容区 */}
          <VStack flex={1} spacing={6} align="stretch">
            <VStack width="100%" spacing={4}>
              <Box width="100%" position="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="请输入要转换的文字..."
                  size="lg"
                  rows={6}
                />
                <HStack 
                  position="absolute" 
                  bottom={2} 
                  right={2} 
                  spacing={2}
                  bg="white" 
                  _dark={{ bg: 'gray.800' }}
                  px={2} 
                  py={1} 
                  borderRadius="md"
                  fontSize="xs"
                  color="gray.500"
                >
                  <Text>中文：{extractChineseCharacters(input).chinese.length}</Text>
                  <Text>总字符：{input.length}</Text>
                </HStack>
              </Box>
              <Button
                colorScheme="blue"
                onClick={handleConvert}
                isLoading={isLoading}
                loadingText="转换中..."
                width="100%"
                isDisabled={!selectedTimelineId}
              >
                转换
              </Button>
            </VStack>

            {/* 转换历史 */}
            {selectedTimelineId && (
              <Box>
                <Heading size="md" mb={4}>转换历史</Heading>
                <ConversionHistory
                  conversions={conversions.filter(c => c.timelineId === selectedTimelineId)}
                  onConversionAction={handleConversionAction}
                />
              </Box>
            )}
          </VStack>
        </HStack>
      </Container>
    </>
  );
};

export default HomophoneConverter;
