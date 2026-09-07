'use client';
import React from 'react';
import InputField from 'components/fields/InputField';
import SearchableSelect from 'components/fields/SearchableSelect';
import { MdContentPaste } from 'react-icons/md';
import {
  JASA_PENGIRIMAN,
  Penjualan,
  StatusPengiriman,
  StatusAkunToko,
} from 'variables/dropshipPenjualan';
import { useAppData } from 'context/AppDataContext';

export type PenjualanFormValue = Omit<Penjualan, 'id'>;

const emptyForm: PenjualanFormValue = {
  namaToko: '',
  namaPembeli: '',
  noHp: '',
  alamatPembeli: '',
  namaProduk: '',
  skuProduk: '',
  hargaJual: 0,
  modalShopee: 0,
  noResi: '',
  jasaPengiriman: JASA_PENGIRIMAN[0],
  statusPengiriman: 'Terkirim',
  statusAkunToko: 'Aktif',
  tanggalTransaksi: new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
};

export { emptyForm };

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

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

const PenjualanForm = (props: {
  value: PenjualanFormValue;
  onChange: (value: PenjualanFormValue) => void;
  statusOptions?: StatusPengiriman[];
}) => {
  const { value, onChange, statusOptions = ['Terkirim', 'Refund'] } = props;
  const { toko } = useAppData();
  const daftarToko = toko.map((t) => t.namaToko);
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
      namaPembeli: parsed.nama || value.namaPembeli,
      noHp: parsed.hp || value.noHp,
      alamatPembeli: parsed.alamat || value.alamatPembeli,
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
    (field: keyof PenjualanFormValue, numeric?: boolean) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      onChange({
        ...value,
        [field]: numeric ? Number(raw.replace(/[^0-9]/g, '')) || 0 : raw,
      });
    };

  const profit = value.hargaJual - value.modalShopee;

  return (
    <div className="flex flex-col gap-5">
      {/* Auto Paste */}
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

      {/* Toko (searchable) */}
      <SearchableSelect
        label="Toko (Akulaku)"
        options={daftarToko}
        value={value.namaToko}
        onChange={(v) => onChange({ ...value, namaToko: v })}
        placeholder="Pilih toko..."
      />

      {/* Pembeli */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="namaPembeli"
          label="Nama Pembeli"
          placeholder="Nama pembeli"
          type="text"
          extra=""
          value={value.namaPembeli}
          onChange={handle('namaPembeli')}
        />
        <InputField
          id="noHp"
          label="Nomor HP"
          placeholder="081234567890"
          type="text"
          extra=""
          value={value.noHp}
          onChange={handle('noHp')}
        />
      </div>
      <InputField
        id="alamatPembeli"
        label="Alamat Pembeli"
        placeholder="Alamat lengkap pembeli"
        type="text"
        extra=""
        value={value.alamatPembeli}
        onChange={handle('alamatPembeli')}
      />

      {/* Produk */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="namaProduk"
          label="Nama Produk"
          placeholder="Nama produk"
          type="text"
          extra=""
          value={value.namaProduk}
          onChange={handle('namaProduk')}
        />
        <InputField
          id="skuProduk"
          label="SKU Produk (opsional)"
          placeholder="SKU-001"
          type="text"
          extra=""
          value={value.skuProduk}
          onChange={handle('skuProduk')}
        />
      </div>

      {/* Harga */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="hargaJual"
          label="Penghasilan / Omzet (Rp)"
          placeholder="0"
          type="text"
          extra=""
          value={String(value.hargaJual)}
          onChange={handle('hargaJual', true)}
        />
        <InputField
          id="modalShopee"
          label="Modal (Rp)"
          placeholder="0"
          type="text"
          extra=""
          value={String(value.modalShopee)}
          onChange={handle('modalShopee', true)}
        />
      </div>

      {/* Profit otomatis */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-lightPrimary px-4 py-3.5 dark:border-white/10 dark:bg-navy-700">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Profit Bersih (otomatis)
        </span>
        <span
          className={`text-base font-bold ${
            profit >= 0
              ? 'text-green-500 dark:text-green-400'
              : 'text-red-500 dark:text-red-400'
          }`}
        >
          {formatRupiah(profit)}
        </span>
      </div>

      {/* Resi & jasa pengiriman */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="noResi"
          label="Nomor Resi"
          placeholder="Nomor resi pengiriman"
          type="text"
          extra=""
          value={value.noResi}
          onChange={handle('noResi')}
        />
        <div>
          <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
            Jasa Pengiriman
          </label>
          <select
            value={value.jasaPengiriman}
            onChange={(e) =>
              onChange({ ...value, jasaPengiriman: e.target.value })
            }
            className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
          >
            {JASA_PENGIRIMAN.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
            Status Pengiriman
          </label>
          <select
            value={value.statusPengiriman}
            onChange={(e) =>
              onChange({
                ...value,
                statusPengiriman: e.target.value as StatusPengiriman,
              })
            }
            className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
            Status Akun Toko
          </label>
          <select
            value={value.statusAkunToko}
            onChange={(e) =>
              onChange({
                ...value,
                statusAkunToko: e.target.value as StatusAkunToko,
              })
            }
            className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
          >
            <option value="Aktif">Aktif</option>
            <option value="Ban">Ban</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PenjualanForm;
