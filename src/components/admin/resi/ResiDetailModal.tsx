'use client';
import React from 'react';
import ModalOverlay from 'components/modal/ModalOverlay';
import { InfoRow, SectionLabel } from 'components/admin/resi/ResiInputModal';
import {
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdStorefront,
  MdTag,
  MdInventory2,
  MdLocalShipping,
  MdConfirmationNumber,
} from 'react-icons/md';
import { Penjualan } from 'variables/dropshipPenjualan';
import { isResiBerbeda } from 'variables/dropshipResi';

/**
 * Overlay "Lihat Resi" (read-only). Dipakai di halaman Resi Member DAN saat
 * Member membuka notifikasi resi, jadi tampilannya selalu sama.
 */
const ResiDetailModal = (props: {
  penjualan: Penjualan | null;
  onClose: () => void;
}) => {
  const { penjualan, onClose } = props;
  if (!penjualan) return null;

  const semuaProduk = [
    {
      id: 'utama',
      namaProduk: penjualan.namaProduk,
      varian: penjualan.varian,
      skuProduk: penjualan.skuProduk,
      noResi: penjualan.noResi,
      jasaPengiriman: penjualan.jasaPengiriman,
    },
    ...(penjualan.produkList || []),
  ];

  const beda = isResiBerbeda(penjualan);

  return (
    <ModalOverlay open={!!penjualan} onClose={onClose} title="Detail Resi">
      <div className="space-y-3.5">
        <SectionLabel>Info Pembeli</SectionLabel>
        <InfoRow
          icon={<MdPerson className="h-3.5 w-3.5" />}
          label="Nama Pembeli"
          value={penjualan.namaPembeli}
        />
        <InfoRow
          icon={<MdPhone className="h-3.5 w-3.5" />}
          label="Nomor HP"
          value={penjualan.noHp}
        />
        <InfoRow
          icon={<MdLocationOn className="h-3.5 w-3.5" />}
          label="Alamat Pengiriman"
          value={penjualan.alamatPembeli}
        />

        <div className="space-y-3.5 border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Info Pesanan</SectionLabel>
          <InfoRow
            icon={<MdStorefront className="h-3.5 w-3.5" />}
            label="Toko"
            value={penjualan.namaToko}
          />
          <InfoRow
            icon={<MdTag className="h-3.5 w-3.5" />}
            label="No Pesanan"
            value={penjualan.noPesananAL || '-'}
          />
        </div>

        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Produk di Pesanan Ini ({semuaProduk.length})</SectionLabel>
          <div className="space-y-2">
            {semuaProduk.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-start gap-3 rounded-xl bg-lightPrimary p-3 dark:bg-navy-700"
              >
                <MdInventory2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500 dark:text-white" />
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-navy-700 dark:text-white">
                    {semuaProduk.length > 1 ? `${idx + 1}. ` : ''}
                    {p.namaProduk || '(tanpa nama)'}
                  </p>
                  {(p.varian || p.skuProduk) && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {[p.varian, p.skuProduk && `SKU: ${p.skuProduk}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                  {beda && (
                    <p className="mt-1 text-xs font-medium text-brand-500 dark:text-brand-300">
                      Resi: {(p as { noResi?: string }).noResi || '-'} · {(p as { jasaPengiriman?: string }).jasaPengiriman || '-'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3.5 border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Pengiriman</SectionLabel>
          <InfoRow
            icon={<MdConfirmationNumber className="h-3.5 w-3.5" />}
            label={beda ? 'Jenis Resi' : 'Nomor Resi'}
            value={beda ? 'Resi Berbeda (per produk)' : penjualan.noResi || '-'}
          />
          {!beda && (

            <InfoRow

              icon={<MdLocalShipping className="h-3.5 w-3.5" />}

              label="Jasa Pengiriman"

              value={penjualan.jasaPengiriman || '-'}

            />

          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="linear rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          Tutup
        </button>
      </div>
    </ModalOverlay>
  );
};

export default ResiDetailModal;
