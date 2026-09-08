import React, { ReactNode } from 'react';
import AppWrappers from './AppWrappers';
import type { Metadata } from 'next';
// import '@asseinfo/react-kanban/dist/styles.css';
// import '/public/styles/Plugins.css';

export const metadata: Metadata = {
  title: 'SAR Panel By RB',
  description: 'SAR Panel By RB',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body id={'root'}>
        <AppWrappers>{children}</AppWrappers>
      </body>
    </html>
  );
}
