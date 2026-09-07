import React from 'react';

// Icon Imports
import {
  MdHome,
  MdStorefront,
  MdPointOfSale,
  MdAssignmentReturn,
  MdPeopleAlt,
  MdInsights,
  MdWhatshot,
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
    name: 'Refund',
    layout: '/admin',
    path: 'refund',
    icon: <MdAssignmentReturn className="h-6 w-6" />,
    roles: ['super_admin', 'admin'],
  },
  {
    name: 'Data Buyer',
    layout: '/admin',
    path: 'data-buyer',
    icon: <MdPeopleAlt className="h-6 w-6" />,
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
    roles: ['super_admin'],
  },
];

/** Filter menu sidebar sesuai role. Super admin selalu dapat semua (tidak diubah). */
export const getRoutesForRole = (role?: string) => {
  if (!role || role === 'super_admin') return routes;
  return routes.filter((r) => r.roles.includes(role as any));
};

export default routes;
