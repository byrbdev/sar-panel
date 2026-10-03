export type ChatRole = 'super_admin' | 'admin' | 'member';

export type ChatContact = {
  id: string;
  nama: string;
  role: ChatRole;
};

export type ChatMessage = {
  id: number;
  senderId: string;
  receiverId: string;
  body: string;
  /** id pesan yang dibalas (kalau ini sebuah reply). */
  replyTo?: number;
  /** Waktu server (ISO). */
  createdAt: string;
  /** Waktu penerima membaca; kosong = belum dibaca. */
  readAt?: string;
};

/** Batas panjang pesan (sama dengan constraint di database). */
export const CHAT_MAX_PANJANG = 2000;
/** Pesan lebih lama dari ini otomatis dihapus database. */
export const CHAT_RETENSI_HARI = 30;

export const LABEL_ROLE: Record<ChatRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  member: 'Member',
};
