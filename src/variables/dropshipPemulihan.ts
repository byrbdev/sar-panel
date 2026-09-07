export type PemulihanRow = {
  id: number;
  ownerId?: string; // id Member pemilik toko (dari database Member)
  nama: string;
  email: string;
  metode: string;
  namaToko: string;
  denda: number;
  pelanggaran: string;
  saldoIklan: number;
};

const tableDataPemulihan: PemulihanRow[] = [];

export default tableDataPemulihan;

export const getTokoEmail = (namaToko: string): string => {
  const found = tableDataPemulihan.find((t) => t.namaToko === namaToko);
  return found?.email || '';
};
