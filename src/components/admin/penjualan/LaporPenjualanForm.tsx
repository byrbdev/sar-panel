'use client';
import React from 'react';
import InputField from 'components/fields/InputField';
import { MdContentPaste } from 'react-icons/md';

export type LaporPenjualanValue = {
  nama: string;
  noHp: string;
  alamat: string;
  toko: string;
  produk: string;
  varian: string;
  sku: string;
  noPesananAL: string;
  keterangan: string;
};

export const emptyLaporForm = (defaultToko = ''): LaporPenjualanValue => ({
  nama: '',
  noHp: '',
  alamat: '',
  toko: defaultToko,
  produk: '',
  varian: '',
  sku: '',
  noPesananAL: '',
  keterangan: '',
});

const toTitleCase = (text: string) =>
  text.replace(
    /[A-Za-zÀ-ÿ]+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );

const parseAkulakuAddress = (
  text: string,
): { nama: string; hp: string; alamat: string } => {
  const get = (keys: string[]) => {
    for (const key of keys) {
      const regex = new RegExp(key + '\\s*:\\s*(.+)', 'i');
      const m = text.match(regex);
      if (m) return m[1].trim();
    }
    return '';
  };
  const nama = get(['Nama penerima', 'Nama Penerima', 'Nama']);
  const hp = get(['Nomor Handphone', 'No HP', 'Nomor HP', 'HP']);
  const alamat = get(['Alamat Lengkap', 'Alamat']);
  const kec = get(['Kecamatan']);
  const kota = get(['Kota']);
  const prov = get(['Provinsi']);
  const kodepos = get(['Kode Pos', 'Kodepos']);
  const parts = [alamat, kec, kota, prov, kodepos].filter(Boolean);
  return {
    nama: toTitleCase(nama),
    hp,
    alamat: toTitleCase(parts.join(', ')),
  };
};

const LaporPenjualanForm = (props: {
  value: LaporPenjualanValue;
  onChange: (value: LaporPenjualanValue) => void;
  daftarToko: string[];
}) => {
  const { value, onChange, daftarToko } = props;
  const [pasteText, setPasteText] = React.useState('');
  const [pasteMsg, setPasteMsg] = React.useState('');

  const applyParsed = (text: string) => {
    const parsed = parseAkulakuAddress(text);
    if (!parsed.nama && !parsed.hp && !parsed.alamat) {
      setPasteMsg('Format tidak dikenali.');
      return;
    }
    onChange({
      ...value,
      nama: parsed.nama || value.nama,
      noHp: parsed.hp || value.noHp,
      alamat: parsed.alamat || value.alamat,
    });
    const filled = [
      parsed.nama && 'nama',
      parsed.hp && 'HP',
      parsed.alamat && 'alamat',
    ]
      .filter(Boolean)
      .join(', ');
    setPasteMsg('Berhasil mengisi: ' + filled);
    setTimeout(() => setPasteMsg(''), 3000);
  };

  const handle =
    (field: keyof LaporPenjualanValue) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ ...value, [field]: e.target.value });
    };

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-xl bg-lightPrimary p-3 text-xs text-gray-600 dark:bg-navy-700 dark:text-gray-300">
        Laporan ini akan masuk ke <b>Pesanan Masuk</b> Admin dengan status{' '}
        <b>Menunggu</b>. Admin akan memproses & mengisi detail harga/pengiriman.
      </p>

      {/* Tempel info dari Akulaku */}
      <div className="space-y-2 rounded-xl border border-dashed border-gray-300 bg-lightPrimary/60 p-4 dark:border-white/15 dark:bg-navy-700/60">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <MdContentPaste className="h-4 w-4" />
          <span>Tempel info penerima dari Akulaku (opsional)</span>
        </div>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          onPaste={(e) => {
            setTimeout(() => {
              const val = e.currentTarget.value;
              if (val) {
                applyParsed(val);
                setPasteText('');
              }
            }, 50);
          }}
          placeholder={
            'Nama penerima :  ...\nNomor Handphone :  ...\nAlamat Lengkap :  ...'
          }
          rows={3}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 font-mono text-xs text-navy-700 outline-none focus:border-brand-400 dark:border-white/10 dark:bg-navy-800 dark:text-white"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              applyParsed(pasteText);
              if (pasteText) setPasteText('');
            }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-navy-700 transition duration-150 hover:bg-white dark:border-white/15 dark:text-white dark:hover:bg-white/10"
          >
            Isi Otomatis
          </button>
          {pasteMsg && (
            <span className="text-xs text-brand-500 dark:text-green-400">
              {pasteMsg}
            </span>
          )}
        </div>
      </div>

      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Info Pembeli
      </p>
      <InputField
        id="lp_nama"
        label="Nama"
        placeholder="Nama pembeli"
        type="text"
        extra=""
        value={value.nama}
        onChange={handle('nama')}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="lp_noHp"
          label="Nomor HP"
          placeholder="081234567890"
          type="text"
          extra=""
          value={value.noHp}
          onChange={handle('noHp')}
        />
        <InputField
          id="lp_alamat"
          label="Alamat"
          placeholder="Alamat lengkap"
          type="text"
          extra=""
          value={value.alamat}
          onChange={handle('alamat')}
        />
      </div>

      <p className="mb-1 mt-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Info Pesanan
      </p>
      <div>
        <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
          Toko
        </label>
        <select
          value={value.toko}
          onChange={(e) => onChange({ ...value, toko: e.target.value })}
          className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
        >
          <option value="">Pilih toko...</option>
          {daftarToko.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <InputField
        id="lp_produk"
        label="Produk"
        placeholder="Nama produk"
        type="text"
        extra=""
        value={value.produk}
        onChange={handle('produk')}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="lp_varian"
          label="Varian Produk"
          placeholder="Contoh: Hitam, size L"
          type="text"
          extra=""
          value={value.varian}
          onChange={handle('varian')}
        />
        <InputField
          id="lp_sku"
          label="SKU"
          placeholder="SKU-001"
          type="text"
          extra=""
          value={value.sku}
          onChange={handle('sku')}
        />
      </div>
      <InputField
        id="lp_noPesananAL"
        label="No Pesanan AL"
        placeholder="AL-20260101-001"
        type="text"
        extra=""
        value={value.noPesananAL}
        onChange={handle('noPesananAL')}
      />
      <div>
        <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
          Keterangan (opsional)
        </label>
        <textarea
          value={value.keterangan}
          onChange={handle('keterangan')}
          rows={3}
          placeholder="Catatan tambahan untuk admin..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none focus:border-brand-400 dark:border-white/10 dark:text-white"
        />
      </div>
    </div>
  );
};

export default LaporPenjualanForm;
