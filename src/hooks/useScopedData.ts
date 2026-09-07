'use client';
import { useAppData } from 'context/AppDataContext';
import { useAuth } from 'context/AuthContext';

/**
 * Mengembalikan data yang sudah difilter sesuai role user yang login.
 * - super_admin & admin: lihat semua data apa adanya.
 * - member: hanya lihat toko/penjualan/refund/order miliknya sendiri
 *   (dicocokkan lewat ownerId / reporterId yang di-set saat data dibuat).
 *
 * Catatan: filter ini juga akan dicerminkan di Row Level Security Supabase,
 * jadi walau logic di sini "dilewati" secara manual, database tetap menolak
 * baris yang bukan miliknya.
 */
export const useScopedData = () => {
  const { toko, orders, penjualan, refund, ...rest } = useAppData();
  const { profile } = useAuth();

  const isMember = profile?.role === 'member';
  const myId = profile?.id;

  const scopedToko = isMember ? toko.filter((t) => t.ownerId === myId) : toko;
  const scopedOrders = isMember
    ? orders.filter((o) => o.reporterId === myId)
    : orders;
  const scopedPenjualan = isMember
    ? penjualan.filter((p) => p.ownerId === myId)
    : penjualan;
  const scopedRefund = isMember
    ? refund.filter((r) => r.ownerId === myId)
    : refund;

  return {
    ...rest,
    toko: scopedToko,
    orders: scopedOrders,
    penjualan: scopedPenjualan,
    refund: scopedRefund,
    // data mentah (tidak difilter) — dipakai admin/super_admin, atau saat
    // perlu tahu daftar toko lengkap untuk keperluan dropdown, dll.
    allToko: toko,
    allOrders: orders,
    allPenjualan: penjualan,
    allRefund: refund,
    isMember,
  };
};
