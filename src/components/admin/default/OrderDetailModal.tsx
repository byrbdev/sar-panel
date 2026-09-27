'use client';
import {
  MdInventory2,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdStorefront,
  MdCalendarToday,
  MdBadge,
  MdReceiptLong,
  MdAttachMoney,
  MdTrendingUp,
} from 'react-icons/md';
import { OrderRow } from 'variables/dropshipTables';
import { useMemberName } from 'hooks/useMemberName';

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

/**
 * Detail Pesanan Masuk (read-only). Struktur & gaya DISAMAKAN persis dengan
 * Detail Penjualan (PenjualanDetailModal.tsx) di halaman Penjualan, supaya
 * pengalaman member/admin/super admin konsisten di kedua tempat -- termasuk
 * dukungan multi-produk dalam satu invoice/No Pesanan AL yang sama.
 */
const OrderDetailModal = (props: { order: OrderRow }) => {
  const { order } = props;
  const { resolve: resolveMember } = useMemberName();
  const profit = order.hargaJual - order.modal;

  return (
    <div>
      {/* Header produk */}
      <div className="mb-5 flex items-start gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lightPrimary dark:bg-navy-700">
          <MdInventory2 className="h-5 w-5 text-brand-500 dark:text-white" />
        </div>
        <div>
          <p className="font-semibold leading-tight text-navy-700 dark:text-white">
            {order.produk}
          </p>
          {(order.varian || order.sku) && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {order.varian && <>Varian: {order.varian}</>}
              {order.varian && order.sku && ' · '}
              {order.sku && <>SKU: {order.sku}</>}
            </p>
          )}
          {order.produkList && order.produkList.length > 0 && (
            <p className="mt-0.5 text-xs font-medium text-brand-500 dark:text-brand-300">
              +{order.produkList.length} produk lain dalam invoice ini
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-500 dark:bg-amber-500/10 dark:text-amber-300">
              Menunggu Diproses
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Info Pembeli */}
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

        {/* Daftar Produk (kalau ada lebih dari 1 produk dalam invoice ini) */}
        {order.produkList && order.produkList.length > 0 && (
          <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
            <SectionLabel>
              Produk dalam Invoice Ini ({order.produkList.length + 1})
            </SectionLabel>
            <div className="space-y-2">
              <div className="rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
                <p className="text-sm font-semibold text-navy-700 dark:text-white">
                  1. {order.produk}
                </p>
                {(order.varian || order.sku) && (
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {[order.varian, order.sku].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              {order.produkList.map((p, idx) => (
                <div
                  key={p.id}
                  className="rounded-xl bg-lightPrimary p-3 dark:bg-navy-700"
                >
                  <p className="text-sm font-semibold text-navy-700 dark:text-white">
                    {idx + 2}. {p.namaProduk || '(tanpa nama)'}
                  </p>
                  {(p.varian || p.skuProduk) && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {[p.varian, p.skuProduk].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Transaksi */}
        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Info Transaksi</SectionLabel>
          <Row
            icon={<MdBadge className="h-3.5 w-3.5" />}
            label="Member"
            value={resolveMember(order.reporterId, order.toko)}
          />
          <div className="mt-3.5">
            <Row
              icon={<MdStorefront className="h-3.5 w-3.5" />}
              label="Toko"
              value={order.toko}
            />
          </div>
          <div className="mt-3.5">
            <Row
              icon={<MdCalendarToday className="h-3.5 w-3.5" />}
              label="Tanggal Masuk"
              value={order.tanggal}
            />
          </div>
          <div className="mt-3.5">
            <Row
              icon={<MdReceiptLong className="h-3.5 w-3.5" />}
              label="No Pesanan AL"
              value={order.noPesananAL || '-'}
            />
          </div>
          {order.keterangan && (
            <div className="mt-3.5">
              <Row
                icon={<MdInventory2 className="h-3.5 w-3.5" />}
                label="Keterangan"
                value={order.keterangan}
              />
            </div>
          )}
        </div>

        {/* Finansial */}
        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Finansial (Estimasi)</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
              <p className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MdAttachMoney className="h-3 w-3" />
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
    </div>
  );
};

export default OrderDetailModal;
