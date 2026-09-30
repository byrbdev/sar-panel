'use client';
import React from 'react';
import ModalOverlay from 'components/modal/ModalOverlay';
import InputField from 'components/fields/InputField';
import {
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdStorefront,
  MdTag,
  MdInventory2,
} from 'react-icons/md';
import {
  JASA_PENGIRIMAN,
  jasaOptions,
  Penjualan,
  jumlahLabel,
} from 'variables/dropshipPenjualan';
import { useAppData } from 'context/AppDataContext';
import { useUI } from 'context/UIContext';
import { useMemberName } from 'hooks/useMemberName';

export const SectionLabel = (props: { children: React.ReactNode }) => (
  <p className="mb-3 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
    {props.children}
  </p>
);

export const InfoRow = (props: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => {
  if (!props.value) return null;
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-lightPrimary text-gray-600 dark:bg-navy-700 dark:text-gray-300">
        {props.icon}
      </div>
      <div className="min-w-0">
        <p className="mb-0.5 text-xs leading-none text-gray-500 dark:text-gray-400">
          {props.label}
        </p>
        <p className="break-words text-base leading-snug text-navy-700 dark:text-white">
          {props.value}
        </p>
      </div>
    </div>
  );
};

/**
 * Overlay "Masukkan Resi" -- dipakai di halaman Resi (Admin/Super Admin)
 * DAN saat notifikasi "Follow Up Resi" diklik, jadi tampilannya selalu sama.
 * Isinya: info pembeli, daftar produk di pesanan, lalu (paling bawah)
 * field Nomor Resi + Jasa Pengiriman.
 */
const ResiInputModal = (props: {
  penjualan: Penjualan | null;
  onClose: () => void;
}) => {
  const { penjualan, onClose } = props;
  const { setPenjualan } = useAppData();
  const { notify } = useUI();
  const { resolve: resolveMember } = useMemberName();

  const [noResi, setNoResi] = React.useState('');
  const [jasa, setJasa] = React.useState<string>(JASA_PENGIRIMAN[0]);
  const [saving, setSaving] = React.useState(false);
  const [mode, setMode] = React.useState<'sama' | 'beda'>('sama');
  // resi per produk (key = 'utama' atau id produk tambahan)
  const [resiMap, setResiMap] = React.useState<Record<string, string>>({});
  // jasa pengiriman per produk (mode Resi Berbeda)
  const [jasaMap, setJasaMap] = React.useState<Record<string, string>>({});

  // Reset field setiap kali overlay dibuka untuk penjualan yang berbeda
  React.useEffect(() => {
    if (penjualan) {
      setNoResi('');
      setJasa(penjualan.jasaPengiriman || JASA_PENGIRIMAN[0]);
      setSaving(false);
      setMode('sama');
      setResiMap({});
      setJasaMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penjualan?.id]);

  if (!penjualan) return null;

  const semuaProduk = [
    {
      id: 'utama',
      namaProduk: penjualan.namaProduk,
      varian: penjualan.varian,
      skuProduk: penjualan.skuProduk,
      jumlah: penjualan.jumlah,
    },
    ...(penjualan.produkList || []),
  ];

  const multi = semuaProduk.length > 1;
  const beda = multi && mode === 'beda';

  const handleSave = async () => {
    let updates: Partial<Penjualan>;
    if (beda) {
      const kosong = semuaProduk.filter((p) => !(resiMap[p.id] || '').trim());
      if (kosong.length) {
        notify(
          `Resi wajib diisi untuk semua produk (${kosong.length} belum diisi).`,
          'error',
        );
        return;
      }
      updates = {
        noResi: resiMap['utama'].trim(),
        jasaPengiriman: jasaMap['utama'] || JASA_PENGIRIMAN[0],
        produkList: (penjualan.produkList || []).map((x) => ({
          ...x,
          noResi: resiMap[x.id].trim(),
          jasaPengiriman: jasaMap[x.id] || JASA_PENGIRIMAN[0],
        })),
      };
    } else {
      const resi = noResi.trim();
      if (!resi) {
        notify('Nomor resi wajib diisi.', 'error');
        return;
      }
      updates = {
        noResi: resi,
        jasaPengiriman: jasa,
        // Resi Sama: bersihkan resi per produk supaya tidak dianggap "beda"
        produkList: (penjualan.produkList || []).map((x) => ({
          ...x,
          noResi: '',
          jasaPengiriman: '',
        })),
      };
    }
    setSaving(true);
    const result = await setPenjualan((prev) =>
      prev.map((row) => (row.id === penjualan.id ? { ...row, ...updates } : row)),
    );
    setSaving(false);
    if (!result.ok) {
      notify(`Resi gagal disimpan: ${result.errors[0]}`, 'error');
      return; // overlay tetap terbuka supaya bisa dicoba lagi
    }
    notify(
      `Resi untuk pesanan ${penjualan.noPesananAL || '-'} berhasil disimpan.`,
      'success',
    );
    onClose();
  };

  return (
    <ModalOverlay open={!!penjualan} onClose={onClose} title="Masukkan Resi">
      <div className="space-y-3.5">
        {/* Info Pembeli */}
        <SectionLabel>Info Pembeli</SectionLabel>
        <InfoRow
          icon={<MdPerson className="h-3.5 w-3.5" />}
          label="Nama Pembeli"
          value={penjualan.namaPembeli}
        />
        <InfoRow
          icon={<MdPhone className="h-3.5 w-3.5" />}
          label="Nomor HP"
          value={penjualan.noHp}
        />
        <InfoRow
          icon={<MdLocationOn className="h-3.5 w-3.5" />}
          label="Alamat Pengiriman"
          value={penjualan.alamatPembeli}
        />

        {/* Info Pesanan */}
        <div className="space-y-3.5 border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Info Pesanan</SectionLabel>
          <InfoRow
            icon={<MdPerson className="h-3.5 w-3.5" />}
            label="Member"
            value={resolveMember(penjualan.ownerId, penjualan.namaToko)}
          />
          <InfoRow
            icon={<MdStorefront className="h-3.5 w-3.5" />}
            label="Toko"
            value={penjualan.namaToko}
          />
          <InfoRow
            icon={<MdTag className="h-3.5 w-3.5" />}
            label="No Pesanan"
            value={penjualan.noPesananAL || '-'}
          />
        </div>

        {/* Produk di pesanan */}
        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Produk di Pesanan Ini ({semuaProduk.length})</SectionLabel>
          <div className="space-y-2">
            {semuaProduk.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-start gap-3 rounded-xl bg-lightPrimary p-3 dark:bg-navy-700"
              >
                <MdInventory2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500 dark:text-white" />
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-navy-700 dark:text-white">
                    {semuaProduk.length > 1 ? `${idx + 1}. ` : ''}
                    {p.namaProduk || '(tanpa nama)'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {[
                      p.varian,
                      p.skuProduk && `SKU: ${p.skuProduk}`,
                      `Jumlah: ${jumlahLabel(p)}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resi + jasa pengiriman (paling bawah) */}
        <div className="border-t border-gray-200 pt-3.5 dark:border-white/10">
          <SectionLabel>Pengiriman</SectionLabel>

          {multi && (
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-lightPrimary p-1 dark:bg-navy-700">
              {([
                ['sama', 'Resi Sama'],
                ['beda', 'Resi Berbeda'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition duration-150 ${
                    mode === key
                      ? 'bg-white text-brand-500 shadow-sm dark:bg-navy-800 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!beda && (
              <InputField
                id="resiNoResi"
                label="Nomor Resi"
                placeholder="Nomor resi pengiriman"
                type="text"
                extra=""
                value={noResi}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNoResi(e.target.value)
                }
              />
            )}
            {!beda && (
            <div>
              <label className="mb-2 ml-3 block text-sm font-bold text-navy-700 dark:text-white">
                Jasa Pengiriman
              </label>
              <select
                value={jasa}
                onChange={(e) => setJasa(e.target.value)}
                className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
              >
                {jasaOptions(jasa).map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
            )}
          </div>

          {beda && (
            <div className="space-y-3">
              {semuaProduk.map((p, idx) => (
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
                      value={resiMap[p.id] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setResiMap((m) => ({ ...m, [p.id]: e.target.value }))
                      }
                    />
                    <div>
                      <label className="mb-2 ml-3 block text-sm font-bold text-navy-700 dark:text-white">
                        Jasa Pengiriman
                      </label>
                      <select
                        value={jasaMap[p.id] || JASA_PENGIRIMAN[0]}
                        onChange={(e) =>
                          setJasaMap((m) => ({ ...m, [p.id]: e.target.value }))
                        }
                        className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
                      >
                        {jasaOptions(jasaMap[p.id]).map((j) => (
                          <option key={j} value={j}>
                            {j}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="linear rounded-lg bg-lightPrimary px-6 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="linear rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          {saving ? 'Menyimpan...' : 'Simpan Resi'}
        </button>
      </div>
    </ModalOverlay>
  );
};

export default ResiInputModal;
