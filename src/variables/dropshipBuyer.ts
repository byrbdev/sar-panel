export type BuyerStatus = 'DIPAKAI' | 'KOSONG';

export type BuyerRow = {
  id: string;
  noHp: string;
  akunBuyer: string;
  akunAL: string;
  status: BuyerStatus;
  keterangan: string;
  tanggal: string;
};

const tableDataBuyer: BuyerRow[]= [];

export default tableDataBuyer;
