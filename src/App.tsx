import {
  Box,
} from '@chakra-ui/react';
import { Provider } from './Sp/ui/provider';
import SpaceRouter from './pages/auth';

// @ts-expect-error: to ignore empy import react 
import React, { useEffect } from 'react';
// import keyboard_callback, { handleSpecialShortCuts } from './utils/shortcut';
import Informator from './components/info';
import { NavigateSetter } from './utils/history';
import { LightMode } from './Sp/ui/color-mode';

function App() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
    <>
      <Provider>
        <LightMode>
          <Box
            position="fixed"
            left={0}
            right={0}
            zIndex={10}
            >
            <NavigateSetter />
            <Informator
              type={'info'}
              msg={'Приветствуем тебя в Space!'}
              />
          </Box>
          <SpaceRouter />
        </LightMode>
      </Provider>
    </>
  );
}

export default App;