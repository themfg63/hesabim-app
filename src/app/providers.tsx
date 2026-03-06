'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';

const theme = createTheme({
  colors: {
    ivosis: [
      '#effafc',
      '#d6f3f7',
      '#b3e6ee',
      '#7ed2e2',
      '#42b6ce',
      '#279ab3',
      '#24809c',
      '#23657b',
      '#245366',
      '#224657',
    ],
    natural: [
      '#f6f6f6',
      '#e7e7e7',
      '#d1d1d1',
      '#b0b0b0',
      '#888888',
      '#6d6d6d',
      '#5d5d5d',
      '#4f4f4f',
      '#454545',
      '#3d3d3d',
    ],
  },
  primaryColor: 'ivosis',
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
