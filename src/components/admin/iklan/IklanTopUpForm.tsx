'use client';
import InputField from 'components/fields/InputField';
import RupiahInput from 'components/fields/RupiahInput';
import SearchableSelect from 'components/fields/SearchableSelect';
import { formatRupiahBersih } from 'utils/iklanHelpers';

export type IklanFormValue = {
  namaToko: string;
  jumlah: number;
  keterangan: string;
};

export const emptyIklanForm = (): IklanFormValue => ({
  namaToko: '',
  jumlah: 0,
  keterangan: '',
});

/** Hasil simulasi profit bersih pemilik toko untuk bulan Top Up ini. */
export type SimulasiProfit = {
  pemilik: string;
  /** Profit bersih bulan itu SEBELUM Top Up ini. */
  sebelum: number;
  /** Profit bersih bulan itu SETELAH Top Up ini. */
  sesudah: number;
};

const IklanTopUpForm = (props: {
  value: IklanFormValue;
  onChange: (v: IklanFormValue) => void;
  tokoOptions: string[];
  /** Nama pemilik toko terpilih (otomatis, tidak bisa diubah). */
  pemilik: string;
  /** true bila toko terpilih belum punya pemilik (owner) di halaman Toko. */
  tanpaPemilik: boolean;
  simulasi: SimulasiProfit | null;
}) => {
  const { value, onChange, tokoOptions, pemilik, tanpaPemilik, simulasi } =
    props;

  return (
    <div className="grid grid-cols-1 gap-5">
      <SearchableSelect
        label="Toko"
        options={tokoOptions}
        value={value.namaToko}
        onChange={(v) => onChange({ ...value, namaToko: v })}
        placeholder="Pilih toko..."
      />

      <InputField
        id="pemilikToko"
        label="Pemilik Toko"
        placeholder="Otomatis dari toko yang dipilih"
        type="text"
        extra=""
        disabled
        value={pemilik}
      />
      {tanpaPemilik && (
        <p className="-mt-3 ml-1.5 text-xs font-medium text-red-500">
          Toko ini belum punya pemilik. Atur dulu pemiliknya di halaman Toko
          supaya profit member bisa terpotong.
        </p>
      )}

      <div>
        <RupiahInput
          id="jumlahTopUp"
          label="Jumlah Top Up (Rp)"
          value={value.jumlah}
          onChange={(v) => onChange({ ...value, jumlah: v })}
        />
        {/* Badge simulasi: sisa profit bersih member setelah terpotong */}
        {simulasi && (
          <div className="mt-2 ml-1.5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                simulasi.sesudah >= 0
                  ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-300'
                  : 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300'
              }`}
            >
              Profit ({simulasi.pemilik}) {formatRupiahBersih(simulasi.sebelum)}{' '}
              → {formatRupiahBersih(simulasi.sesudah)}
            </span>
            {simulasi.sesudah < 0 && (
              <span className="text-[11px] font-medium text-red-500">
                Hutang iklan {formatRupiahBersih(-simulasi.sesudah)}
              </span>
            )}
          </div>
        )}
      </div>

      <InputField
        id="keteranganTopUp"
        label="Keterangan (opsional)"
        placeholder="Contoh: Top Up Shopee Ads"
        type="text"
        extra=""
        value={value.keterangan}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...value, keterangan: e.target.value })
        }
      />
    </div>
  );
};

export default IklanTopUpForm;
