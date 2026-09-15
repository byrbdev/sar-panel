'use client';
import { useCallback } from 'react';
import { useMember } from 'context/MemberContext';
import { useAppData } from 'context/AppDataContext';

/**
 * Mencari nama Member dari id-nya. Dipakai untuk menampilkan kolom/label
 * "Member" di tabel & overlay (Pesanan Masuk, Penjualan, Refund) supaya
 * jelas data ini milik member dan toko siapa.
 */
export const useMemberName = () => {
  const { member } = useMember();
  const { toko } = useAppData();

  /** Cari nama member berdasarkan id-nya langsung */
  const byId = useCallback(
    (id?: string) => {
      if (!id) return '-';
      return member.find((m) => m.id === id)?.nama || '-';
    },
    [member],
  );

  /** Cari nama member berdasarkan nama toko (fallback kalau id kosong) */
  const byToko = useCallback(
    (namaToko?: string) => {
      if (!namaToko) return '-';
      const t = toko.find((x) => x.namaToko === namaToko);
      if (!t) return '-';
      if (t.ownerId) {
        return member.find((m) => m.id === t.ownerId)?.nama || t.nama || '-';
      }
      return t.nama || '-';
    },
    [toko, member],
  );

  /** Utama: pakai id kalau ada, kalau tidak fallback ke nama toko */
  const resolve = useCallback(
    (id?: string, namaToko?: string) => {
      const fromId = byId(id);
      if (fromId !== '-') return fromId;
      return byToko(namaToko);
    },
    [byId, byToko],
  );

  return { byId, byToko, resolve };
};
