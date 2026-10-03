import { ChatContact, ChatMessage } from 'variables/chat';
import { hariIndexFromIso, hariIndexWib } from 'utils/bulanJakarta';

export type KontakRingkas = ChatContact & {
  terakhir?: ChatMessage;
  belumDibaca: number;
};

const waktu = (iso: string) => Date.parse(iso) || 0;

/** Urutan kronologis stabil: waktu, lalu id. */
export const urutkanPesan = (list: ChatMessage[]): ChatMessage[] =>
  [...list].sort((a, b) => waktu(a.createdAt) - waktu(b.createdAt) || a.id - b.id);

/** Masukkan / perbarui satu pesan (dedupe berdasarkan id). */
export const gabungPesan = (
  list: ChatMessage[],
  baru: ChatMessage,
): ChatMessage[] => {
  const idx = list.findIndex((m) => m.id === baru.id);
  if (idx === -1) return urutkanPesan([...list, baru]);
  const next = [...list];
  next[idx] = baru;
  return next;
};

/** Pesan dalam percakapan antara `me` dan `lawan`. */
export const pesanPercakapan = (
  list: ChatMessage[],
  me: string,
  lawan: string,
): ChatMessage[] =>
  list.filter(
    (m) =>
      (m.senderId === me && m.receiverId === lawan) ||
      (m.senderId === lawan && m.receiverId === me),
  );

export const totalBelumDibaca = (list: ChatMessage[], me: string): number =>
  list.filter((m) => m.receiverId === me && !m.readAt).length;

/** Daftar kontak + pesan terakhir + jumlah belum dibaca. Yang punya
 * percakapan di atas (terbaru dulu), sisanya urut abjad. */
export const buatRingkasanKontak = (
  contacts: ChatContact[],
  list: ChatMessage[],
  me: string,
): KontakRingkas[] => {
  const terakhir = new Map<string, ChatMessage>();
  const belum = new Map<string, number>();
  list.forEach((m) => {
    const lawan = m.senderId === me ? m.receiverId : m.senderId;
    const prev = terakhir.get(lawan);
    if (
      !prev ||
      waktu(m.createdAt) > waktu(prev.createdAt) ||
      (waktu(m.createdAt) === waktu(prev.createdAt) && m.id > prev.id)
    ) {
      terakhir.set(lawan, m);
    }
    if (m.receiverId === me && !m.readAt) {
      belum.set(lawan, (belum.get(lawan) || 0) + 1);
    }
  });

  return contacts
    .map((c) => ({
      ...c,
      terakhir: terakhir.get(c.id),
      belumDibaca: belum.get(c.id) || 0,
    }))
    .sort((a, b) => {
      const ta = a.terakhir ? waktu(a.terakhir.createdAt) : 0;
      const tb = b.terakhir ? waktu(b.terakhir.createdAt) : 0;
      if (ta && tb) return tb - ta;
      if (ta) return -1;
      if (tb) return 1;
      return a.nama.localeCompare(b.nama, 'id');
    });
};

/** Jam pesan gaya WhatsApp Indonesia, WIB: "14.05". */
export const jamWib = (iso: string): string =>
  new Date(iso).toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

/** Pemisah tanggal di dalam percakapan (WIB), seperti WhatsApp:
 * "Hari ini" / "Kemarin" / "2 Oktober 2026". */
export const labelHari = (
  iso: string,
  hariIni: number = hariIndexWib(),
): string => {
  const h = hariIndexFromIso(iso);
  if (h === null) return '';
  if (h === hariIni) return 'Hari ini';
  if (h === hariIni - 1) return 'Kemarin';
  return new Date(iso).toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/** Waktu di daftar chat, seperti WhatsApp: jam kalau hari ini, "Kemarin",
 * selain itu tanggal "02/10/2026". */
export const waktuSingkat = (
  iso: string,
  hariIni: number = hariIndexWib(),
): string => {
  const h = hariIndexFromIso(iso);
  if (h === null) return '';
  if (h === hariIni) return jamWib(iso);
  if (h === hariIni - 1) return 'Kemarin';
  return new Date(iso).toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/** Satu baris pratinjau pesan untuk daftar chat (baris baru jadi spasi). */
export const pratinjau = (body: string): string => body.replace(/\s+/g, ' ').trim();
