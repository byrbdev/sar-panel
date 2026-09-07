'use client';
import {
  MdPerson,
  MdPhone,
  MdQrCode2,
  MdCalendarToday,
  MdNotes,
} from 'react-icons/md';
import { BuyerRow, BuyerStatus } from 'variables/dropshipBuyer';

const statusStyle: Record<BuyerStatus, string> = {
  DIPAKAI: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300',
  KOSONG:
    'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-300',
};

const Row = (props: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => {
  const { icon, label, value } = props;
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-lightPrimary text-gray-600 dark:bg-navy-700 dark:text-gray-300">
        {icon}
      </div>
      <div>
        <p className="mb-0.5 text-xs leading-none text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-base leading-snug text-navy-700 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
};

const SectionLabel = (props: { children: React.ReactNode }) => (
  <p className="mb-3 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
    {props.children}
  </p>
);

const BuyerDetailModal = (props: { buyer: BuyerRow }) => {
  const { buyer } = props;
  return (
    <div>
      <div className="mb-5 flex items-start gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lightPrimary dark:bg-navy-700">
          <MdPerson className="h-5 w-5 text-brand-500 dark:text-white" />
        </div>
        <div>
          <p className="font-semibold leading-tight text-navy-700 dark:text-white">
            {buyer.akunBuyer}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {buyer.noHp}
          </p>
          <div className="mt-1.5">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[buyer.status]}`}
            >
              {buyer.status}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        <SectionLabel>Info Akun</SectionLabel>
        <Row
          icon={<MdPhone className="h-3.5 w-3.5" />}
          label="Nomor HP"
          value={buyer.noHp}
        />
        <div className="mt-3.5">
          <Row
            icon={<MdPerson className="h-3.5 w-3.5" />}
            label="Akun Buyer"
            value={buyer.akunBuyer}
          />
        </div>
        <div className="mt-3.5">
          <Row
            icon={<MdQrCode2 className="h-3.5 w-3.5" />}
            label="Akun AL"
            value={buyer.akunAL}
          />
        </div>
        <div className="mt-3.5">
          <Row
            icon={<MdCalendarToday className="h-3.5 w-3.5" />}
            label="Tanggal"
            value={buyer.tanggal}
          />
        </div>

        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Keterangan</SectionLabel>
          <Row
            icon={<MdNotes className="h-3.5 w-3.5" />}
            label="Catatan"
            value={buyer.keterangan || '-'}
          />
        </div>
      </div>
    </div>
  );
};

export default BuyerDetailModal;
