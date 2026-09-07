'use client';
// Layout components
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import routes, { getRoutesForRole } from 'routes';
import {
  getActiveNavbar,
  getActiveRoute,
  isWindowAvailable,
} from 'utils/navigation';
import React from 'react';
import Navbar from 'components/navbar';
import Sidebar from 'components/sidebar';
import Footer from 'components/footer/Footer';
import { AppDataProvider } from 'context/AppDataContext';
import { UIProvider } from 'context/UIContext';
import { BrutalProvider } from 'context/BrutalContext';
import { MemberProvider } from 'context/MemberContext';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabaseClient';

export default function Admin({ children }: { children: React.ReactNode }) {
  // states and functions
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useAuth();
  if (isWindowAvailable()) document.documentElement.dir = 'ltr';

  React.useEffect(() => {
    if (isSupabaseConfigured && !loading && !profile) {
      router.replace('/auth/sign-in');
    }
  }, [loading, profile, router]);

  // Selama Supabase belum dikonfigurasi (mode pengembangan lokal), tampilkan
  // semua menu apa adanya (perilaku super admin) supaya tetap bisa dites.
  const visibleRoutes = isSupabaseConfigured
    ? getRoutesForRole(profile?.role)
    : routes;

  if (isSupabaseConfigured && loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-lightPrimary dark:bg-navy-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">Memuat...</p>
      </div>
    );
  }

  if (isSupabaseConfigured && !profile) {
    return null; // sedang redirect ke /auth/sign-in
  }

  return (
    <UIProvider>
    <MemberProvider>
    <AppDataProvider>
    <BrutalProvider>
    <div className="flex h-full w-full bg-background-100 dark:bg-background-900">
      <Sidebar routes={visibleRoutes} open={open} setOpen={setOpen} variant="admin" />
      {/* Navbar & Main Content */}
      <div className="h-full w-full font-dm dark:bg-navy-900">
        {/* Main Content */}
        <main
          className={`mx-2.5  flex-none transition-all dark:bg-navy-900 
              md:pr-2 xl:ml-[323px]`}
        >
          {/* Routes */}
          <div>
            <Navbar
              onOpenSidenav={() => setOpen(!open)}
              brandText={getActiveRoute(visibleRoutes, pathname)}
              secondary={getActiveNavbar(visibleRoutes, pathname)}
            />
            <div className="mx-auto min-h-screen p-2 !pt-[10px] md:p-2">
              {children}
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
    </BrutalProvider>
    </AppDataProvider>
    </MemberProvider>
    </UIProvider>
  );
}
