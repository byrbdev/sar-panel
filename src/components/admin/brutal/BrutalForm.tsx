'use client';
import InputField from 'components/fields/InputField';
import { useAppData } from 'context/AppDataContext';
import { BrutalIklan, BrutalItem, BrutalStatus } from 'variables/dropshipBrutal';

export type BrutalFormValue = Omit<BrutalItem, 'id' | 'anggotaId'>;

export const emptyBrutalForm = (): BrutalFormValue => ({
  namaToko: '',
  kategoriToko: '',
  produk: '',
  status: 'Muncul',
  iklan: 'Iklan',
  orderan: '',
  sku: '',
  jumlahTerjual: '',
  ulasanProduk: '',
  reviewProduk: '',
  ratingToko: '',
  pelanggaran: '',
  keterangan: '',
  tanggal: new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
});

const BrutalForm = (props: {
  value: BrutalFormValue;
  onChange: (value: BrutalFormValue) => void;
}) => {
  const { value, onChange } = props;
  const { toko } = useAppData();
  const daftarToko = toko.map((t) => t.namaToko);

  const handle =
    (field: keyof BrutalFormValue) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ ...value, [field]: e.target.value });
    };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
          Nama Toko
        </label>
        <select
          value={value.namaToko}
          onChange={(e) => onChange({ ...value, namaToko: e.target.value })}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="br_kategoriToko"
          label="Kategori Toko"
          placeholder="Fashion, Elektronik, dll"
          type="text"
          extra=""
          value={value.kategoriToko}
          onChange={handle('kategoriToko')}
        />
        <InputField
          id="br_produk"
          label="Produk"
          placeholder="Nama produk"
          type="text"
          extra=""
          value={value.produk}
          onChange={handle('produk')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
            Status
          </label>
          <select
            value={value.status}
            onChange={(e) =>
              onChange({ ...value, status: e.target.value as BrutalStatus })
            }
            className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
          >
            <option value="Muncul">Muncul</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
            Iklan
          </label>
          <select
            value={value.iklan}
            onChange={(e) =>
              onChange({ ...value, iklan: e.target.value as BrutalIklan })
            }
            className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
          >
            <option value="Iklan">Iklan</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="br_orderan"
          label="Orderan"
          placeholder="Jumlah orderan"
          type="text"
          extra=""
          value={value.orderan}
          onChange={handle('orderan')}
        />
        <InputField
          id="br_sku"
          label="SKU"
          placeholder="SKU-001"
          type="text"
          extra=""
          value={value.sku}
          onChange={handle('sku')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="br_jumlahTerjual"
          label="Jumlah Terjual"
          placeholder="0"
          type="text"
          extra=""
          value={value.jumlahTerjual}
          onChange={handle('jumlahTerjual')}
        />
        <InputField
          id="br_ulasanProduk"
          label="Ulasan Produk"
          placeholder="Jumlah ulasan"
          type="text"
          extra=""
          value={value.ulasanProduk}
          onChange={handle('ulasanProduk')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="br_reviewProduk"
          label="Review Produk"
          placeholder="4.8/5 (256 ulasan)"
          type="text"
          extra=""
          value={value.reviewProduk}
          onChange={handle('reviewProduk')}
        />
        <InputField
          id="br_ratingToko"
          label="Rating Toko"
          placeholder="4.9"
          type="text"
          extra=""
          value={value.ratingToko}
          onChange={handle('ratingToko')}
        />
      </div>

      <InputField
        id="br_pelanggaran"
        label="Pelanggaran"
        placeholder="Contoh: Kata kunci terlarang, atau '-' jika tidak ada"
        type="text"
        extra=""
        value={value.pelanggaran}
        onChange={handle('pelanggaran')}
      />

      <div>
        <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
          Keterangan
        </label>
        <textarea
          value={value.keterangan}
          onChange={handle('keterangan')}
          rows={3}
          placeholder="Catatan tambahan..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none focus:border-brand-400 dark:border-white/10 dark:text-white"
        />
      </div>
    </div>
  );
};

export default BrutalForm;
