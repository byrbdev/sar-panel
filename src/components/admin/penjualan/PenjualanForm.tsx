'use client';
import React from 'react';
import InputField from 'components/fields/InputField';
import SearchableSelect from 'components/fields/SearchableSelect';
import RupiahInput from 'components/fields/RupiahInput';
import ProdukTambahan from 'components/admin/penjualan/ProdukTambahan';
import JumlahInput from 'components/fields/JumlahInput';
import { MdContentPaste } from 'react-icons/md';
import { SectionLabel } from 'components/admin/resi/ResiInputModal';
import {
  JASA_PENGIRIMAN,
  jasaOptions,
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
  varian: '',
  skuProduk: '',
  jumlah: 1,
  produkList: [],
  noPesananAL: '',
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
  /** true saat mode edit data yang sudah ada: No Pesanan AL dikunci (read-only) supaya identitas pesanan dari Akulaku tidak berubah tidak sengaja. */
  lockNoPesananAL?: boolean;
}) => {
  const {
    value,
    onChange,
    statusOptions = ['Terkirim', 'Refund'],
    lockNoPesananAL,
  } = props;
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

  // ---- Resi: Sama / Berbeda (hanya kalau produk lebih dari satu) ----
  const produkTambahan = value.produkList || [];
  const multi = produkTambahan.length > 0;
  const [resiMode, setResiMode] = React.useState<'sama' | 'beda'>(
    produkTambahan.some((p) => (p.noResi || '').trim()) ? 'beda' : 'sama',
  );
  const beda = multi && resiMode === 'beda';
  const defaultJasa = value.jasaPengiriman || JASA_PENGIRIMAN[0];

  const semuaProduk = [
    {
      id: 'utama',
      namaProduk: value.namaProduk,
      varian: value.varian,
      skuProduk: value.skuProduk,
    },
    ...produkTambahan,
  ];

  const switchResiMode = (mode: 'sama' | 'beda') => {
    setResiMode(mode);
    if (mode === 'sama') {
      // Resi Sama: bersihkan resi per produk supaya tidak dianggap "beda"
      onChange({
        ...value,
        produkList: produkTambahan.map((p) => ({
          ...p,
          noResi: '',
          jasaPengiriman: '',
        })),
      });
    } else {
      onChange({
        ...value,
        jasaPengiriman: defaultJasa,
        produkList: produkTambahan.map((p) => ({
          ...p,
          jasaPengiriman: p.jasaPengiriman || defaultJasa,
        })),
      });
    }
  };

  const setResiProduk = (
    id: string,
    field: 'noResi' | 'jasaPengiriman',
    val: string,
  ) => {
    if (id === 'utama') {
      onChange({ ...value, [field]: val });
      return;
    }
    onChange({
      ...value,
      produkList: produkTambahan.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: val,
              jasaPengiriman:
                field === 'jasaPengiriman'
                  ? val
                  : p.jasaPengiriman || defaultJasa,
            }
          : p,
      ),
    });
  };

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

      {/* Section 1 - Info Pesanan */}
      <div className="flex flex-col gap-4">
        <SectionLabel>Info Pesanan</SectionLabel>
        <SearchableSelect
          label="Toko (Akulaku)"
          options={daftarToko}
          value={value.namaToko}
          onChange={(v) => onChange({ ...value, namaToko: v })}
          placeholder="Pilih toko..."
        />
        <InputField
          id="noPesananAL"
          label={lockNoPesananAL ? 'No Pesanan AL (read-only)' : 'No Pesanan AL'}
          placeholder="AL-20260101-001"
          type="text"
          extra=""
          disabled={lockNoPesananAL}
          value={value.noPesananAL}
          onChange={handle('noPesananAL')}
        />
      </div>

      {/* Section 2 - Info Pembeli */}
      <div className="flex flex-col gap-4 border-t border-gray-200 pt-5 dark:border-white/10">
        <SectionLabel>Info Pembeli</SectionLabel>
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
      </div>

      {/* Section 3 - Produk */}
      <div className="flex flex-col gap-4 border-t border-gray-200 pt-5 dark:border-white/10">
        <SectionLabel>Produk</SectionLabel>
        <InputField
          id="namaProduk"
          label="Nama Produk"
          placeholder="Nama produk"
          type="text"
          extra=""
          value={value.namaProduk}
          onChange={handle('namaProduk')}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            id="varian"
            label="Varian Produk"
            placeholder="Contoh: Hitam, size L"
            type="text"
            extra=""
            value={value.varian}
            onChange={handle('varian')}
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
        <JumlahInput
          id="jumlah"
          value={value.jumlah}
          onChange={(n) => onChange({ ...value, jumlah: n })}
        />
        <ProdukTambahan
          produkList={value.produkList || []}
          onChange={(list) => onChange({ ...value, produkList: list })}
        />
      </div>

      {/* Section 4 - Finansial */}
      <div className="flex flex-col gap-4 border-t border-gray-200 pt-5 dark:border-white/10">
        <SectionLabel>Finansial</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RupiahInput
            id="hargaJual"
            label="Penghasilan / Omzet (Rp)"
            value={value.hargaJual}
            onChange={(v) => onChange({ ...value, hargaJual: v })}
          />
          <RupiahInput
            id="modalShopee"
            label="Modal (Rp)"
            value={value.modalShopee}
            onChange={(v) => onChange({ ...value, modalShopee: v })}
          />
        </div>
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
      </div>

      {/* Section 5 - Pengiriman */}
      <div className="flex flex-col gap-4 border-t border-gray-200 pt-5 dark:border-white/10">
        <SectionLabel>Pengiriman</SectionLabel>
      {multi && (
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-lightPrimary p-1 dark:bg-navy-700">
          {(
            [
              ['sama', 'Resi Sama'],
              ['beda', 'Resi Berbeda'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchResiMode(key)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition duration-150 ${
                resiMode === key
                  ? 'bg-white text-brand-500 shadow-sm dark:bg-navy-800 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {!beda && (
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
              {jasaOptions(value.jasaPengiriman).map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {beda && (
        <div className="space-y-3">
          {semuaProduk.map((p, idx) => {
            const resiVal =
              p.id === 'utama' ? value.noResi : (p as any).noResi || '';
            const jasaVal =
              p.id === 'utama'
                ? value.jasaPengiriman
                : (p as any).jasaPengiriman || defaultJasa;
            return (
              <div
                key={p.id}
                className="rounded-xl border border-gray-200 p-3 dark:border-white/10"
              >
                <p className="mb-3 break-words text-sm font-semibold text-navy-700 dark:text-white">
                  {idx + 1}. {p.namaProduk || '(tanpa nama)'}
                  {p.varian ? ` (${p.varian})` : ''}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InputField
                    id={`resi-${p.id}`}
                    label="Nomor Resi"
                    placeholder="Nomor resi produk ini"
                    type="text"
                    extra=""
                    value={resiVal}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setResiProduk(p.id, 'noResi', e.target.value)
                    }
                  />
                  <div>
                    <label className="mb-2 ml-3 block text-sm font-bold text-navy-700 dark:text-white">
                      Jasa Pengiriman
                    </label>
                    <select
                      value={jasaVal}
                      onChange={(e) =>
                        setResiProduk(p.id, 'jasaPengiriman', e.target.value)
                      }
                      className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
                    >
                      {jasaOptions(jasaVal).map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Section 6 - Status */}
      <div className="flex flex-col gap-4 border-t border-gray-200 pt-5 dark:border-white/10">
        <SectionLabel>Status</SectionLabel>
        <div>
          <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
            Status Pesanan
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
      </div>
    </div>
  );
};

export default PenjualanForm;
