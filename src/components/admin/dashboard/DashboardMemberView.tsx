'use client';
import Widget from 'components/widget/Widget';
import { useScopedData } from 'hooks/useScopedData';
import { isBulanIni } from 'utils/analisaHelpers';
import {
  MdAttachMoney,
  MdSavings,
  MdShoppingBag,
  MdStorefront,
  MdHourglassEmpty,
} from 'react-icons/md';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const DashboardMemberView = () => {
  const { toko, penjualan, orders } = useScopedData();

  const penjualanBulanIni = penjualan.filter((p) =>
    isBulanIni(p.tanggalTransaksi),
  );
  const omzetBulanIni = penjualanBulanIni.reduce((a, p) => a + p.hargaJual, 0);
  const profitBulanIni = penjualanBulanIni.reduce(
    (a, p) => a + (p.hargaJual - p.modalShopee),
    0,
  );

  return (
    <div>
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-5">
        <Widget
          icon={<MdStorefront className="h-6 w-6" />}
          title={'Toko Saya'}
          subtitle={`${toko.length} toko`}
        />
        <Widget
          icon={<MdAttachMoney className="h-7 w-7" />}
          title={'Omzet Bulan Ini'}
          subtitle={formatRupiah(omzetBulanIni)}
        />
        <Widget
          icon={<MdSavings className="h-6 w-6" />}
          title={'Profit Bersih'}
          subtitle={formatRupiah(profitBulanIni)}
        />
        <Widget
          icon={<MdShoppingBag className="h-7 w-7" />}
          title={'Produk Terjual'}
          subtitle={`${penjualanBulanIni.length} pcs`}
        />
        <Widget
          icon={<MdHourglassEmpty className="h-6 w-6" />}
          title={'Menunggu Diproses'}
          subtitle={`${orders.length} laporan`}
        />
      </div>

      {toko.length === 0 && (
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          Belum ada toko yang di-setting sebagai milik kamu. Hubungi Super
          Admin untuk mengaitkan toko ke akunmu.
        </div>
      )}
    </div>
  );
};

export default DashboardMemberView;
