'use client';
import { MdAdd, MdClose, MdInventory2 } from 'react-icons/md';
import InputField from 'components/fields/InputField';
import JumlahInput from 'components/fields/JumlahInput';
import { ProdukItem } from 'variables/dropshipPenjualan';

let counter = 0;
export const newProdukItemId = () => `pi_${Date.now()}_${counter++}`;

/**
 * Daftar produk TAMBAHAN dalam satu invoice/No Pesanan AL yang sama.
 * Dipakai di bawah field Produk/Varian/SKU/No Pesanan AL utama: satu
 * pembeli/satu checkout bisa punya beberapa produk berbeda dalam satu
 * transaksi, jadi tombol "Tambah Produk" menambah satu set field
 * Produk + Varian Produk + SKU baru. Finansial (harga/modal) TIDAK ikut
 * dipecah di sini -- tetap satu nilai untuk seluruh invoice.
 */
const ProdukTambahan = (props: {
  produkList: ProdukItem[];
  onChange: (list: ProdukItem[]) => void;
}) => {
  const { produkList, onChange } = props;

  const addItem = () => {
    onChange([
      ...produkList,
      {
        id: newProdukItemId(),
        namaProduk: '',
        varian: '',
        skuProduk: '',
        jumlah: 1,
      },
    ]);
  };

  const updateItem = (
    id: string,
    field: keyof ProdukItem,
    val: string | number,
  ) => {
    onChange(
      produkList.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    );
  };

  const removeItem = (id: string) => {
    onChange(produkList.filter((p) => p.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      {produkList.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          <MdInventory2 className="h-3.5 w-3.5" />
          Produk Lain di Pesanan Ini
        </p>
      )}
      {produkList.map((item, idx) => (
        <div
          key={item.id}
          className="rounded-xl border border-dashed border-gray-300 p-4 dark:border-white/15"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Produk #{idx + 2}
            </p>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              title="Hapus produk ini"
              className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            >
              <MdClose className="h-4 w-4" />
            </button>
          </div>
          <InputField
            id={`pt_produk_${item.id}`}
            label="Produk"
            placeholder="Nama produk"
            type="text"
            extra=""
            value={item.namaProduk}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateItem(item.id, 'namaProduk', e.target.value)
            }
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              id={`pt_varian_${item.id}`}
              label="Varian Produk"
              placeholder="Contoh: Hitam, size L"
              type="text"
              extra=""
              value={item.varian}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateItem(item.id, 'varian', e.target.value)
              }
            />
            <InputField
              id={`pt_sku_${item.id}`}
              label="SKU"
              placeholder="SKU-001"
              type="text"
              extra=""
              value={item.skuProduk}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateItem(item.id, 'skuProduk', e.target.value)
              }
            />
          </div>
          <div className="mt-4">
            <JumlahInput
              id={`pt_jumlah_${item.id}`}
              value={item.jumlah}
              onChange={(n) => updateItem(item.id, 'jumlah', n)}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-brand-400 py-2.5 text-sm font-semibold text-brand-500 transition hover:bg-brand-50 dark:border-brand-300/50 dark:text-brand-300 dark:hover:bg-brand-400/10"
      >
        <MdAdd className="h-4 w-4" />
        Tambah Produk
      </button>
    </div>
  );
};

export default ProdukTambahan;
