'use client';
import React, { createContext, useContext } from 'react';
import { BrutalItem } from 'variables/dropshipBrutal';
import { useSyncedTable } from 'hooks/useSyncedTable';

type BrutalContextType = {
  items: BrutalItem[];
  setItems: React.Dispatch<React.SetStateAction<BrutalItem[]>>;
};

const BrutalContext = createContext<BrutalContextType | null>(null);

const brutalToDb = (b: BrutalItem) => ({
  id: b.id,
  anggota_id: b.anggotaId || null,
  nama_toko: b.namaToko,
  kategori_toko: b.kategoriToko,
  produk: b.produk,
  status: b.status,
  iklan: b.iklan,
  orderan: b.orderan,
  sku: b.sku,
  jumlah_terjual: b.jumlahTerjual,
  ulasan_produk: b.ulasanProduk,
  review_produk: b.reviewProduk,
  rating_toko: b.ratingToko,
  pelanggaran: b.pelanggaran,
  keterangan: b.keterangan,
});

const brutalFromDb = (r: any): BrutalItem => ({
  id: String(r.id),
  anggotaId: r.anggota_id || '',
  namaToko: r.nama_toko || '',
  kategoriToko: r.kategori_toko || '',
  produk: r.produk || '',
  status: r.status || 'Muncul',
  iklan: r.iklan || 'Iklan',
  orderan: r.orderan || '',
  sku: r.sku || '',
  jumlahTerjual: r.jumlah_terjual || '',
  ulasanProduk: r.ulasan_produk || '',
  reviewProduk: r.review_produk || '',
  ratingToko: r.rating_toko || '',
  pelanggaran: r.pelanggaran || '',
  keterangan: r.keterangan || '',
  tanggal: r.tanggal
    ? new Date(r.tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '',
});

export const BrutalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [items, setItems] = useSyncedTable<BrutalItem>(
    'brutal_items',
    [],
    brutalToDb,
    brutalFromDb,
    true,
  );

  return (
    <BrutalContext.Provider value={{ items, setItems }}>
      {children}
    </BrutalContext.Provider>
  );
};

export const useBrutal = () => {
  const ctx = useContext(BrutalContext);
  if (!ctx) throw new Error('useBrutal must be used within BrutalProvider');
  return ctx;
};
