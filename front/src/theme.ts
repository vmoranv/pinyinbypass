import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: (props: any) => ({
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
      }),
    },
    Input: {
      baseStyle: (props: any) => ({
        field: {
          _focus: {
            boxShadow: props.colorMode === 'dark' 
              ? '0 0 0 3px rgba(66, 153, 225, 0.6)' 
              : '0 0 0 3px rgba(66, 153, 225, 0.6)',
          },
        },
      }),
    },
  },
});

export default theme;
