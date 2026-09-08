'use client';
import {
  MdInventory2,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdStorefront,
  MdCalendarToday,
  MdAttachMoney,
  MdTrendingUp,
  MdTag,
  MdLocalShipping,
  MdSell,
} from 'react-icons/md';
import {
  Penjualan,
  StatusPengiriman,
} from 'variables/dropshipPenjualan';
import { StatusAkunToko } from 'variables/dropshipPemulihan';
import { useAppData } from 'context/AppDataContext';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const statusStyle: Record<StatusPengiriman, string> = {
  Masuk: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300',
  Terkirim:
    'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-300',
  Refund: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300',
};

const akunStatusStyle: Record<StatusAkunToko, string> = {
  Aktif:
    'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-300',
  Ban: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300',
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

const PenjualanDetailModal = (props: { penjualan: Penjualan }) => {
  const { penjualan } = props;
  const { toko } = useAppData();
  const statusAkunToko: StatusAkunToko =
    toko.find((t) => t.namaToko === penjualan.namaToko)?.statusAkunToko ||
    'Aktif';
  const profit = penjualan.hargaJual - penjualan.modalShopee;

  return (
    <div>
      {/* Header produk */}
      <div className="mb-5 flex items-start gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lightPrimary dark:bg-navy-700">
          <MdInventory2 className="h-5 w-5 text-brand-500 dark:text-white" />
        </div>
        <div>
          <p className="font-semibold leading-tight text-navy-700 dark:text-white">
            {penjualan.namaProduk}
          </p>
          {penjualan.skuProduk && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              SKU: {penjualan.skuProduk}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[penjualan.statusPengiriman]}`}
            >
              {penjualan.statusPengiriman}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${akunStatusStyle[statusAkunToko]}`}
            >
              Toko: {statusAkunToko}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Info Pembeli */}
        <SectionLabel>Info Pembeli</SectionLabel>
        <Row
          icon={<MdPerson className="h-3.5 w-3.5" />}
          label="Nama Pembeli"
          value={penjualan.namaPembeli}
        />
        <div className="mt-3.5">
          <Row
            icon={<MdPhone className="h-3.5 w-3.5" />}
            label="Nomor HP"
            value={penjualan.noHp}
          />
        </div>
        <div className="mt-3.5">
          <Row
            icon={<MdLocationOn className="h-3.5 w-3.5" />}
            label="Alamat Pengiriman"
            value={penjualan.alamatPembeli}
          />
        </div>

        {/* Info Transaksi */}
        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Info Transaksi</SectionLabel>
          <Row
            icon={<MdStorefront className="h-3.5 w-3.5" />}
            label="Toko"
            value={penjualan.namaToko}
          />
          <div className="mt-3.5">
            <Row
              icon={<MdCalendarToday className="h-3.5 w-3.5" />}
              label="Tanggal Transaksi"
              value={penjualan.tanggalTransaksi}
            />
          </div>
        </div>

        {/* Finansial */}
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

        {/* Pengiriman */}
        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Pengiriman</SectionLabel>
          <Row
            icon={<MdTag className="h-3.5 w-3.5" />}
            label="Nomor Resi"
            value={penjualan.noResi}
          />
          <div className="mt-3.5">
            <Row
              icon={<MdLocalShipping className="h-3.5 w-3.5" />}
              label="Jasa Pengiriman"
              value={penjualan.jasaPengiriman}
            />
          </div>

          {penjualan.noResi && (
            <div className="mt-3.5 rounded-xl border border-gray-200 bg-lightPrimary p-3 dark:border-white/10 dark:bg-navy-700">
              <p className="mb-1.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MdSell className="h-3 w-3" />
                Status Pengiriman
              </p>
              <p className="text-base font-medium text-navy-700 dark:text-white">
                {penjualan.statusPengiriman}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PenjualanDetailModal;
