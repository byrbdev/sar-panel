'use client';
import {
  MdPerson,
  MdPhone,
  MdStorefront,
  MdEmail,
  MdQrCode2,
  MdReceiptLong,
  MdCalendarToday,
  MdInventory2,
  MdLocationOn,
  MdNotes,
  MdAttachMoney,
  MdTrendingUp,
  MdAssignmentReturn,
} from 'react-icons/md';
import { RefundRow } from 'variables/dropshipRefund';
import { InfoRow, SectionLabel } from 'components/admin/resi/ResiInputModal';
import { useMemberName } from 'hooks/useMemberName';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

/** Detail Refund (read-only). Tata letak disamakan dengan Detail Penjualan. */
const RefundDetailModal = (props: { refund: RefundRow }) => {
  const { refund } = props;
  const { resolve: resolveMember } = useMemberName();
  const fromPenjualan = !!refund.namaProduk;

  return (
    <div className="space-y-3.5">
      <SectionLabel>Info Pembeli & Toko</SectionLabel>
      <InfoRow
        icon={<MdPerson className="h-3.5 w-3.5" />}
        label="Member"
        value={resolveMember(refund.ownerId, refund.namaToko)}
      />
      <InfoRow
        icon={<MdPerson className="h-3.5 w-3.5" />}
        label="Nama"
        value={refund.nama}
      />
      <InfoRow
        icon={<MdPhone className="h-3.5 w-3.5" />}
        label="No HP"
        value={refund.noHp}
      />
      <InfoRow
        icon={<MdLocationOn className="h-3.5 w-3.5" />}
        label="Alamat"
        value={refund.alamat}
      />
      <InfoRow
        icon={<MdStorefront className="h-3.5 w-3.5" />}
        label="Nama Toko"
        value={refund.namaToko}
      />
      <InfoRow
        icon={<MdEmail className="h-3.5 w-3.5" />}
        label="Email Toko"
        value={refund.emailToko}
      />
      <InfoRow
        icon={<MdQrCode2 className="h-3.5 w-3.5" />}
        label="SKU"
        value={refund.sku}
      />

      <div className="space-y-3.5 border-t border-gray-200 pt-3.5 dark:border-white/10">
        <SectionLabel>Info Pesanan</SectionLabel>
        <InfoRow
          icon={<MdReceiptLong className="h-3.5 w-3.5" />}
          label="No Pesanan AL"
          value={refund.noPesananAL}
        />
        <InfoRow
          icon={<MdReceiptLong className="h-3.5 w-3.5" />}
          label="No Pesanan SHP"
          value={refund.noPesananSHP}
        />
        <InfoRow
          icon={<MdReceiptLong className="h-3.5 w-3.5" />}
          label="Update No Pesanan"
          value={refund.updateNoPesanan}
        />
        <InfoRow
          icon={<MdCalendarToday className="h-3.5 w-3.5" />}
          label="Tanggal"
          value={refund.tanggal}
        />
        <InfoRow
          icon={<MdAssignmentReturn className="h-3.5 w-3.5" />}
          label="Alasan"
          value={refund.alasan}
        />
      </div>

      {fromPenjualan && (
        <div className="space-y-3.5 border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Refund dari Transaksi yang Sudah Diproses</SectionLabel>
          <div className="flex items-start gap-3 rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
            <MdInventory2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500 dark:text-white" />
            <div className="min-w-0">
              <p className="mb-0.5 text-xs text-gray-500 dark:text-gray-400">
                Produk
              </p>
              <p className="break-words text-sm font-semibold text-navy-700 [overflow-wrap:anywhere] dark:text-white">
                {refund.namaProduk}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
              <p className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MdAttachMoney className="h-3 w-3" />
                Omzet
              </p>
              <p className="text-base font-semibold text-navy-700 dark:text-white">
                {formatRupiah(refund.omzet || 0)}
              </p>
            </div>
            <div className="rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
              <p className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MdTrendingUp className="h-3 w-3" />
                Profit
              </p>
              <p className="text-base font-semibold text-navy-700 dark:text-white">
                {formatRupiah(refund.profit || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3.5 border-t border-gray-200 pt-3.5 dark:border-white/10">
        <SectionLabel>Keterangan</SectionLabel>
        <InfoRow
          icon={<MdNotes className="h-3.5 w-3.5" />}
          label="Catatan"
          value={refund.keterangan || '-'}
        />
      </div>
    </div>
  );
};

export default RefundDetailModal;
