'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppData } from 'context/AppDataContext';
import { useAuth } from 'context/AuthContext';
import { useMemberName } from 'hooks/useMemberName';
import { perluResi } from 'variables/dropshipResi';

export type SearchResult = { title: string; subtitle: string };
export type ShippingNotif = {
  id: string;
  /** 'resi' = resi sudah diisi (untuk Member). 'followup' = Member minta
   * resi diisi (untuk Admin/Super Admin). Kosong dianggap 'resi'. */
  kind?: 'resi' | 'followup';
  /** Hanya untuk kind 'followup': penjualan yang harus diisi resinya */
  penjualanId?: string;
  memberName?: string;
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
  const { penjualan, orders, refund, followUps } = useAppData();
  const { profile } = useAuth();
  const { resolve: resolveMember } = useMemberName();
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
        p.noPesananAL,
        ...(p.produkList || []).map((x) => x.namaProduk),
        ...(p.produkList || []).map((x) => x.skuProduk),
      ]
        .join(' ')
        .toLowerCase();
      if (haystack.includes(t)) {
        const jumlahProduk = 1 + (p.produkList?.length || 0);
        out.push({
          title: `${p.namaProduk}${jumlahProduk > 1 ? ` +${jumlahProduk - 1} lainnya` : ''} — ${p.namaToko}`,
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
    // Admin & Super Admin: notifikasi "Follow Up Resi" dari Member. Otomatis
    // hilang begitu resi penjualan tsb sudah diisi.
    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      const latestByPenjualan = new Map<string, (typeof followUps)[number]>();
      followUps.forEach((f) => {
        const cur = latestByPenjualan.get(f.penjualanId);
        if (
          !cur ||
          new Date(f.createdAt).getTime() > new Date(cur.createdAt).getTime()
        ) {
          latestByPenjualan.set(f.penjualanId, f);
        }
      });
      const out: ShippingNotif[] = [];
      latestByPenjualan.forEach((f) => {
        const p = penjualan.find((x) => x.id === f.penjualanId);
        if (!p || !perluResi(p)) return;
        out.push({
          id: `fu-${f.id}`,
          kind: 'followup',
          penjualanId: p.id,
          memberName: resolveMember(p.ownerId, p.namaToko),
          produk: p.namaProduk,
          namaToko: p.namaToko,
          noResi: '',
          jasaPengiriman: '',
          noPesananAL: p.noPesananAL || f.noPesananAL,
          resiUpdatedAt: f.createdAt,
        });
      });
      return out.sort(
        (a, b) =>
          new Date(b.resiUpdatedAt || 0).getTime() -
          new Date(a.resiUpdatedAt || 0).getTime(),
      );
    }

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
  }, [penjualan, profile, followUps, resolveMember]);

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

  const isRead = useCallback((id: string) => readIds.includes(id), [readIds]);

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

  // Tandai SATU notifikasi saja sudah dibaca (dipanggil saat notifikasi itu
  // diklik). Badge merah berkurang satu-satu sesuai notifikasi mana yang
  // sudah dibuka, bukan langsung nol semua begitu dropdown dibuka.
  const markOneRead = useCallback(
    (id: string) => {
      setReadIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* abaikan bila localStorage tidak tersedia */
        }
        return next;
      });
    },
    [storageKey],
  );

  return {
    results,
    notifications,
    unreadCount,
    isRead,
    markAllRead,
    markOneRead,
    selectedNotif,
    setSelectedNotif,
  };
};
