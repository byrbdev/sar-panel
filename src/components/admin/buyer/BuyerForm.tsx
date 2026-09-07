'use client';
import InputField from 'components/fields/InputField';
import { BuyerRow, BuyerStatus } from 'variables/dropshipBuyer';

export type BuyerFormValue = Omit<BuyerRow, 'id'>;

export const emptyBuyerForm = (): BuyerFormValue => ({
  noHp: '',
  akunBuyer: '',
  akunAL: '',
  status: 'KOSONG',
  keterangan: '',
  tanggal: new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
});

const BuyerForm = (props: {
  value: BuyerFormValue;
  onChange: (value: BuyerFormValue) => void;
}) => {
  const { value, onChange } = props;

  const handle =
    (field: keyof BuyerFormValue) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ ...value, [field]: e.target.value });
    };

  return (
    <div className="flex flex-col gap-5">
      <InputField
        id="b_noHp"
        label="Nomor HP"
        placeholder="081234567890"
        type="text"
        extra=""
        value={value.noHp}
        onChange={handle('noHp')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="b_akunBuyer"
          label="Akun Buyer"
          placeholder="username.buyer"
          type="text"
          extra=""
          value={value.akunBuyer}
          onChange={handle('akunBuyer')}
        />
        <InputField
          id="b_akunAL"
          label="Akun AL"
          placeholder="AL-BUYER-00000"
          type="text"
          extra=""
          value={value.akunAL}
          onChange={handle('akunAL')}
        />
      </div>

      <div>
        <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
          Status
        </label>
        <select
          value={value.status}
          onChange={(e) =>
            onChange({ ...value, status: e.target.value as BuyerStatus })
          }
          className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
        >
          <option value="DIPAKAI">DIPAKAI</option>
          <option value="KOSONG">KOSONG</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
          Keterangan
        </label>
        <textarea
          value={value.keterangan}
          onChange={handle('keterangan')}
          rows={3}
          placeholder="Catatan tambahan seputar akun buyer ini..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none focus:border-brand-400 dark:border-white/10 dark:text-white"
        />
      </div>
    </div>
  );
};

export default BuyerForm;
