export type MemberRow = {
  id: string;
  nama: string;
};

export const slugifyNama = (nama: string) =>
  nama
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

const tableDataMember: MemberRow[]= [];

export default tableDataMember;
