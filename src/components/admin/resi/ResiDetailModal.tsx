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
} from 'react-icons/md';
import { Penjualan } from 'variables/dropshipPenjualan';
import ResiInfoBlocks from 'components/admin/resi/ResiInfoBlocks';

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

        <ResiInfoBlocks penjualan={penjualan} />
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
