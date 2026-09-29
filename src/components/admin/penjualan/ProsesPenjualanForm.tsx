'use client';
import React from 'react';
import { MdInventory2 } from 'react-icons/md';
import RupiahInput from 'components/fields/RupiahInput';
import { InfoRow, SectionLabel } from 'components/admin/resi/ResiInputModal';
import { MdPerson, MdPhone, MdLocationOn, MdStorefront, MdTag, MdCalendarToday } from 'react-icons/md';
import { PenjualanFormValue } from 'components/admin/penjualan/PenjualanForm';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

/**
 * Form "Proses Penjualan". Semua data pesanan READ-ONLY; yang bisa
 * diinput hanya Penghasilan/Omzet dan Modal. Profit dihitung otomatis.
 * Nomor resi & jasa pengiriman diisi di halaman Resi.
 */
const ProsesPenjualanForm = (props: {
  value: PenjualanFormValue;
  onChange: (value: PenjualanFormValue) => void;
}) => {
  const { value, onChange } = props;
  const profit = value.hargaJual - value.modalShopee;
  const semuaProduk = [
    {
      id: 'utama',
      namaProduk: value.namaProduk,
      varian: value.varian,
      skuProduk: value.skuProduk,
    },
    ...(value.produkList || []),
  ];

  return (
    <div className="space-y-3.5">
      <SectionLabel>Info Pembeli</SectionLabel>
      <InfoRow icon={<MdPerson className="h-3.5 w-3.5" />} label="Nama Pembeli" value={value.namaPembeli} />
      <InfoRow icon={<MdPhone className="h-3.5 w-3.5" />} label="Nomor HP" value={value.noHp} />
      <InfoRow icon={<MdLocationOn className="h-3.5 w-3.5" />} label="Alamat Pembeli" value={value.alamatPembeli} />

      <div className="space-y-3.5 border-t border-gray-200 pt-3.5 dark:border-white/10">
        <SectionLabel>Info Pesanan</SectionLabel>
        <InfoRow icon={<MdStorefront className="h-3.5 w-3.5" />} label="Toko" value={value.namaToko} />
        <InfoRow icon={<MdTag className="h-3.5 w-3.5" />} label="No Pesanan AL" value={value.noPesananAL || '-'} />
        <InfoRow icon={<MdCalendarToday className="h-3.5 w-3.5" />} label="Tanggal Transaksi" value={value.tanggalTransaksi} />
      </div>

      <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
        <SectionLabel>Produk di Pesanan Ini ({semuaProduk.length})</SectionLabel>
        <div className="space-y-2">
          {semuaProduk.map((p, idx) => (
            <div key={p.id} className="flex items-start gap-3 rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
              <MdInventory2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500 dark:text-white" />
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-navy-700 dark:text-white">
                  {semuaProduk.length > 1 ? `${idx + 1}. ` : ''}
                  {p.namaProduk || '(tanpa nama)'}
                </p>
                {(p.varian || p.skuProduk) && (
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {[p.varian, p.skuProduk && `SKU: ${p.skuProduk}`].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
        <SectionLabel>Finansial</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RupiahInput
            id="hargaJual"
            label="Penghasilan / Omzet (Rp)"
            value={value.hargaJual}
            onChange={(v) => onChange({ ...value, hargaJual: v })}
          />
          <RupiahInput
            id="modalShopee"
            label="Modal (Rp)"
            value={value.modalShopee}
            onChange={(v) => onChange({ ...value, modalShopee: v })}
          />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 bg-lightPrimary px-4 py-3.5 dark:border-white/10 dark:bg-navy-700">
          <span className="text-sm text-gray-600 dark:text-gray-300">Profit Bersih (otomatis)</span>
          <span className={`text-base font-bold ${profit >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {formatRupiah(profit)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProsesPenjualanForm;
