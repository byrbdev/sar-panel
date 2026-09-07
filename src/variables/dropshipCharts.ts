import { ApexOptions } from 'apexcharts';

type ApexGeneric = ApexOptions & any;

// ================= Chart Penjualan (Bulan Ini) =================
export const lineChartDataPenjualan = [
  {
    name: 'Omzet',
    data: [3200000, 4100000, 3800000, 5200000, 4700000, 6100000],
    color: '#4318FF',
  },
  {
    name: 'Profit Bersih',
    data: [900000, 1300000, 1050000, 1700000, 1400000, 2000000],
    color: '#6AD2FF',
  },
];

export const lineChartOptionsPenjualan: ApexGeneric = {
  legend: {
    show: false,
  },
  theme: {
    mode: 'light',
  },
  chart: {
    type: 'line',
    toolbar: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
  },
  tooltip: {
    style: {
      fontSize: '12px',
      fontFamily: undefined,
      backgroundColor: '#000000',
    },
    theme: 'dark',
    y: {
      formatter: function (val: number) {
        return 'Rp' + val.toLocaleString('id-ID');
      },
    },
  },
  grid: {
    show: false,
  },
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: '#A3AED0',
        fontSize: '12px',
        fontWeight: '500',
      },
    },
    type: 'text',
    range: undefined,
    categories: ['MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU'],
  },
  yaxis: {
    show: false,
  },
};

// ================= Chart Omzet Mingguan (Weekly Revenue) =================
// index 0..8 -> setiap kategori punya data Produk Terjual, Omzet, Profit Bersih
export const weeklyCategories = [
  '17', '18', '19', '20', '21', '22', '23', '24', '25',
];

export const weeklyProdukTerjual = [12, 9, 15, 11, 8, 13, 10, 7, 14];
export const weeklyOmzet = [
  2400000, 1800000, 3100000, 2200000, 1600000, 2600000, 2000000, 1400000,
  2800000,
];
export const weeklyProfitBersih = [
  720000, 540000, 930000, 660000, 480000, 780000, 600000, 420000, 840000,
];

export const barChartDataOmzetMingguan = [
  {
    name: 'Produk Terjual',
    data: weeklyProdukTerjual.map(
      (v) => (v / Math.max(...weeklyProdukTerjual)) * 160,
    ),
    color: '#6AD2FA',
  },
  {
    name: 'Profit Bersih',
    data: weeklyProfitBersih.map(
      (v) => (v / Math.max(...weeklyProfitBersih)) * 160,
    ),
    color: '#4318FF',
  },
  {
    name: 'Track',
    data: weeklyOmzet.map((_, i) => {
      const produkPct =
        (weeklyProdukTerjual[i] / Math.max(...weeklyProdukTerjual)) * 160;
      const profitPct =
        (weeklyProfitBersih[i] / Math.max(...weeklyProfitBersih)) * 160;
      return Math.max(320 - produkPct - profitPct, 20);
    }),
    color: '#EFF4FB',
  },
];

export const barChartOptionsOmzetMingguan: ApexGeneric = {
  chart: {
    stacked: true,
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    style: {
      fontSize: '12px',
      fontFamily: undefined,
      backgroundColor: '#000000',
    },
    theme: 'dark',
    custom: function ({ dataPointIndex }: { dataPointIndex: number }) {
      const produk = weeklyProdukTerjual[dataPointIndex];
      const omzet = weeklyOmzet[dataPointIndex];
      const profit = weeklyProfitBersih[dataPointIndex];
      const fmt = (n: number) => 'Rp' + n.toLocaleString('id-ID');
      return `
        <div style="padding:10px 14px;background:#000;color:#fff;border-radius:8px;font-family:inherit;min-width:170px;">
          <div style="font-weight:600;margin-bottom:6px;">Tanggal ${weeklyCategories[dataPointIndex]}</div>
          <div style="display:flex;justify-content:space-between;gap:12px;"><span>Produk Terjual</span><b>${produk}</b></div>
          <div style="display:flex;justify-content:space-between;gap:12px;"><span>Omzet</span><b>${fmt(
            omzet,
          )}</b></div>
          <div style="display:flex;justify-content:space-between;gap:12px;"><span>Profit Bersih</span><b>${fmt(
            profit,
          )}</b></div>
        </div>
      `;
    },
  },
  xaxis: {
    categories: weeklyCategories,
    show: false,
    labels: {
      show: true,
      style: {
        colors: '#A3AED0',
        fontSize: '14px',
        fontWeight: '500',
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: false,
    color: 'black',
    labels: {
      show: false,
      style: {
        colors: '#A3AED0',
        fontSize: '14px',
        fontWeight: '500',
      },
    },
  },
  grid: {
    borderColor: 'rgba(163, 174, 208, 0.3)',
    show: true,
    yaxis: {
      lines: {
        show: false,
        opacity: 0.5,
      },
    },
    row: {
      opacity: 0.5,
    },
    xaxis: {
      lines: {
        show: false,
      },
    },
  },
  fill: {
    type: 'solid',
    colors: ['#6AD2FA', '#4318FF', '#EFF4FB'],
  },
  legend: {
    show: false,
  },
  colors: ['#6AD2FA', '#4318FF', '#EFF4FB'],
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      columnWidth: '20px',
    },
  },
};
