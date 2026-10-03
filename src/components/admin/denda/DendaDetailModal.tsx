'use client';
import {
  MdCalendarToday,
  MdGavel,
  MdNotes,
  MdPerson,
  MdPayments,
  MdStorefront,
} from 'react-icons/md';
import { DendaToko } from 'variables/dropshipDenda';
import { formatDenda } from 'utils/dendaHelpers';

const Row = (props: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  valueClass?: string;
}) => {
  const { icon, label, value, valueClass } = props;
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-lightPrimary text-gray-600 dark:bg-navy-700 dark:text-gray-300">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="mb-0.5 text-xs leading-none text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p
          className={`whitespace-pre-wrap break-words text-base ${valueClass || 'text-navy-700 dark:text-white'}`}
        >
          {value || '-'}
        </p>
      </div>
    </div>
  );
};

/** Isi overlay "Detail Denda" -- read only (tidak ada tombol ubah/hapus). */
const DendaDetailModal = (props: { denda: DendaToko }) => {
  const { denda } = props;
  return (
    <div>
      <div className="mb-5 flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lightPrimary dark:bg-navy-700">
          <MdGavel className="h-5 w-5 text-brand-500 dark:text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy-700 dark:text-white">
            {denda.namaToko}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Denda Toko
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        <Row
          icon={<MdCalendarToday className="h-3.5 w-3.5" />}
          label="Tanggal"
          value={denda.tanggal}
        />
        <Row
          icon={<MdStorefront className="h-3.5 w-3.5" />}
          label="Nama Toko"
          value={denda.namaToko}
        />
        <Row
          icon={<MdPerson className="h-3.5 w-3.5" />}
          label="Pemilik Toko"
          value={denda.pemilik}
        />
        <Row
          icon={<MdNotes className="h-3.5 w-3.5" />}
          label="Keterangan"
          value={denda.keterangan}
        />
        <Row
          icon={<MdPayments className="h-3.5 w-3.5" />}
          label="Jumlah Denda"
          value={formatDenda(denda.jumlah)}
          valueClass="font-bold text-red-500"
        />
      </div>
    </div>
  );
};

export default DendaDetailModal;
