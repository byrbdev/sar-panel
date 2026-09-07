import {
  MdArrowDropUp,
  MdOutlineCalendarToday,
  MdBarChart,
} from 'react-icons/md';
import Card from 'components/card';
import {
  lineChartDataPenjualan,
  lineChartOptionsPenjualan,
} from 'variables/dropshipCharts';
import LineChart from 'components/charts/LineChart';

const PenjualanChart = () => {
  return (
    <Card extra="!p-[20px] text-center">
      <div className="flex justify-between">
        <button className="linear mt-1 flex items-center justify-center gap-2 rounded-lg bg-lightPrimary p-2 text-gray-600 transition duration-200 hover:cursor-pointer hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:hover:opacity-90 dark:active:opacity-80">
          <MdOutlineCalendarToday />
          <span className="text-sm font-medium text-gray-600">
            Bulan ini
          </span>
        </button>
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
        <div className="flex flex-col">
          <p className="mt-[20px] whitespace-nowrap text-3xl font-bold text-navy-700 dark:text-white">
            Rp27,1 Jt
          </p>
          <div className="flex flex-col items-start">
            <p className="mt-2 text-sm text-gray-600">Total Penjualan</p>
            <div className="flex flex-row items-center justify-center">
              <MdArrowDropUp className="font-medium text-green-500" />
              <p className="text-sm font-bold text-green-500"> +12,8% </p>
            </div>
          </div>
        </div>
        <div className="h-full w-full">
          <LineChart
            chartOptions={lineChartOptionsPenjualan}
            chartData={lineChartDataPenjualan}
          />
        </div>
      </div>

      <p className="mt-3 text-left text-[11px] leading-tight text-gray-500 dark:text-gray-400">
        *Disclaimer: Data penjualan di atas bersifat estimasi berdasarkan
        transaksi yang tercatat di sistem dan dapat berubah sewaktu-waktu
        mengikuti pembaruan status pesanan, retur, atau penyesuaian dari
        marketplace. Seluruh nominal ditampilkan dalam mata uang Rupiah
        (IDR).
      </p>
    </Card>
  );
};

export default PenjualanChart;
