'use client';
import { MdInventory2, MdLocalShipping, MdConfirmationNumber } from 'react-icons/md';
import { Penjualan, jumlahLabel } from 'variables/dropshipPenjualan';
import { isResiBerbeda } from 'variables/dropshipResi';
import { InfoRow, SectionLabel } from 'components/admin/resi/ResiInputModal';

/** Semua produk dalam satu pesanan (produk utama + produk tambahan). */
export const getSemuaProduk = (penjualan: Penjualan) => [
  {
    id: 'utama',
    namaProduk: penjualan.namaProduk,
    varian: penjualan.varian,
    skuProduk: penjualan.skuProduk,
    jumlah: penjualan.jumlah,
    noResi: penjualan.noResi,
    jasaPengiriman: penjualan.jasaPengiriman,
  },
  ...(penjualan.produkList || []),
];

/**
 * Blok "Produk di Pesanan Ini" + "Pengiriman". DIPAKAI BERSAMA oleh Detail
 * Resi dan Detail Penjualan supaya tampilannya selalu identik:
 *
 *   Produk di Pesanan Ini (3)
 *   1. Produk A
 *   Varian · SKU: xxx
 *   Resi: SPXID123 · Shopee Express      <- hanya bila Resi Berbeda
 *   ...
 *   Pengiriman
 *   Jenis Resi: Resi Berbeda (per produk)  /  Nomor Resi + Jasa Pengiriman
 */
const ResiInfoBlocks = (props: { penjualan: Penjualan }) => {
  const { penjualan } = props;
  const semuaProduk = getSemuaProduk(penjualan);
  const beda = isResiBerbeda(penjualan);

  return (
    <>
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
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {[
                    p.varian,
                    p.skuProduk && `SKU: ${p.skuProduk}`,
                    `Jumlah: ${jumlahLabel(p)}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {beda && (
                  <p className="mt-1 text-xs font-medium text-brand-500 dark:text-brand-300">
                    Resi: {p.noResi || '-'} · {p.jasaPengiriman || '-'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3.5 border-t border-gray-200 pt-3.5 dark:border-white/10">
        <SectionLabel>Pengiriman</SectionLabel>
        <InfoRow
          icon={<MdConfirmationNumber className="h-3.5 w-3.5" />}
          label={beda ? 'Jenis Resi' : 'Nomor Resi'}
          value={beda ? 'Resi Berbeda (per produk)' : penjualan.noResi || '-'}
        />
        {!beda && (
          <InfoRow
            icon={<MdLocalShipping className="h-3.5 w-3.5" />}
            label="Jasa Pengiriman"
            value={penjualan.jasaPengiriman || '-'}
          />
        )}
      </div>
    </>
  );
};

export default ResiInfoBlocks;
