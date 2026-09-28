'use client';
import React from 'react';
import Card from 'components/card';
import LineChart from 'components/charts/LineChart';
import { useAuth } from 'context/AuthContext';
import { useBrutal } from 'context/BrutalContext';
import { useScopedData } from 'hooks/useScopedData';
import {
  analisaBrutal,
  analisaProdukRefund,
  isBulanIni,
  produkTeroptimasi,
  omzetPerBulan,
  padOmzetBulanan,
  topProdukTerlaris,
} from 'utils/analisaHelpers';
import { usePagedSlice, AnalisaPager, SkuCell } from './AnalisaPagination';
import ModalOverlay from 'components/modal/ModalOverlay';
import BrutalDetailModal from 'components/admin/brutal/BrutalDetailModal';
import { BrutalAnalisa, ProdukAnalisa, RefundProdukAnalisa } from 'utils/analisaHelpers';
import { TopProdukDetail, RefundProdukDetail } from './AnalisaDetailModals';
import {
  MdAttachMoney,
  MdTrendingUp,
  MdShoppingCart,
  MdEmojiEvents,
  MdWarningAmber,
  MdCheckCircle,
  MdBarChart,
  MdAssignmentReturn,
} from 'react-icons/md';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const AnalisaMemberView = () => {
  const { profile } = useAuth();
  const { penjualan: penjualanAll, refund: refundAll } = useScopedData();
  const { items: brutalItems } = useBrutal();

  // Analisa HANYA menampilkan data bulan berjalan (realtime). Mode
  // "Keseluruhan" sudah dihapus. Tren bulanan & analisa Brutal tetap
  // memakai seluruh histori karena memang butuh data lintas bulan.
  const penjualan = React.useMemo(
    () => penjualanAll.filter((p) => isBulanIni(p.tanggalTransaksi)),
    [penjualanAll],
  );
  const refund = React.useMemo(
    () => refundAll.filter((r) => isBulanIni(r.tanggal)),
    [refundAll],
  );

  const summary = React.useMemo(
    () => ({
      omzet: penjualan.reduce((a, r) => a + r.hargaJual, 0),
      profit: penjualan.reduce((a, r) => a + (r.hargaJual - r.modalShopee), 0),
      transaksi: penjualan.length,
      refund: refund.length,
    }),
    [penjualan, refund],
  );

  const trendBulanan = React.useMemo(
    () => padOmzetBulanan(omzetPerBulan(penjualanAll)),
    [penjualanAll],
  );
  const top10Produk = React.useMemo(
    () => topProdukTerlaris(penjualan, 10),
    [penjualan],
  );
  const brutalSaya = React.useMemo(
    () => brutalItems.filter((i) => i.anggotaId === profile?.id),
    [brutalItems, profile],
  );
  const analisaBrutalSaya = React.useMemo(
    () => analisaBrutal(brutalSaya, penjualanAll, { [profile?.id || '']: profile?.nama || '' }),
    [brutalSaya, penjualanAll, profile],
  );
  const perluOptimasi = analisaBrutalSaya.filter((b) => b.perluDioptimasi);
  const teroptimasi = React.useMemo(
    () => produkTeroptimasi(analisaBrutalSaya),
    [analisaBrutalSaya],
  );
  const refundProduk = React.useMemo(
    () => analisaProdukRefund(refund),
    [refund],
  );

  // Paginasi 10 baris/halaman, masing-masing tabel punya tombol
  // "Selanjutnya" & state halaman sendiri-sendiri (tidak saling pengaruh).
  const perluOptimasiPage = usePagedSlice(perluOptimasi, 10);
  const teroptimasiPage = usePagedSlice(teroptimasi, 10);
  const [selectedBrutal, setSelectedBrutal] = React.useState<BrutalAnalisa | null>(null);
  const [selectedTop, setSelectedTop] = React.useState<ProdukAnalisa | null>(null);
  const [selectedRefund, setSelectedRefund] = React.useState<RefundProdukAnalisa | null>(null);
  const refundProdukPage = usePagedSlice(refundProduk, 10);

  const lineChartData = [
    { name: 'Omzet', data: trendBulanan.map((b) => b.omzet), color: '#4318FF' },
    { name: 'Profit', data: trendBulanan.map((b) => b.profit), color: '#6AD2FF' },
  ];

  const lineChartOptions: any = {
    chart: { toolbar: { show: false }, background: 'transparent' },
    legend: { show: true, position: 'top', horizontalAlign: 'right', labels: { colors: '#A3AED0' }, markers: { size: 6 }, itemMargin: { horizontal: 10 } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    grid: { show: true, borderColor: 'rgba(163, 174, 208, 0.2)' },
    xaxis: {
      categories: trendBulanan.map((b) => b.label),
      labels: { style: { colors: '#A3AED0', fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#A3AED0', fontSize: '11px' },
        formatter: (val: number) =>
          val >= 1000000 ? `${(val / 1000000).toFixed(1)}Jt` : `${val}`,
      },
    },
    tooltip: { theme: 'dark', y: { formatter: (val: number) => formatRupiah(val) } },
    colors: ['#4318FF', '#6AD2FF'],
  };

  return (
    <div className="mt-3 flex flex-col gap-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-navy-700 dark:text-white">
            Analisa Performa Toko Saya
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Data hanya mencakup toko milikmu, realtime bulan berjalan saat ini
          </p>
        </div>
        <span className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-brand-500 shadow dark:bg-navy-800 dark:text-white">
          Bulan Ini (Realtime)
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card extra="!flex-row items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
            <MdAttachMoney className="h-6 w-6 text-brand-500 dark:text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Omzet</p>
            <p className="truncate text-lg font-bold text-navy-700 dark:text-white">
              {formatRupiah(summary.omzet)}
            </p>
          </div>
        </Card>
        <Card extra="!flex-row items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
            <MdTrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Profit</p>
            <p className="truncate text-lg font-bold text-green-500">
              {formatRupiah(summary.profit)}
            </p>
          </div>
        </Card>
        <Card extra="!flex-row items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
            <MdShoppingCart className="h-6 w-6 text-brand-500 dark:text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Transaksi</p>
            <p className="truncate text-lg font-bold text-navy-700 dark:text-white">
              {summary.transaksi} transaksi
            </p>
          </div>
        </Card>
        <Card extra="!flex-row items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
            <MdWarningAmber className="h-6 w-6 text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Refund</p>
            <p className="truncate text-lg font-bold text-red-500">
              {summary.refund} refund
            </p>
          </div>
        </Card>
      </div>

      <Card extra="p-5">
        <div className="mb-4 flex items-center gap-2">
          <MdBarChart className="h-5 w-5 text-brand-500 dark:text-white" />
          <h2 className="text-lg font-bold text-navy-700 dark:text-white">
            Tren Omzet & Profit per Bulan
          </h2>
        </div>
        {trendBulanan.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Belum ada data transaksi.
          </p>
        ) : (
          <div className="h-[300px] w-full">
            <LineChart chartData={lineChartData} chartOptions={lineChartOptions} />
          </div>
        )}
      </Card>

      <Card extra="p-5">
        <div className="mb-4 flex items-center gap-2">
          <MdEmojiEvents className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-navy-700 dark:text-white">
            Top 10 Produk Terlaris Toko Saya
          </h2>
        </div>
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                {['#', 'PRODUK', 'TOKO', 'TERJUAL'].map((h) => (
                  <th key={h} className="pb-2 pr-2 pt-2 text-start text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top10Produk.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                top10Produk.map((p, i) => (
                  <tr key={p.namaProduk + p.namaToko} onClick={() => setSelectedTop(p)} className="cursor-pointer border-b border-gray-100 transition hover:bg-lightPrimary dark:border-white/5 dark:hover:bg-navy-700">
                    <td className="py-3 pr-2 text-sm font-bold text-navy-700 dark:text-white">{i + 1}</td>
                    <td className="truncate py-3 pr-2 text-xs font-bold text-navy-700 dark:text-white sm:text-sm">{p.namaProduk}</td>
                    <td className="truncate py-3 pr-2 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">{p.namaToko}</td>
                    <td className="truncate py-3 pr-2 text-xs text-navy-700 dark:text-white sm:text-sm">{p.jumlahTerjual}x</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card extra="p-5">
        <div className="mb-1 flex items-center gap-2">
          <MdWarningAmber className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-bold text-navy-700 dark:text-white">
            Produk Brutal Saya yang Perlu Dioptimasi
          </h2>
        </div>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Produk yang belum muncul di pencarian atau iklannya belum aktif — perlu dioptimasi.
        </p>
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                {['TOKO', 'PRODUK', 'SKU', 'STATUS', 'IKLAN'].map((h) => (
                  <th key={h} className="pb-2 pr-2 pt-2 text-start text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perluOptimasi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Tidak ada produk yang perlu dioptimasi saat ini. 🎉
                  </td>
                </tr>
              ) : (
                perluOptimasiPage.paged.map((b) => (
                  <tr key={b.id} onClick={() => setSelectedBrutal(b)} className="cursor-pointer border-b border-gray-100 transition hover:bg-lightPrimary dark:border-white/5 dark:hover:bg-navy-700">
                    <td className="truncate py-3 pr-2 text-xs font-bold text-navy-700 dark:text-white sm:text-sm">{b.namaToko}</td>
                    <td className="truncate py-3 pr-2 text-xs text-navy-700 dark:text-white sm:text-sm">{b.produk}</td>
                    <td className="truncate py-3 pr-2 font-mono text-xs text-gray-600 dark:text-gray-300">
                      <SkuCell sku={b.sku} />
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${b.status === 'Muncul' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${b.iklan === 'Iklan' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-500'}`}>
                        {b.iklan}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AnalisaPager
          page={perluOptimasiPage.page}
          totalPages={perluOptimasiPage.totalPages}
          total={perluOptimasiPage.total}
          pageSize={perluOptimasiPage.pageSize}
          onChange={perluOptimasiPage.setPage}
        />
      </Card>

      <Card extra="p-5">
        <div className="mb-1 flex items-center gap-2">
          <MdCheckCircle className="h-5 w-5 text-green-500" />
          <h2 className="text-lg font-bold text-navy-700 dark:text-white">
            Produk Brutal yang Sudah Teroptimasi
          </h2>
        </div>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Produk sudah muncul di pencarian dan iklannya aktif — performanya sudah baik.
        </p>
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                {['TOKO', 'PRODUK', 'SKU', 'STATUS', 'IKLAN'].map((h) => (
                  <th key={h} className="pb-2 pr-2 pt-2 text-start text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teroptimasi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Belum ada produk yang tercatat sudah teroptimasi.
                  </td>
                </tr>
              ) : (
                teroptimasiPage.paged.map((b) => (
                  <tr key={b.id} onClick={() => setSelectedBrutal(b)} className="cursor-pointer border-b border-gray-100 transition hover:bg-lightPrimary dark:border-white/5 dark:hover:bg-navy-700">
                    <td className="truncate py-3 pr-2 text-xs font-bold text-navy-700 dark:text-white sm:text-sm">{b.namaToko}</td>
                    <td className="truncate py-3 pr-2 text-xs text-navy-700 dark:text-white sm:text-sm">{b.produk}</td>
                    <td className="truncate py-3 pr-2 font-mono text-xs text-gray-600 dark:text-gray-300">
                      <SkuCell sku={b.sku} />
                    </td>
                    <td className="py-3 pr-2">
                      <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-500">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${b.iklan === 'Iklan' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {b.iklan}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AnalisaPager
          page={teroptimasiPage.page}
          totalPages={teroptimasiPage.totalPages}
          total={teroptimasiPage.total}
          pageSize={teroptimasiPage.pageSize}
          onChange={teroptimasiPage.setPage}
        />
      </Card>

      <Card extra="p-5">
        <div className="mb-4 flex items-center gap-2">
          <MdAssignmentReturn className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-bold text-navy-700 dark:text-white">
            Analisa Produk Refund
          </h2>
        </div>
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                {['PRODUK', 'TOKO', 'JUMLAH REFUND', 'OMZET HILANG'].map((h) => (
                  <th key={h} className="pb-2 pr-2 pt-2 text-start text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {refundProduk.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Belum ada produk refund.
                  </td>
                </tr>
              ) : (
                refundProdukPage.paged.map((r) => (
                  <tr key={r.namaProduk + r.namaToko} onClick={() => setSelectedRefund(r)} className="cursor-pointer border-b border-gray-100 transition hover:bg-lightPrimary dark:border-white/5 dark:hover:bg-navy-700">
                    <td className="truncate py-3 pr-2 text-xs font-bold text-navy-700 dark:text-white sm:text-sm">{r.namaProduk}</td>
                    <td className="truncate py-3 pr-2 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">{r.namaToko}</td>
                    <td className="truncate py-3 pr-2 text-xs font-bold text-red-500 sm:text-sm">{r.jumlahRefund}x</td>
                    <td className="truncate py-3 pr-2 text-xs font-bold text-red-500 sm:text-sm">{formatRupiah(r.totalOmzetHilang)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AnalisaPager
          page={refundProdukPage.page}
          totalPages={refundProdukPage.totalPages}
          total={refundProdukPage.total}
          pageSize={refundProdukPage.pageSize}
          onChange={refundProdukPage.setPage}
        />
      </Card>

      {selectedTop && (
        <ModalOverlay
          open={!!selectedTop}
          onClose={() => setSelectedTop(null)}
          title="Detail Produk Terlaris"
        >
          <TopProdukDetail item={selectedTop} />
        </ModalOverlay>
      )}

      {selectedRefund && (
        <ModalOverlay
          open={!!selectedRefund}
          onClose={() => setSelectedRefund(null)}
          title="Detail Refund"
        >
          <RefundProdukDetail item={selectedRefund} />
        </ModalOverlay>
      )}

      {selectedBrutal && (
        <ModalOverlay
          open={!!selectedBrutal}
          onClose={() => setSelectedBrutal(null)}
          title="Detail Produk Brutal"
        >
          <BrutalDetailModal item={selectedBrutal} />
        </ModalOverlay>
      )}
    </div>
  );
};

export default AnalisaMemberView;
