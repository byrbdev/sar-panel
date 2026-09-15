'use client';
import React from 'react';
import Card from 'components/card';
import BarChart from 'components/charts/BarChart';
import { useAppData } from 'context/AppDataContext';
import { omzetPerHariTerakhir } from 'utils/analisaHelpers';
import { Penjualan } from 'variables/dropshipPenjualan';
import { MdBarChart } from 'react-icons/md';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const OmzetMingguan = (props: { data?: Penjualan[] }) => {
  const { penjualan: allPenjualan } = useAppData();
  const penjualan = props.data ?? allPenjualan;

  const harian = React.useMemo(() => omzetPerHariTerakhir(penjualan, 9), [
    penjualan,
  ]);

  // Kedua metrik punya satuan berbeda (pcs vs rupiah), jadi masing-masing
  // dinormalisasi ke skala yang sama supaya tingginya tetap proporsional
  // terhadap nilai tertingginya sendiri. Nilai asli tetap ditampilkan utuh
  // di tooltip saat di-hover.
  const maxProduk = Math.max(1, ...harian.map((h) => h.produkTerjual));
  const maxProfit = Math.max(1, ...harian.map((h) => h.profit));
  const SKALA = 140;

  const chartData = [
    {
      name: 'Produk Terjual',
      data: harian.map((h) => (h.produkTerjual / maxProduk) * SKALA),
      color: '#6AD2FA',
    },
    {
      name: 'Profit Bersih',
      data: harian.map((h) => (h.profit / maxProfit) * SKALA),
      color: '#4318FF',
    },
    {
      name: 'Track',
      data: harian.map((h) => {
        const p1 = (h.produkTerjual / maxProduk) * SKALA;
        const p2 = (h.profit / maxProfit) * SKALA;
        return Math.max(SKALA * 2 + 40 - p1 - p2, 20);
      }),
      color: '#EFF4FB',
    },
  ];

  const chartOptions: any = {
    chart: { stacked: true, toolbar: { show: false } },
    tooltip: {
      style: { fontSize: '12px', backgroundColor: '#000000' },
      theme: 'dark',
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const h = harian[dataPointIndex];
        if (!h) return '';
        return `
          <div style="padding:10px 14px;background:#000;color:#fff;border-radius:8px;min-width:170px;">
            <div style="font-weight:600;margin-bottom:6px;">Tanggal ${h.tanggal}</div>
            <div style="display:flex;justify-content:space-between;gap:12px;"><span>Produk Terjual</span><b>${h.produkTerjual}</b></div>
            <div style="display:flex;justify-content:space-between;gap:12px;"><span>Omzet</span><b>${formatRupiah(h.omzet)}</b></div>
            <div style="display:flex;justify-content:space-between;gap:12px;"><span>Profit Bersih</span><b>${formatRupiah(h.profit)}</b></div>
          </div>`;
      },
    },
    xaxis: {
      categories: harian.map((h) => h.tanggal),
      labels: { style: { colors: '#A3AED0', fontSize: '14px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    fill: { type: 'solid', colors: ['#6AD2FA', '#4318FF', '#EFF4FB'] },
    legend: { show: false },
    colors: ['#6AD2FA', '#4318FF', '#EFF4FB'],
    dataLabels: { enabled: false },
    plotOptions: { bar: { borderRadius: 10, columnWidth: '20px' } },
  };

  return (
    <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-2 text-center">
      <div className="mb-auto flex items-center justify-between px-6">
        <h2 className="text-lg font-bold text-navy-700 dark:text-white">
          Omzet Mingguan
        </h2>
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-5 px-6">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#6AD2FA]" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Produk Terjual
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4318FF]" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Profit Bersih
          </span>
        </div>
      </div>

      <div className="md:mt-16 lg:mt-0">
        <div className="h-[250px] w-full xl:h-[350px]">
          {harian.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              Belum ada data penjualan
            </div>
          ) : (
            <BarChart chartData={chartData} chartOptions={chartOptions} />
          )}
        </div>
      </div>

      <p className="mt-3 px-6 text-left text-[11px] leading-tight text-gray-500 dark:text-gray-400">
        Arahkan kursor ke setiap batang untuk melihat rincian produk terjual,
        omzet, dan profit bersih per tanggal.
      </p>
    </Card>
  );
};

export default OmzetMingguan;
