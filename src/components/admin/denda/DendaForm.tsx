'use client';
import InputField from 'components/fields/InputField';
import RupiahInput from 'components/fields/RupiahInput';
import SearchableSelect from 'components/fields/SearchableSelect';

export type DendaFormValue = {
  namaToko: string;
  keterangan: string;
  jumlah: number;
};

export const emptyDendaForm = (): DendaFormValue => ({
  namaToko: '',
  keterangan: '',
  jumlah: 0,
});

/**
 * Form Denda Toko -- dipakai Super Admin (Tambah Denda) dan Member (Lapor
 * Denda). Urutan field: Nama Toko -> Pemilik Toko (hanya Super Admin) ->
 * Keterangan -> Jumlah Denda.
 */
const DendaForm = (props: {
  value: DendaFormValue;
  onChange: (v: DendaFormValue) => void;
  /** Super Admin: semua toko. Member: hanya toko miliknya. */
  tokoOptions: string[];
  /** Tampilkan field Pemilik Toko (otomatis dari toko terpilih). */
  showPemilik?: boolean;
  pemilik?: string;
  /** true bila toko terpilih belum punya pemilik di halaman Toko. */
  tanpaPemilik?: boolean;
}) => {
  const { value, onChange, tokoOptions, showPemilik, pemilik, tanpaPemilik } =
    props;

  return (
    <div className="grid grid-cols-1 gap-5">
      <SearchableSelect
        label="Nama Toko"
        options={tokoOptions}
        value={value.namaToko}
        onChange={(v) => onChange({ ...value, namaToko: v })}
        placeholder="Pilih toko..."
      />
      {tokoOptions.length === 0 && (
        <p className="-mt-3 ml-1.5 text-xs font-medium text-red-500">
          Belum ada toko yang terdaftar atas nama kamu. Hubungi Super Admin.
        </p>
      )}

      {showPemilik && (
        <>
          <InputField
            id="pemilikTokoDenda"
            label="Pemilik Toko"
            placeholder="Otomatis dari toko yang dipilih"
            type="text"
            extra=""
            disabled
            value={pemilik || ''}
          />
          {tanpaPemilik && (
            <p className="-mt-3 ml-1.5 text-xs font-medium text-red-500">
              Toko ini belum punya pemilik. Atur dulu pemiliknya di tabel Toko
              supaya denda bisa dikaitkan ke member.
            </p>
          )}
        </>
      )}

      <InputField
        id="keteranganDenda"
        label="Keterangan"
        placeholder="Contoh: Penalti keterlambatan kirim"
        type="text"
        extra=""
        value={value.keterangan}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...value, keterangan: e.target.value })
        }
      />

      <RupiahInput
        id="jumlahDenda"
        label="Jumlah Denda (Rp)"
        value={value.jumlah}
        onChange={(v) => onChange({ ...value, jumlah: v })}
      />

      <p className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
        Denda ini hanya dicatat, tidak mengurangi omzet maupun profit.
      </p>
    </div>
  );
};

export default DendaForm;
