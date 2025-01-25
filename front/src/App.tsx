import React from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import HomophoneConverterComponent from './components/HomophoneConverter';
import theme from './theme';

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <HomophoneConverterComponent />
    </ChakraProvider>
  );
};

export default App;
