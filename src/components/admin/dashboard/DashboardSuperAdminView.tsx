'use client';
import PenjualanChart from 'components/admin/default/PenjualanChart';
import OmzetMingguan from 'components/admin/default/OmzetMingguan';
import TabelMasukRealtime from 'components/admin/default/TabelMasukRealtime';
import Widget from 'components/widget/Widget';
import { useAppData } from 'context/AppDataContext';
import { isBulanIni } from 'utils/analisaHelpers';
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
  const { refund, penjualan, orders } = useAppData();
  const penjualanBulanIni = penjualan.filter((p) =>
    isBulanIni(p.tanggalTransaksi),
  );
  const omzetBulanIni = penjualanBulanIni.reduce((a, p) => a + p.hargaJual, 0);
  const profitBulanIni = penjualanBulanIni.reduce(
    (a, p) => a + (p.hargaJual - p.modalShopee),
    0,
  );
  const jumlahProsesRefund = refund.filter((r) => r.status === 'Proses').length;

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
          subtitle={formatRupiah(profitBulanIni)}
        />
        <Widget
          icon={<MdShoppingBag className="h-7 w-7" />}
          title={'Produk Terjual'}
          subtitle={`${penjualanBulanIni.length} pcs`}
        />
        <Widget
          icon={<MdMoveToInbox className="h-6 w-6" />}
          title={'Masuk'}
          subtitle={`${orders.length} pesanan`}
        />
        <Widget
          icon={<MdOutlineAutorenew className="h-7 w-7" />}
          title={'Proses Refund'}
          subtitle={`${jumlahProsesRefund} pesanan`}
        />
        <Widget
          icon={<MdOutlineAssignmentReturn className="h-6 w-6" />}
          title={'Refund'}
          subtitle={`${refund.length} pesanan`}
        />
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
