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
import { InfoRow, SectionLabel } from 'components/admin/resi/ResiInputModal';
import { useMemberName } from 'hooks/useMemberName';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

/**
 * Detail Pesanan Masuk / Detail Laporan (read-only). Tata letak disamakan
 * dengan Detail Penjualan & Detail Resi (section per blok).
 */
const OrderDetailModal = (props: { order: OrderRow }) => {
  const { order } = props;
  const { resolve: resolveMember } = useMemberName();
  const profit = order.hargaJual - order.modal;

  const semuaProduk = [
    {
      id: 'utama',
      namaProduk: order.produk,
      varian: order.varian,
      skuProduk: order.sku,
    },
    ...(order.produkList || []),
  ];

  return (
    <div className="space-y-3.5">
      <SectionLabel>Info Pembeli</SectionLabel>
      <InfoRow
        icon={<MdPerson className="h-3.5 w-3.5" />}
        label="Nama"
        value={order.nama}
      />
      <InfoRow
        icon={<MdPhone className="h-3.5 w-3.5" />}
        label="Nomor HP"
        value={order.noHp}
      />
      <InfoRow
        icon={<MdLocationOn className="h-3.5 w-3.5" />}
        label="Alamat"
        value={order.alamat}
      />

      <div className="space-y-3.5 border-t border-gray-200 pt-3.5 dark:border-white/10">
        <SectionLabel>Info Transaksi</SectionLabel>
        <InfoRow
          icon={<MdBadge className="h-3.5 w-3.5" />}
          label="Member"
          value={resolveMember(order.reporterId, order.toko)}
        />
        <InfoRow
          icon={<MdStorefront className="h-3.5 w-3.5" />}
          label="Toko"
          value={order.toko}
        />
        <InfoRow
          icon={<MdReceiptLong className="h-3.5 w-3.5" />}
          label="No Pesanan AL"
          value={order.noPesananAL || '-'}
        />
        <InfoRow
          icon={<MdCalendarToday className="h-3.5 w-3.5" />}
          label="Tanggal Masuk"
          value={order.tanggal}
        />
        <InfoRow
          icon={<MdInventory2 className="h-3.5 w-3.5" />}
          label="Keterangan"
          value={order.keterangan}
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
              </div>
            </div>
          ))}
        </div>
      </div>

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
  );
};

export default OrderDetailModal;
