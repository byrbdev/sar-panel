'use client';
import { useMemo } from 'react';
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
 *
 * Semua filter di-memoize (useMemo) supaya tidak menghitung ulang di setiap
 * render — penting untuk performa saat data sudah banyak.
 */
export const useScopedData = () => {
  const { toko, orders, penjualan, refund, ...rest } = useAppData();
  const { profile } = useAuth();

  const isMember = profile?.role === 'member';
  const myId = profile?.id;

  const scopedToko = useMemo(
    () => (isMember ? toko.filter((t) => t.ownerId === myId) : toko),
    [isMember, myId, toko],
  );
  const scopedOrders = useMemo(
    () => (isMember ? orders.filter((o) => o.reporterId === myId) : orders),
    [isMember, myId, orders],
  );
  const scopedPenjualan = useMemo(
    () => (isMember ? penjualan.filter((p) => p.ownerId === myId) : penjualan),
    [isMember, myId, penjualan],
  );
  const scopedRefund = useMemo(
    () => (isMember ? refund.filter((r) => r.ownerId === myId) : refund),
    [isMember, myId, refund],
  );

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
