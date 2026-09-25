'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppData } from 'context/AppDataContext';
import { useAuth } from 'context/AuthContext';

export type SearchResult = { title: string; subtitle: string };
export type ShippingNotif = {
  id: string;
  produk: string;
  namaToko: string;
  noResi: string;
  jasaPengiriman: string;
  noPesananAL: string;
  resiUpdatedAt?: string;
};

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

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
    const now = Date.now();
    return penjualan
      .filter((p) => {
        if (p.ownerId !== profile.id) return false;
        if (!p.noResi || p.noResi.trim() === '' || p.noResi.trim() === '-')
          return false;
        // Notifikasi otomatis "kedaluwarsa" 3 hari setelah resi diisi —
        // ini beneran dihitung dari `resi_updated_at` yang tersimpan di
        // database (diisi otomatis lewat trigger), bukan cuma state di
        // browser, jadi tetap konsisten walau di-refresh atau dibuka dari
        // perangkat lain.
        if (!p.resiUpdatedAt) return true; // data lama sebelum migrasi, tetap tampilkan
        const updatedAt = new Date(p.resiUpdatedAt).getTime();
        if (Number.isNaN(updatedAt)) return true;
        return now - updatedAt <= THREE_DAYS_MS;
      })
      .sort((a, b) => {
        const ta = a.resiUpdatedAt ? new Date(a.resiUpdatedAt).getTime() : 0;
        const tb = b.resiUpdatedAt ? new Date(b.resiUpdatedAt).getTime() : 0;
        return tb - ta; // terbaru dulu
      })
      .map((p) => ({
        id: p.id,
        produk: p.namaProduk,
        namaToko: p.namaToko,
        noResi: p.noResi,
        jasaPengiriman: p.jasaPengiriman,
        noPesananAL: p.noPesananAL,
        resiUpdatedAt: p.resiUpdatedAt,
      }));
  }, [penjualan, profile]);

  // Tandai sudah dibaca — disimpan per-user di localStorage supaya titik
  // merah tidak muncul lagi setelah notifikasi dibuka.
  const storageKey = `notif_read_${profile?.id || 'anon'}`;
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      setReadIds(raw ? JSON.parse(raw) : []);
    } catch {
      setReadIds([]);
    }
  }, [storageKey]);

  const unreadCount = notifications.filter(
    (n) => !readIds.includes(n.id),
  ).length;

  const markAllRead = useCallback(() => {
    const ids = notifications.map((n) => n.id);
    setReadIds(ids);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(ids));
    } catch {
      /* abaikan bila localStorage tidak tersedia */
    }
  }, [notifications, storageKey]);

  return {
    results,
    notifications,
    unreadCount,
    markAllRead,
    selectedNotif,
    setSelectedNotif,
  };
};
