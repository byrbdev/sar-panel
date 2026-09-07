'use client';
import InputField from 'components/fields/InputField';
import { useMember } from 'context/MemberContext';
import { RefundAlasan, RefundRow, RefundStatus } from 'variables/dropshipRefund';

export type RefundFormValue = Omit<RefundRow, 'id'>;

export const emptyRefundForm = (): RefundFormValue => ({
  nama: '',
  namaToko: '',
  emailToko: '',
  noHp: '',
  sku: '',
  noPesananAL: '-',
  noPesananSHP: '-',
  updateNoPesanan: '-',
  alasan: 'Refund',
  keterangan: '',
  status: 'Belum',
  tanggal: new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
});

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const RefundForm = (props: {
  value: RefundFormValue;
  onChange: (value: RefundFormValue) => void;
  /** true bila refund berasal dari transaksi yang sudah diproses di Penjualan */
  fromPenjualan?: boolean;
  /** true bila field No Pesanan AL/SHP/Update disembunyikan (refund langsung dari Pesanan Masuk) */
  hideOrderNumbers?: boolean;
}) => {
  const { value, onChange, fromPenjualan, hideOrderNumbers } = props;
  const { namaOptions } = useMember();

  const handle =
    (field: keyof RefundFormValue) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ ...value, [field]: e.target.value });
    };

  return (
    <div className="flex flex-col gap-5">
      {fromPenjualan && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Data dari Transaksi yang Sudah Diproses
          </p>
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Nama Produk
              </p>
              <p className="font-semibold text-navy-700 dark:text-white">
                {value.namaProduk}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Alamat
              </p>
              <p className="font-semibold text-navy-700 dark:text-white">
                {value.alamat}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Omzet</p>
              <p className="font-semibold text-navy-700 dark:text-white">
                {formatRupiah(value.omzet || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Profit
              </p>
              <p className="font-semibold text-navy-700 dark:text-white">
                {formatRupiah(value.profit || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
            Nama
          </label>
          <select
            value={value.nama}
            onChange={(e) => onChange({ ...value, nama: e.target.value })}
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
          id="r_namaToko"
          label="Nama Toko"
          placeholder="Nama toko"
          type="text"
          extra=""
          value={value.namaToko}
          onChange={handle('namaToko')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="r_emailToko"
          label="Email Toko"
          placeholder="email@contoh.com"
          type="email"
          extra=""
          value={value.emailToko}
          onChange={handle('emailToko')}
        />
        <InputField
          id="r_noHp"
          label="No HP"
          placeholder="081234567890"
          type="text"
          extra=""
          value={value.noHp}
          onChange={handle('noHp')}
        />
      </div>

      <InputField
        id="r_sku"
        label="SKU"
        placeholder="SKU-001"
        type="text"
        extra=""
        value={value.sku}
        onChange={handle('sku')}
      />

      {!hideOrderNumbers && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              id="r_noPesananAL"
              label="No Pesanan AL"
              placeholder="AL-20260101-001"
              type="text"
              extra=""
              value={value.noPesananAL}
              onChange={handle('noPesananAL')}
            />
            <InputField
              id="r_noPesananSHP"
              label="No Pesanan SHP"
              placeholder="SHP-88213741"
              type="text"
              extra=""
              value={value.noPesananSHP}
              onChange={handle('noPesananSHP')}
            />
          </div>

          <InputField
            id="r_updateNoPesanan"
            label="Update No Pesanan (opsional)"
            placeholder="Nomor pesanan baru setelah update"
            type="text"
            extra=""
            value={value.updateNoPesanan}
            onChange={handle('updateNoPesanan')}
          />
        </>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
            Alasan
          </label>
          <select
            value={value.alasan}
            onChange={(e) =>
              onChange({ ...value, alasan: e.target.value as RefundAlasan })
            }
            className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
          >
            <option value="Refund">Refund</option>
            <option value="Stok Kosong">Stok Kosong</option>
            <option value="Transaksi Ditutup">Transaksi Ditutup</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
            Status
          </label>
          <select
            value={value.status}
            onChange={(e) =>
              onChange({ ...value, status: e.target.value as RefundStatus })
            }
            className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
          >
            <option value="Belum">Belum</option>
            <option value="Proses">Proses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
          Keterangan
        </label>
        <textarea
          value={value.keterangan}
          onChange={handle('keterangan')}
          rows={3}
          placeholder="Catatan tambahan seputar refund ini..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none focus:border-brand-400 dark:border-white/10 dark:text-white"
        />
      </div>
    </div>
  );
};

export default RefundForm;
