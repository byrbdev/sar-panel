'use client';
import {
  MdStorefront,
  MdCategory,
  MdInventory2,
  MdEmail,
  MdShoppingCart,
  MdQrCode2,
  MdTrendingUp,
  MdRateReview,
  MdStar,
  MdWarningAmber,
  MdNotes,
  MdCalendarToday,
} from 'react-icons/md';
import { BrutalItem, BrutalIklan, BrutalStatus } from 'variables/dropshipBrutal';
import { useAppData } from 'context/AppDataContext';

const statusStyle: Record<BrutalStatus, string> = {
  Muncul: 'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-300',
  Tidak: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300',
};

const iklanStyle: Record<BrutalIklan, string> = {
  Iklan: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300',
  Tidak: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300',
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

const BrutalDetailModal = (props: { item: BrutalItem }) => {
  const { item } = props;
  const { getTokoEmail } = useAppData();
  const emailToko = getTokoEmail(item.namaToko);

  return (
    <div>
      <div className="mb-5 flex items-start gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lightPrimary dark:bg-navy-700">
          <MdInventory2 className="h-5 w-5 text-brand-500 dark:text-white" />
        </div>
        <div>
          <p className="font-semibold leading-tight text-navy-700 dark:text-white">
            {item.produk}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {item.namaToko}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[item.status]}`}
            >
              {item.status}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${iklanStyle[item.iklan]}`}
            >
              {item.iklan}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        <SectionLabel>Info Toko</SectionLabel>
        <Row
          icon={<MdStorefront className="h-3.5 w-3.5" />}
          label="Nama Toko"
          value={item.namaToko}
        />
        <div className="mt-3.5">
          <Row
            icon={<MdEmail className="h-3.5 w-3.5" />}
            label="Email Toko"
            value={emailToko || '-'}
          />
        </div>
        <div className="mt-3.5">
          <Row
            icon={<MdCategory className="h-3.5 w-3.5" />}
            label="Kategori Toko"
            value={item.kategoriToko}
          />
        </div>
        <div className="mt-3.5">
          <Row
            icon={<MdStar className="h-3.5 w-3.5" />}
            label="Rating Toko"
            value={item.ratingToko}
          />
        </div>

        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Info Produk & Penjualan</SectionLabel>
          <Row
            icon={<MdQrCode2 className="h-3.5 w-3.5" />}
            label="SKU"
            value={item.sku}
          />
          <div className="mt-3.5">
            <Row
              icon={<MdShoppingCart className="h-3.5 w-3.5" />}
              label="Orderan"
              value={item.orderan}
            />
          </div>
          <div className="mt-3.5">
            <Row
              icon={<MdTrendingUp className="h-3.5 w-3.5" />}
              label="Jumlah Terjual"
              value={item.jumlahTerjual}
            />
          </div>
          <div className="mt-3.5">
            <Row
              icon={<MdRateReview className="h-3.5 w-3.5" />}
              label="Ulasan Produk"
              value={item.ulasanProduk}
            />
          </div>
          <div className="mt-3.5">
            <Row
              icon={<MdRateReview className="h-3.5 w-3.5" />}
              label="Review Produk"
              value={item.reviewProduk}
            />
          </div>
          <div className="mt-3.5">
            <Row
              icon={<MdCalendarToday className="h-3.5 w-3.5" />}
              label="Tanggal"
              value={item.tanggal}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Pelanggaran & Keterangan</SectionLabel>
          <Row
            icon={<MdWarningAmber className="h-3.5 w-3.5" />}
            label="Pelanggaran"
            value={item.pelanggaran || '-'}
          />
          <div className="mt-3.5">
            <Row
              icon={<MdNotes className="h-3.5 w-3.5" />}
              label="Keterangan"
              value={item.keterangan || '-'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrutalDetailModal;
