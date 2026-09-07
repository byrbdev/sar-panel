'use client';
import {
  MdAssignmentReturn,
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
  MdWarningAmber,
} from 'react-icons/md';
import { RefundRow, RefundStatus } from 'variables/dropshipRefund';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const statusStyle: Record<RefundStatus, string> = {
  Belum: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300',
  Proses:
    'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-300',
  Selesai:
    'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-300',
};

const statusLabel: Record<RefundStatus, string> = {
  Belum: 'Belum',
  Proses: 'Proses',
  Selesai: 'Selesai',
};

const Row = (props: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => {
  const { icon, label, value } = props;
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-lightPrimary text-gray-600 dark:bg-navy-700 dark:text-gray-300">
        {icon}
      </div>
      <div>
        <p className="mb-0.5 text-xs leading-none text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-base leading-snug text-navy-700 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
};

const SectionLabel = (props: { children: React.ReactNode }) => (
  <p className="mb-3 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
    {props.children}
  </p>
);

const RefundDetailModal = (props: { refund: RefundRow }) => {
  const { refund } = props;
  const fromPenjualan = !!refund.namaProduk;

  return (
    <div>
      <div className="mb-5 flex items-start gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
          <MdAssignmentReturn className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <p className="font-semibold leading-tight text-navy-700 dark:text-white">
            {refund.nama}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {refund.namaToko}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[refund.status]}`}
            >
              {statusLabel[refund.status]}
            </span>
            <span className="rounded-full bg-lightPrimary px-3 py-1 text-xs font-bold text-navy-700 dark:bg-navy-700 dark:text-white">
              {refund.alasan}
            </span>
          </div>
        </div>
      </div>

      {fromPenjualan && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            <MdWarningAmber className="h-3.5 w-3.5" />
            Refund dari Transaksi yang Sudah Diproses
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/70 p-2.5 dark:bg-navy-800/50">
              <p className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MdInventory2 className="h-3 w-3" />
                Produk
              </p>
              <p className="text-sm font-semibold text-navy-700 dark:text-white">
                {refund.namaProduk}
              </p>
            </div>
            <div className="rounded-lg bg-white/70 p-2.5 dark:bg-navy-800/50">
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                Omzet
              </p>
              <p className="text-sm font-semibold text-navy-700 dark:text-white">
                {formatRupiah(refund.omzet || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-white/70 p-2.5 dark:bg-navy-800/50">
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                Profit
              </p>
              <p className="text-sm font-semibold text-navy-700 dark:text-white">
                {formatRupiah(refund.profit || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-white/70 p-2.5 dark:bg-navy-800/50">
              <p className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MdLocationOn className="h-3 w-3" />
                Alamat
              </p>
              <p className="text-sm font-semibold text-navy-700 dark:text-white">
                {refund.alamat}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3.5">
        <SectionLabel>Info Pembeli & Toko</SectionLabel>
        <Row icon={<MdPerson className="h-3.5 w-3.5" />} label="Nama" value={refund.nama} />
        <div className="mt-3.5">
          <Row
            icon={<MdPhone className="h-3.5 w-3.5" />}
            label="No HP"
            value={refund.noHp}
          />
        </div>
        <div className="mt-3.5">
          <Row
            icon={<MdStorefront className="h-3.5 w-3.5" />}
            label="Nama Toko"
            value={refund.namaToko}
          />
        </div>
        <div className="mt-3.5">
          <Row
            icon={<MdEmail className="h-3.5 w-3.5" />}
            label="Email Toko"
            value={refund.emailToko}
          />
        </div>
        <div className="mt-3.5">
          <Row
            icon={<MdQrCode2 className="h-3.5 w-3.5" />}
            label="SKU"
            value={refund.sku}
          />
        </div>

        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Info Pesanan</SectionLabel>
          <Row
            icon={<MdReceiptLong className="h-3.5 w-3.5" />}
            label="No Pesanan AL"
            value={refund.noPesananAL}
          />
          <div className="mt-3.5">
            <Row
              icon={<MdReceiptLong className="h-3.5 w-3.5" />}
              label="No Pesanan SHP"
              value={refund.noPesananSHP}
            />
          </div>
          <div className="mt-3.5">
            <Row
              icon={<MdReceiptLong className="h-3.5 w-3.5" />}
              label="Update No Pesanan"
              value={refund.updateNoPesanan}
            />
          </div>
          <div className="mt-3.5">
            <Row
              icon={<MdCalendarToday className="h-3.5 w-3.5" />}
              label="Tanggal"
              value={refund.tanggal}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Keterangan</SectionLabel>
          <Row
            icon={<MdNotes className="h-3.5 w-3.5" />}
            label="Catatan"
            value={refund.keterangan || '-'}
          />
        </div>
      </div>
    </div>
  );
};

export default RefundDetailModal;
