'use client';
import {
  MdInventory2,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdStorefront,
  MdCalendarToday,
  MdStyle,
  MdQrCode2,
} from 'react-icons/md';
import { OrderRow } from 'variables/dropshipTables';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

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

const OrderDetailModal = (props: { order: OrderRow }) => {
  const { order } = props;
  return (
    <div>
      <div className="mb-5 flex items-start gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lightPrimary dark:bg-navy-700">
          <MdInventory2 className="h-5 w-5 text-brand-500 dark:text-white" />
        </div>
        <div>
          <p className="font-semibold leading-tight text-navy-700 dark:text-white">
            {order.produk}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Varian: {order.varian}
          </p>
          <div className="mt-1.5">
            <span className="rounded-full bg-lightPrimary px-3 py-1 font-mono text-xs font-bold text-brand-500 dark:bg-navy-700 dark:text-white">
              SKU: {order.sku}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        <SectionLabel>Info Pembeli</SectionLabel>
        <Row
          icon={<MdPerson className="h-3.5 w-3.5" />}
          label="Nama"
          value={order.nama}
        />
        <div className="mt-3.5">
          <Row
            icon={<MdPhone className="h-3.5 w-3.5" />}
            label="Nomor HP"
            value={order.noHp}
          />
        </div>
        <div className="mt-3.5">
          <Row
            icon={<MdLocationOn className="h-3.5 w-3.5" />}
            label="Alamat"
            value={order.alamat}
          />
        </div>

        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Info Pesanan</SectionLabel>
          <Row
            icon={<MdStorefront className="h-3.5 w-3.5" />}
            label="Toko"
            value={order.toko}
          />
          <div className="mt-3.5">
            <Row
              icon={<MdStyle className="h-3.5 w-3.5" />}
              label="Varian Produk"
              value={order.varian}
            />
          </div>
          <div className="mt-3.5">
            <Row
              icon={<MdQrCode2 className="h-3.5 w-3.5" />}
              label="SKU"
              value={order.sku}
            />
          </div>
          <div className="mt-3.5">
            <Row
              icon={<MdCalendarToday className="h-3.5 w-3.5" />}
              label="Tanggal Masuk"
              value={order.tanggal}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Estimasi Nilai</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                Penghasilan
              </p>
              <p className="text-base font-semibold text-navy-700 dark:text-white">
                {formatRupiah(order.hargaJual)}
              </p>
            </div>
            <div className="rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                Modal
              </p>
              <p className="text-base font-semibold text-navy-700 dark:text-white">
                {formatRupiah(order.modal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
