'use client';
import {
  MdStorefront,
  MdEmail,
  MdPhone,
  MdCreditCard,
  MdPerson,
  MdWarningAmber,
  MdAccountBalanceWallet,
} from 'react-icons/md';
import { PemulihanRow } from 'variables/dropshipPemulihan';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const Row = (props: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => {
  const { icon, label, value } = props;
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-lightPrimary text-gray-600 dark:bg-navy-700 dark:text-gray-300">
        {icon}
      </div>
      <div>
        <p className="mb-0.5 text-xs leading-none text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-base text-navy-700 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

const TokoDetailModal = (props: { toko: PemulihanRow }) => {
  const { toko } = props;

  const rows: { icon: React.ReactNode; label: string; value: string | null }[] =
    [
      {
        icon: <MdPerson className="h-3.5 w-3.5" />,
        label: 'Nama',
        value: toko.nama,
      },
      {
        icon: <MdEmail className="h-3.5 w-3.5" />,
        label: 'Email',
        value: toko.email,
      },
      {
        icon: <MdCreditCard className="h-3.5 w-3.5" />,
        label: 'Metode',
        value: toko.metode,
      },
      {
        icon: <MdWarningAmber className="h-3.5 w-3.5" />,
        label: 'Denda',
        value: formatRupiah(toko.denda),
      },
      {
        icon: <MdPhone className="h-3.5 w-3.5" />,
        label: 'Pelanggaran',
        value: toko.pelanggaran,
      },
      {
        icon: <MdAccountBalanceWallet className="h-3.5 w-3.5" />,
        label: 'Saldo Iklan',
        value: formatRupiah(toko.saldoIklan),
      },
    ];

  return (
    <div>
      <div className="mb-5 flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lightPrimary dark:bg-navy-700">
          <MdStorefront className="h-5 w-5 text-brand-500 dark:text-white" />
        </div>
        <div>
          <p className="font-semibold text-navy-700 dark:text-white">
            {toko.namaToko}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Akun Toko Dropship
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {rows.map((r) => (
          <Row key={r.label} icon={r.icon} label={r.label} value={r.value} />
        ))}
      </div>
    </div>
  );
};

export default TokoDetailModal;
