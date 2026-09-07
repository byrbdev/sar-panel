'use client';
import TabelMasukRealtime from 'components/admin/default/TabelMasukRealtime';
import Widget from 'components/widget/Widget';
import { useAppData } from 'context/AppDataContext';
import {
  MdMoveToInbox,
  MdOutlineAutorenew,
  MdOutlineAssignmentReturn,
} from 'react-icons/md';

const DashboardAdminView = () => {
  const { refund, orders } = useAppData();
  const jumlahProsesRefund = refund.filter((r) => r.status === 'Proses').length;

  return (
    <div>
      {/* Sesuai tugas Admin: hanya ringkasan Pesanan Masuk & Refund */}
      <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Widget
          icon={<MdMoveToInbox className="h-6 w-6" />}
          title={'Pesanan Masuk'}
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

      <div className="mt-5 grid grid-cols-1 gap-5">
        <TabelMasukRealtime />
      </div>
    </div>
  );
};

export default DashboardAdminView;
