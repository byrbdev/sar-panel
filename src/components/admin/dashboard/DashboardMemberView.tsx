'use client';
import Link from 'next/link';
import Widget from 'components/widget/Widget';
import PenjualanChart from 'components/admin/default/PenjualanChart';
import OmzetMingguan from 'components/admin/default/OmzetMingguan';
import { useScopedData } from 'hooks/useScopedData';
import { isBulanIni } from 'utils/analisaHelpers';
import {
  MdAttachMoney,
  MdSavings,
  MdShoppingBag,
  MdStorefront,
  MdHourglassEmpty,
  MdOutlineAssignmentReturn,
} from 'react-icons/md';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const DashboardMemberView = () => {
  const { toko, penjualan, orders, refund } = useScopedData();

  const penjualanBulanIni = penjualan.filter((p) =>
    isBulanIni(p.tanggalTransaksi),
  );
  const refundBulanIni = refund.filter((r) => isBulanIni(r.tanggal));
  const omzetBulanIni = penjualanBulanIni.reduce((a, p) => a + p.hargaJual, 0);
  const profitBulanIni = penjualanBulanIni.reduce(
    (a, p) => a + (p.hargaJual - p.modalShopee),
    0,
  );

  return (
    <div>
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6">
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
        <Link href="/admin/penjualan/menunggu">
          <Widget
            icon={<MdHourglassEmpty className="h-6 w-6" />}
            title={'Menunggu Diproses'}
            subtitle={`${orders.length} laporan`}
          />
        </Link>
        <Widget
          icon={<MdOutlineAssignmentReturn className="h-6 w-6" />}
          title={'Refund'}
          subtitle={`${refundBulanIni.length} pesanan`}
        />
      </div>

      {toko.length === 0 && (
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          Belum ada toko yang di-setting sebagai milik kamu. Hubungi Super
          Admin untuk mengaitkan toko ke akunmu.
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <PenjualanChart data={penjualan} />
        <OmzetMingguan data={penjualan} />
      </div>
    </div>
  );
};

export default DashboardMemberView;
