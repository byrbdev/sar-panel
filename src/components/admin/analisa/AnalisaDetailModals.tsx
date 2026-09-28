'use client';
import React from 'react';
import { MdInventory2, MdStorefront, MdShoppingCart } from 'react-icons/md';
import RefundDetailModal from 'components/admin/refund/RefundDetailModal';
import { ProdukAnalisa, RefundProdukAnalisa } from 'utils/analisaHelpers';

const Row = (props: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex gap-3">
    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-lightPrimary text-gray-600 dark:bg-navy-700 dark:text-gray-300">
      {props.icon}
    </div>
    <div>
      <p className="mb-0.5 text-xs leading-none text-gray-500 dark:text-gray-400">
        {props.label}
      </p>
      <p className="text-base leading-snug text-navy-700 dark:text-white">
        {props.value}
      </p>
    </div>
  </div>
);

/** Overlay read-only Top 10 Produk Terlaris: hanya Nama Produk, Toko, Jumlah Terjual. */
export const TopProdukDetail = ({ item }: { item: ProdukAnalisa }) => (
  <div className="space-y-4">
    <Row
      icon={<MdInventory2 className="h-3.5 w-3.5" />}
      label="Nama Produk"
      value={item.namaProduk}
    />
    <Row
      icon={<MdStorefront className="h-3.5 w-3.5" />}
      label="Toko"
      value={item.namaToko}
    />
    <Row
      icon={<MdShoppingCart className="h-3.5 w-3.5" />}
      label="Jumlah Terjual"
      value={`${item.jumlahTerjual}x`}
    />
  </div>
);

/**
 * Overlay read-only Analisa Produk Refund -- isinya memakai overlay yang
 * SAMA dengan halaman Refund (RefundDetailModal). Kalau produk ini punya
 * lebih dari satu data refund, muncul pemilih di atas untuk berpindah antar
 * data refund-nya.
 */
export const RefundProdukDetail = ({ item }: { item: RefundProdukAnalisa }) => {
  const [idx, setIdx] = React.useState(0);
  const refunds = item.refunds;
  const current = refunds[Math.min(idx, refunds.length - 1)];
  if (!current) return null;
  return (
    <div>
      {refunds.length > 1 && (
        <div className="mb-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {refunds.length} data refund untuk produk ini
          </p>
          <div className="flex flex-wrap gap-2">
            {refunds.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setIdx(i)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  i === idx
                    ? 'bg-brand-500 text-white dark:bg-brand-400'
                    : 'bg-lightPrimary text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-white/10'
                }`}
              >
                #{i + 1} · {r.tanggal}
              </button>
            ))}
          </div>
        </div>
      )}
      <RefundDetailModal refund={current} />
    </div>
  );
};
