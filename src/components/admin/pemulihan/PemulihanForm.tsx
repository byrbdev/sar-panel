'use client';
import InputField from 'components/fields/InputField';
import { useMember } from 'context/MemberContext';
import { PemulihanRow } from 'variables/dropshipPemulihan';

export type PemulihanFormValue = Omit<PemulihanRow, 'id'>;

const emptyForm: PemulihanFormValue = {
  nama: '',
  email: '',
  metode: '',
  namaToko: '',
  denda: 0,
  pelanggaran: '',
  saldoIklan: 0,
};

export { emptyForm };

const PemulihanForm = (props: {
  value: PemulihanFormValue;
  onChange: (value: PemulihanFormValue) => void;
}) => {
  const { value, onChange } = props;
  const { member, namaOptions } = useMember();

  const handleNamaChange = (nama: string) => {
    const found = member.find((m) => m.nama === nama);
    onChange({ ...value, nama, ownerId: found?.id });
  };

  const handle =
    (field: keyof PemulihanFormValue, numeric?: boolean) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      onChange({
        ...value,
        [field]: numeric ? Number(raw.replace(/[^0-9]/g, '')) || 0 : raw,
      });
    };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
          Nama
        </label>
        <select
          value={value.nama}
          onChange={(e) => handleNamaChange(e.target.value)}
          className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
        >
          <option value="">Pilih anggota...</option>
          {namaOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <InputField
        id="email"
        label="Email"
        placeholder="email@contoh.com"
        type="email"
        extra=""
        value={value.email}
        onChange={handle('email')}
      />
      <InputField
        id="metode"
        label="Metode"
        placeholder="Shopee / Tokopedia / Lazada"
        type="text"
        extra=""
        value={value.metode}
        onChange={handle('metode')}
      />
      <InputField
        id="namaToko"
        label="Nama Toko"
        placeholder="Nama toko"
        type="text"
        extra=""
        value={value.namaToko}
        onChange={handle('namaToko')}
      />
      <InputField
        id="denda"
        label="Denda (Rp)"
        placeholder="0"
        type="text"
        extra=""
        value={String(value.denda)}
        onChange={handle('denda', true)}
      />
      <InputField
        id="saldoIklan"
        label="Saldo Iklan (Rp)"
        placeholder="0"
        type="text"
        extra=""
        value={String(value.saldoIklan)}
        onChange={handle('saldoIklan', true)}
      />
      <InputField
        id="pelanggaran"
        label="Pelanggaran"
        placeholder="Contoh: Produk Duplikat, atau '-' jika tidak ada"
        type="text"
        extra="sm:col-span-2"
        value={value.pelanggaran}
        onChange={handle('pelanggaran')}
      />
    </div>
  );
};

export default PemulihanForm;
