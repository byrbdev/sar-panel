'use client';
import React from 'react';
import Card from 'components/card';
import LineChart from 'components/charts/LineChart';
import { useAuth } from 'context/AuthContext';
import { useBrutal } from 'context/BrutalContext';
import { useScopedData } from 'hooks/useScopedData';
import {
  analisaBrutal,
  produkTeroptimasi,
  omzetPerBulan,
  topProdukTerlaris,
} from 'utils/analisaHelpers';
import {
  MdAttachMoney,
  MdTrendingUp,
  MdShoppingCart,
  MdEmojiEvents,
  MdWarningAmber,
  MdCheckCircle,
  MdBarChart,
} from 'react-icons/md';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const AnalisaMemberView = () => {
  const { profile } = useAuth();
  const { penjualan, refund } = useScopedData();
  const { items: brutalItems } = useBrutal();

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
    () => omzetPerBulan(penjualan),
    [penjualan],
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
    () => analisaBrutal(brutalSaya, penjualan, { [profile?.id || '']: profile?.nama || '' }),
    [brutalSaya, penjualan, profile],
  );
  const perluOptimasi = analisaBrutalSaya.filter((b) => b.perluDioptimasi);
  const teroptimasi = React.useMemo(
    () => produkTeroptimasi(analisaBrutalSaya),
    [analisaBrutalSaya],
  );

  const lineChartData = [
    { name: 'Omzet', data: trendBulanan.map((b) => b.omzet), color: '#4318FF' },
    { name: 'Profit', data: trendBulanan.map((b) => b.profit), color: '#6AD2FF' },
  ];

  const lineChartOptions: any = {
    chart: { toolbar: { show: false } },
    legend: { show: true, position: 'top', horizontalAlign: 'right' },
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
      <div>
        <h1 className="text-xl font-bold text-navy-700 dark:text-white">
          Analisa Performa Toko Saya
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Data hanya mencakup toko yang di-setting sebagai milikmu
        </p>
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
                {['#', 'PRODUK', 'TOKO', 'TERJUAL', 'OMZET'].map((h) => (
                  <th key={h} className="pb-2 pr-2 pt-2 text-start text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top10Produk.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                top10Produk.map((p, i) => (
                  <tr key={p.namaProduk + p.namaToko} className="border-b border-gray-100 dark:border-white/5">
                    <td className="py-3 pr-2 text-sm font-bold text-navy-700 dark:text-white">{i + 1}</td>
                    <td className="truncate py-3 pr-2 text-xs font-bold text-navy-700 dark:text-white sm:text-sm">{p.namaProduk}</td>
                    <td className="truncate py-3 pr-2 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">{p.namaToko}</td>
                    <td className="truncate py-3 pr-2 text-xs text-navy-700 dark:text-white sm:text-sm">{p.jumlahTerjual}x</td>
                    <td className="truncate py-3 pr-2 text-xs font-bold text-navy-700 dark:text-white sm:text-sm">{formatRupiah(p.omzet)}</td>
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
          Status Tidak Muncul atau Tidak Iklan, disandingkan dengan orderan real.
        </p>
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                {['TOKO', 'PRODUK', 'SKU', 'STATUS', 'IKLAN', 'ORDERAN REAL'].map((h) => (
                  <th key={h} className="pb-2 pr-2 pt-2 text-start text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perluOptimasi.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Tidak ada produk yang perlu dioptimasi saat ini. 🎉
                  </td>
                </tr>
              ) : (
                perluOptimasi.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 dark:border-white/5">
                    <td className="truncate py-3 pr-2 text-xs font-bold text-navy-700 dark:text-white sm:text-sm">{b.namaToko}</td>
                    <td className="truncate py-3 pr-2 text-xs text-navy-700 dark:text-white sm:text-sm">{b.produk}</td>
                    <td className="truncate py-3 pr-2 font-mono text-xs text-gray-600 dark:text-gray-300">{b.sku || '-'}</td>
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
                    <td className="truncate py-3 pr-2 text-xs font-bold text-navy-700 dark:text-white sm:text-sm">{b.realOrderan}x</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card extra="p-5">
        <div className="mb-1 flex items-center gap-2">
          <MdCheckCircle className="h-5 w-5 text-green-500" />
          <h2 className="text-lg font-bold text-navy-700 dark:text-white">
            Produk Brutal yang Sudah Teroptimasi
          </h2>
        </div>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Status Muncul & sedang beriklan, diurutkan dari orderan real tertinggi.
        </p>
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                {['TOKO', 'PRODUK', 'SKU', 'STATUS', 'IKLAN', 'ORDERAN REAL'].map((h) => (
                  <th key={h} className="pb-2 pr-2 pt-2 text-start text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teroptimasi.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Belum ada produk yang tercatat sudah teroptimasi.
                  </td>
                </tr>
              ) : (
                teroptimasi.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 dark:border-white/5">
                    <td className="truncate py-3 pr-2 text-xs font-bold text-navy-700 dark:text-white sm:text-sm">{b.namaToko}</td>
                    <td className="truncate py-3 pr-2 text-xs text-navy-700 dark:text-white sm:text-sm">{b.produk}</td>
                    <td className="truncate py-3 pr-2 font-mono text-xs text-gray-600 dark:text-gray-300">{b.sku || '-'}</td>
                    <td className="py-3 pr-2">
                      <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-500">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-500">
                        {b.iklan}
                      </span>
                    </td>
                    <td className="truncate py-3 pr-2 text-xs font-bold text-green-500 sm:text-sm">{b.realOrderan}x</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalisaMemberView;
