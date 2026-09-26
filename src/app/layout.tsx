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
      <head>
        {/* Terapkan dark mode SEBELUM React hydrate, supaya tidak ada
            "flash" tema salah saat refresh/buka halaman baru. Preferensi
            disimpan di localStorage ('theme': 'dark' | 'light') begitu
            user menekan tombol dark/light mode di Navbar, dan di sinilah
            preferensi itu dibaca lagi tiap kali web dibuka/di-refresh. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark');document.body.classList.add('dark');}else if(t==='light'){document.documentElement.classList.remove('dark');document.body.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body id={'root'}>
        <AppWrappers>{children}</AppWrappers>
      </body>
    </html>
  );
}
