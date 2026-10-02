import React from 'react';

// Icon Imports
import {
  MdHome,
  MdStorefront,
  MdPointOfSale,
  MdLocalShipping,
  MdAssignmentReturn,
  MdCampaign,
  MdInsights,
  MdWhatshot,
  MdGavel,
  MdGroups,
  MdSettings,
} from 'react-icons/md';

const routes = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: 'default',
    icon: <MdHome className="h-6 w-6" />,
    roles: ['super_admin', 'admin', 'member'],
  },
  {
    name: 'Toko',
    layout: '/admin',
    path: 'pemulihan',
    icon: <MdStorefront className="h-6 w-6" />,
    roles: ['super_admin'],
  },
  {
    name: 'Penjualan',
    layout: '/admin',
    path: 'penjualan',
    icon: <MdPointOfSale className="h-6 w-6" />,
    roles: ['super_admin', 'admin', 'member'],
  },
  {
    name: 'Resi',
    layout: '/admin',
    path: 'resi',
    icon: <MdLocalShipping className="h-6 w-6" />,
    roles: ['super_admin', 'admin', 'member'],
  },
  {
    name: 'Refund',
    layout: '/admin',
    path: 'refund',
    icon: <MdAssignmentReturn className="h-6 w-6" />,
    roles: ['super_admin', 'admin', 'member'],
  },
  {
    name: 'Iklan',
    layout: '/admin',
    path: 'iklan',
    icon: <MdCampaign className="h-6 w-6" />,
    roles: ['super_admin'],
  },
  {
    name: 'Analisa',
    layout: '/admin',
    path: 'analisa',
    icon: <MdInsights className="h-6 w-6" />,
    roles: ['super_admin', 'member'],
  },
  {
    name: 'Brutal',
    layout: '/admin',
    path: 'brutal',
    icon: <MdWhatshot className="h-6 w-6" />,
    roles: ['super_admin', 'member'],
  },
  {
    name: 'Denda',
    layout: '/admin',
    path: 'denda',
    icon: <MdGavel className="h-6 w-6" />,
    // Khusus member: super admin melihat & mengelola denda di halaman Toko
    // (section "Denda Toko"), jadi menu ini tidak ditampilkan untuknya.
    roles: ['member'],
  },
  {
    name: 'Member',
    layout: '/admin',
    path: 'member',
    icon: <MdGroups className="h-6 w-6" />,
    roles: ['super_admin'],
  },
  {
    name: 'Setting',
    layout: '/admin',
    path: 'setting',
    icon: <MdSettings className="h-6 w-6" />,
    roles: ['super_admin', 'admin', 'member'],
  },
];

/** Filter menu sidebar sesuai role. Super admin selalu dapat semua (tidak diubah). */
export const getRoutesForRole = (role?: string) => {
  if (!role) return routes;
  // Super admin tetap dapat semua menu, KECUALI menu yang memang khusus
  // role lain dan tidak mencantumkan 'super_admin' di `roles` (mis. Denda).
  return routes.filter((r) => r.roles.includes(role as any));
};

/**
 * Guard akses di LEVEL HALAMAN (bukan cuma sembunyikan menu di sidebar).
 * Tanpa ini, role yang tidak berhak (mis. "admin") tetap bisa membuka
 * halaman seperti /admin/pemulihan (Toko) atau /admin/brutal langsung lewat
 * URL meskipun menunya sudah disembunyikan dari sidebar.
 */
export const isRouteAllowed = (pathname: string, role?: string): boolean => {
  if (!pathname) return true;
  if (!role || role === 'super_admin') return true;
  const matched = routes.find((r) => pathname.startsWith(`${r.layout}/${r.path}`));
  if (!matched) return true; // halaman di luar daftar (profile, pesanan-masuk, dll) tidak dibatasi di sini
  return matched.roles.includes(role as any);
};

export default routes;
