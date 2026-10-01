'use client';
import Link from 'next/link';
import PenjualanChart from 'components/admin/default/PenjualanChart';
import OmzetMingguan from 'components/admin/default/OmzetMingguan';
import TabelMasukRealtime from 'components/admin/default/TabelMasukRealtime';
import Widget from 'components/widget/Widget';
import { useAppData } from 'context/AppDataContext';
import { isInBulan } from 'utils/analisaHelpers';
import { useBulanBerjalan } from 'hooks/useBulanBerjalan';
import { formatRupiahBersih, ringkasProfitBulan } from 'utils/iklanHelpers';
import {
  MdAttachMoney,
  MdSavings,
  MdShoppingBag,
  MdMoveToInbox,
  MdOutlineAutorenew,
  MdOutlineAssignmentReturn,
} from 'react-icons/md';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const DashboardSuperAdminView = () => {
  const { refund, penjualan, orders, iklan, toko } = useAppData();
  const bulanKey = useBulanBerjalan(); // ganti bulan otomatis tanpa refresh
  const penjualanBulanIni = penjualan.filter((p) =>
    isInBulan(p.tanggalIso, p.tanggalTransaksi, bulanKey),
  );
  const refundBulanIni = refund.filter((r) =>
    isInBulan(r.tanggalIso, r.tanggal, bulanKey),
  );
  const omzetBulanIni = penjualanBulanIni.reduce((a, p) => a + p.hargaJual, 0);
  // Profit bersih semua member = profit penjualan - Top Up iklan bulan ini.
  const profitBulanIni = ringkasProfitBulan(
    penjualan,
    iklan,
    bulanKey,
    toko,
  ).profitBersih;
  const jumlahProsesRefund = refundBulanIni.filter(
    (r) => r.status === 'Proses',
  ).length;

  return (
    <div>
      {/* Card widget */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<MdAttachMoney className="h-7 w-7" />}
          title={'Omzet Bulan Ini'}
          subtitle={formatRupiah(omzetBulanIni)}
        />
        <Widget
          icon={<MdSavings className="h-6 w-6" />}
          title={'Profit Bersih'}
          subtitle={formatRupiahBersih(profitBulanIni)}
        />
        <Widget
          icon={<MdShoppingBag className="h-7 w-7" />}
          title={'Produk Terjual'}
          subtitle={`${penjualanBulanIni.length} pcs`}
        />
        <Link href="/admin/pesanan-masuk">
          <Widget
            icon={<MdMoveToInbox className="h-6 w-6" />}
            title={'Masuk'}
            subtitle={`${orders.length} pesanan`}
          />
        </Link>
        <Link href="/admin/refund">
          <Widget
            icon={<MdOutlineAutorenew className="h-7 w-7" />}
            title={'Proses Refund'}
            subtitle={`${jumlahProsesRefund} pesanan`}
          />
        </Link>
        <Link href="/admin/refund">
          <Widget
            icon={<MdOutlineAssignmentReturn className="h-6 w-6" />}
            title={'Refund'}
            subtitle={`${refundBulanIni.length} pesanan`}
          />
        </Link>
      </div>

      {/* Charts */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <PenjualanChart />
        <OmzetMingguan />
      </div>

      {/* Table */}
      <div className="mt-5 grid grid-cols-1 gap-5">
        <TabelMasukRealtime />
      </div>
    </div>
  );
};

export default DashboardSuperAdminView;
