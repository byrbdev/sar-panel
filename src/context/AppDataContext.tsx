'use client';
import React, { createContext, useContext } from 'react';
import { OrderRow } from 'variables/dropshipTables';
import { Penjualan } from 'variables/dropshipPenjualan';
import { RefundRow } from 'variables/dropshipRefund';
import { PemulihanRow } from 'variables/dropshipPemulihan';
import { useSyncedTable } from 'hooks/useSyncedTable';

type AppDataContextType = {
  toko: PemulihanRow[];
  setToko: React.Dispatch<React.SetStateAction<PemulihanRow[]>>;
  orders: OrderRow[];
  setOrders: React.Dispatch<React.SetStateAction<OrderRow[]>>;
  penjualan: Penjualan[];
  setPenjualan: React.Dispatch<React.SetStateAction<Penjualan[]>>;
  refund: RefundRow[];
  setRefund: React.Dispatch<React.SetStateAction<RefundRow[]>>;
  addPenjualanFromOrder: (order: OrderRow) => void;
  getTokoEmail: (namaToko: string) => string;
  getTokoOwner: (namaToko: string) => string;
};

const AppDataContext = createContext<AppDataContextType | null>(null);

/* ============== Mapper: Toko ============== */
const tokoToDb = (t: PemulihanRow) => ({
  id: t.id,
  owner_id: t.ownerId || null,
  nama: t.nama,
  email: t.email,
  metode: t.metode,
  nama_toko: t.namaToko,
  denda: t.denda,
  pelanggaran: t.pelanggaran,
  saldo_iklan: t.saldoIklan,
});
const tokoFromDb = (r: any): PemulihanRow => ({
  id: r.id,
  ownerId: r.owner_id || undefined,
  nama: r.nama,
  email: r.email,
  metode: r.metode,
  namaToko: r.nama_toko,
  denda: Number(r.denda) || 0,
  pelanggaran: r.pelanggaran || '-',
  saldoIklan: Number(r.saldo_iklan) || 0,
});

/* ============== Mapper: Pesanan Masuk (orders) ============== */
const orderToDb = (o: OrderRow) => ({
  id: o.id,
  reporter_id: o.reporterId || null,
  nama: o.nama,
  toko: o.toko,
  produk: o.produk,
  varian: o.varian,
  sku: o.sku,
  no_hp: o.noHp,
  alamat: o.alamat,
  keterangan: o.keterangan,
  harga_jual: o.hargaJual,
  modal: o.modal,
});
const orderFromDb = (r: any): OrderRow => ({
  id: String(r.id),
  reporterId: r.reporter_id || undefined,
  nama: r.nama,
  toko: r.toko,
  produk: r.produk,
  varian: r.varian || '',
  sku: r.sku || '',
  noHp: r.no_hp || '',
  alamat: r.alamat || '',
  keterangan: r.keterangan || '',
  hargaJual: Number(r.harga_jual) || 0,
  modal: Number(r.modal) || 0,
  tanggal: r.tanggal
    ? new Date(r.tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '',
});

/* ============== Mapper: Penjualan ============== */
const penjualanToDb = (p: Penjualan) => ({
  id: p.id,
  owner_id: p.ownerId || null,
  nama_toko: p.namaToko,
  nama_pembeli: p.namaPembeli,
  no_hp: p.noHp,
  alamat_pembeli: p.alamatPembeli,
  nama_produk: p.namaProduk,
  sku_produk: p.skuProduk,
  harga_jual: p.hargaJual,
  modal_shopee: p.modalShopee,
  no_resi: p.noResi,
  jasa_pengiriman: p.jasaPengiriman,
  status_pengiriman: p.statusPengiriman,
  status_akun_toko: p.statusAkunToko,
});
const penjualanFromDb = (r: any): Penjualan => ({
  id: String(r.id),
  ownerId: r.owner_id || undefined,
  namaToko: r.nama_toko,
  namaPembeli: r.nama_pembeli || '',
  noHp: r.no_hp || '',
  alamatPembeli: r.alamat_pembeli || '',
  namaProduk: r.nama_produk || '',
  skuProduk: r.sku_produk || '',
  hargaJual: Number(r.harga_jual) || 0,
  modalShopee: Number(r.modal_shopee) || 0,
  noResi: r.no_resi || '',
  jasaPengiriman: r.jasa_pengiriman || '',
  statusPengiriman: r.status_pengiriman || 'Terkirim',
  statusAkunToko: r.status_akun_toko || 'Aktif',
  tanggalTransaksi: r.tanggal_transaksi
    ? new Date(r.tanggal_transaksi).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '',
});

/* ============== Mapper: Refund ============== */
const refundToDb = (r: RefundRow) => ({
  id: r.id,
  owner_id: r.ownerId || null,
  nama: r.nama,
  nama_toko: r.namaToko,
  email_toko: r.emailToko,
  no_hp: r.noHp,
  sku: r.sku,
  no_pesanan_al: r.noPesananAL,
  no_pesanan_shp: r.noPesananSHP,
  update_no_pesanan: r.updateNoPesanan,
  alasan: r.alasan,
  keterangan: r.keterangan,
  status: r.status,
  nama_produk: r.namaProduk || null,
  omzet: r.omzet ?? null,
  profit: r.profit ?? null,
  alamat: r.alamat || null,
});
const refundFromDb = (r: any): RefundRow => ({
  id: String(r.id),
  ownerId: r.owner_id || undefined,
  nama: r.nama,
  namaToko: r.nama_toko,
  emailToko: r.email_toko || '',
  noHp: r.no_hp || '',
  sku: r.sku || '',
  noPesananAL: r.no_pesanan_al || '-',
  noPesananSHP: r.no_pesanan_shp || '-',
  updateNoPesanan: r.update_no_pesanan || '-',
  alasan: r.alasan || 'Refund',
  keterangan: r.keterangan || '',
  status: r.status || 'Belum',
  namaProduk: r.nama_produk || undefined,
  omzet: r.omzet !== null ? Number(r.omzet) : undefined,
  profit: r.profit !== null ? Number(r.profit) : undefined,
  alamat: r.alamat || undefined,
  tanggal: r.tanggal
    ? new Date(r.tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '',
});

export const AppDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toko, setToko] = useSyncedTable<PemulihanRow>(
    'toko',
    [],
    tokoToDb,
    tokoFromDb,
    true,
  );
  const [orders, setOrders] = useSyncedTable<OrderRow>(
    'pesanan_masuk',
    [],
    orderToDb,
    orderFromDb,
    true,
  );
  const [penjualan, setPenjualan] = useSyncedTable<Penjualan>(
    'penjualan',
    [],
    penjualanToDb,
    penjualanFromDb,
    true,
  );
  const [refund, setRefund] = useSyncedTable<RefundRow>(
    'refund',
    [],
    refundToDb,
    refundFromDb,
    true,
  );

  const getTokoEmail = (namaToko: string): string => {
    const found = toko.find((t) => t.namaToko === namaToko);
    return found?.email || '';
  };

  const getTokoOwner = (namaToko: string): string => {
    const found = toko.find((t) => t.namaToko === namaToko);
    return found?.nama || '-';
  };

  const addPenjualanFromOrder = (order: OrderRow) => {
    const newId = String(
      penjualan.length
        ? Math.max(...penjualan.map((p) => Number(p.id))) + 1
        : 1,
    );
    setPenjualan((prev) => [
      {
        id: newId,
        namaToko: order.toko,
        namaPembeli: order.nama,
        noHp: order.noHp,
        alamatPembeli: order.alamat,
        namaProduk: order.produk,
        skuProduk: order.varian,
        hargaJual: order.hargaJual,
        modalShopee: order.modal,
        noResi: '',
        jasaPengiriman: 'Shopee Express',
        statusPengiriman: 'Masuk',
        statusAkunToko: 'Aktif',
        tanggalTransaksi: order.tanggal,
      },
      ...prev,
    ]);
  };

  return (
    <AppDataContext.Provider
      value={{
        toko,
        setToko,
        orders,
        setOrders,
        penjualan,
        setPenjualan,
        refund,
        setRefund,
        addPenjualanFromOrder,
        getTokoEmail,
        getTokoOwner,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};
