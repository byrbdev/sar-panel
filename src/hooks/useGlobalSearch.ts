'use client';
import { useMemo, useState } from 'react';
import { useAppData } from 'context/AppDataContext';
import { useAuth } from 'context/AuthContext';

export type SearchResult = { title: string; subtitle: string };
export type ShippingNotif = {
  id: string;
  produk: string;
  namaToko: string;
  noResi: string;
  jasaPengiriman: string;
};

/**
 * Search multi-field (no pesanan/resi, nama toko, produk, pembeli) di
 * seluruh Penjualan, Pesanan Masuk, dan Refund. Juga menyediakan daftar
 * "notifikasi" pengiriman untuk Member (transaksi miliknya yang sudah
 * diisi No Resi oleh Admin).
 */
export const useGlobalSearch = (term: string) => {
  const { penjualan, orders, refund } = useAppData();
  const { profile } = useAuth();
  const [selectedNotif, setSelectedNotif] = useState<ShippingNotif | null>(
    null,
  );

  const results: SearchResult[] = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (t.length < 2) return [];
    const out: SearchResult[] = [];

    penjualan.forEach((p) => {
      const haystack = [
        p.namaToko,
        p.namaProduk,
        p.namaPembeli,
        p.noResi,
        p.skuProduk,
      ]
        .join(' ')
        .toLowerCase();
      if (haystack.includes(t)) {
        out.push({
          title: `${p.namaProduk} — ${p.namaToko}`,
          subtitle: `Penjualan • ${p.namaPembeli} • Resi: ${p.noResi || '-'}`,
        });
      }
    });

    orders.forEach((o) => {
      const haystack = [o.nama, o.toko, o.produk, o.sku]
        .join(' ')
        .toLowerCase();
      if (haystack.includes(t)) {
        out.push({
          title: `${o.produk} — ${o.toko}`,
          subtitle: `Pesanan Masuk • ${o.nama}`,
        });
      }
    });

    refund.forEach((r) => {
      const haystack = [r.nama, r.namaToko, r.noPesananAL, r.noPesananSHP]
        .join(' ')
        .toLowerCase();
      if (haystack.includes(t)) {
        out.push({
          title: `${r.namaToko} — ${r.nama}`,
          subtitle: `Refund • AL: ${r.noPesananAL || '-'}`,
        });
      }
    });

    return out.slice(0, 20);
  }, [term, penjualan, orders, refund]);

  const notifications: ShippingNotif[] = useMemo(() => {
    if (profile?.role !== 'member') return [];
    return penjualan
      .filter((p) => p.ownerId === profile.id && p.noResi)
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        produk: p.namaProduk,
        namaToko: p.namaToko,
        noResi: p.noResi,
        jasaPengiriman: p.jasaPengiriman,
      }));
  }, [penjualan, profile]);

  return { results, notifications, selectedNotif, setSelectedNotif };
};
