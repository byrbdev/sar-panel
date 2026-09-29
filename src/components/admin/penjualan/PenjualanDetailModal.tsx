'use client';
import {
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdStorefront,
  MdCalendarToday,
  MdAttachMoney,
  MdTrendingUp,
  MdTag,
} from 'react-icons/md';
import { Penjualan } from 'variables/dropshipPenjualan';
import ResiInfoBlocks from 'components/admin/resi/ResiInfoBlocks';
import { InfoRow, SectionLabel } from 'components/admin/resi/ResiInputModal';
import { useMemberName } from 'hooks/useMemberName';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

/** Detail Penjualan: tata letak sama dengan Detail Resi (section per blok).
 * Urutan: Info Pembeli -> Info Transaksi -> Produk -> Pengiriman (resi &
 * jasa pengiriman, persis seperti Detail Resi) -> Finansial. */
const PenjualanDetailModal = (props: { penjualan: Penjualan }) => {
  const { penjualan } = props;
  const { resolve: resolveMember } = useMemberName();
  const profit = penjualan.hargaJual - penjualan.modalShopee;

  return (
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
        <SectionLabel>Info Transaksi</SectionLabel>
        <InfoRow
          icon={<MdPerson className="h-3.5 w-3.5" />}
          label="Member"
          value={resolveMember(penjualan.ownerId, penjualan.namaToko)}
        />
        <InfoRow
          icon={<MdStorefront className="h-3.5 w-3.5" />}
          label="Toko"
          value={penjualan.namaToko}
        />
        <InfoRow
          icon={<MdTag className="h-3.5 w-3.5" />}
          label="No Pesanan AL"
          value={penjualan.noPesananAL || '-'}
        />
        <InfoRow
          icon={<MdCalendarToday className="h-3.5 w-3.5" />}
          label="Tanggal Transaksi"
          value={penjualan.tanggalTransaksi}
        />
      </div>

      <ResiInfoBlocks penjualan={penjualan} />

      <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
        <SectionLabel>Finansial</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
            <p className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MdAttachMoney className="h-3 w-3" />
              Penghasilan
            </p>
            <p className="text-base font-semibold text-navy-700 dark:text-white">
              {formatRupiah(penjualan.hargaJual)}
            </p>
          </div>
          <div className="rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
              Modal
            </p>
            <p className="text-base font-semibold text-navy-700 dark:text-white">
              {formatRupiah(penjualan.modalShopee)}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-500/20 dark:bg-green-500/10">
          <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <MdTrendingUp className="h-3.5 w-3.5" />
            Profit Bersih
          </p>
          <p className="text-base font-bold text-green-600 dark:text-green-400">
            {formatRupiah(profit)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PenjualanDetailModal;
