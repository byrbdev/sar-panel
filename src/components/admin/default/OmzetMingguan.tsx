import Card from 'components/card';
import BarChart from 'components/charts/BarChart';
import {
  barChartDataOmzetMingguan,
  barChartOptionsOmzetMingguan,
} from 'variables/dropshipCharts';
import { MdBarChart } from 'react-icons/md';

const OmzetMingguan = () => {
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
          <BarChart
            chartData={barChartDataOmzetMingguan}
            chartOptions={barChartOptionsOmzetMingguan}
          />
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
