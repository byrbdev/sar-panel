'use client';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { supabase } from 'lib/supabaseClient';
import { useAuth } from 'context/AuthContext';
import {
  CHAT_MAX_PANJANG,
  CHAT_RETENSI_HARI,
  ChatContact,
  ChatMessage,
  ChatRole,
} from 'variables/chat';
import {
  KontakRingkas,
  buatRingkasanKontak,
  gabungPesan,
  totalBelumDibaca,
  urutkanPesan,
} from 'utils/chatHelpers';

type KirimHasil = { ok: true } | { ok: false; error: string };

type ChatContextType = {
  me: string;
  /** false = tabel chat belum ada di database (SQL belum dijalankan) -> widget disembunyikan. */
  tersedia: boolean;
  loading: boolean;
  error: string | null;
  messages: ChatMessage[];
  kontak: KontakRingkas[];
  totalBelum: number;
  /** id pengguna yang sedang online (login + tab website sedang terlihat). */
  online: Set<string>;
  kirim: (lawanId: string, isi: string, balasId?: number) => Promise<KirimHasil>;
  tandaiDibaca: (lawanId: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextType | null>(null);

// Batas jumlah pesan yang dimuat sekali jalan (30 hari terakhir saja).
const BATAS_MUAT = 2000;

const fromDb = (r: any): ChatMessage => ({
  id: Number(r.id),
  senderId: String(r.sender_id),
  receiverId: String(r.receiver_id),
  body: String(r.body ?? ''),
  replyTo: r.reply_to != null ? Number(r.reply_to) : undefined,
  createdAt: String(r.created_at),
  readAt: r.read_at ? String(r.read_at) : undefined,
});

/** Error "tabel/fungsi belum ada" dari PostgREST / Postgres. */
const isBelumAda = (err: any): boolean => {
  const code = String(err?.code || '');
  return (
    code === '42P01' || // undefined_table
    code === '42883' || // undefined_function
    code === 'PGRST205' || // tabel tidak ada di schema cache
    code === 'PGRST202' // fungsi tidak ada di schema cache
  );
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAuth();
  const me = profile?.id || '';

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [tersedia, setTersedia] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState<Set<string>>(new Set());
  const meRef = useRef(me);
  meRef.current = me;

  const muat = useCallback(async () => {
    if (!meRef.current) return;
    const since = new Date(
      Date.now() - CHAT_RETENSI_HARI * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [kontakRes, pesanRes] = await Promise.all([
      supabase.rpc('chat_contacts'),
      supabase
        .from('chat_messages')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(BATAS_MUAT),
    ]);

    if (isBelumAda(kontakRes.error) || isBelumAda(pesanRes.error)) {
      setTersedia(false);
      setLoading(false);
      return;
    }
    if (kontakRes.error || pesanRes.error) {
      setError(
        kontakRes.error?.message || pesanRes.error?.message || 'Gagal memuat chat.',
      );
      setLoading(false);
      return;
    }

    setError(null);
    setContacts(
      (kontakRes.data || []).map((r: any) => ({
        id: String(r.id),
        nama: String(r.nama || '-'),
        role: (r.role || 'member') as ChatRole,
      })),
    );
    setMessages(urutkanPesan((pesanRes.data || []).map(fromDb)));
    setLoading(false);
  }, []);

  // Muat awal + realtime + sinkron ulang saat tab aktif lagi / koneksi pulih
  // (supaya pesan yang masuk saat offline langsung muncul).
  useEffect(() => {
    if (!me) return;
    let berlangganan = false;
    muat();

    const terima = (payload: any) => {
      const row = payload?.new;
      if (!row) return;
      const m = fromDb(row);
      // RLS sudah membatasi, ini lapis pengaman tambahan.
      if (m.senderId !== meRef.current && m.receiverId !== meRef.current) return;
      setMessages((prev) => gabungPesan(prev, m));
    };

    const channel = supabase
      .channel(`chat:${me}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        terima,
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        terima,
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Koneksi ulang (bukan yang pertama) -> ambil pesan yang terlewat.
          if (berlangganan) muat();
          berlangganan = true;
        }
      });

    const onVisible = () => {
      if (document.visibilityState === 'visible') muat();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', muat);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', muat);
      supabase.removeChannel(channel);
    };
  }, [me, muat]);

  // Status online (Supabase Realtime Presence). Seorang pengguna dianggap
  // ONLINE selama minimal satu tab websitenya sedang terlihat (visible) dan
  // tersambung. Tab disembunyikan / pindah tab / ditutup / logout / koneksi
  // putus -> presence dilepas -> OFFLINE. Banyak tab = online selama ada
  // satu yang aktif (tiap tab punya koneksi sendiri dengan key yang sama).
  useEffect(() => {
    if (!me) return;
    const channel = supabase.channel('presence:sar-panel', {
      config: { presence: { key: me } },
    });
    let terpasang = false;

    const sinkron = () => {
      const state = channel.presenceState();
      setOnline(new Set(Object.keys(state)));
    };
    const pasang = async () => {
      if (terpasang) return;
      terpasang = true;
      await channel.track({ at: new Date().toISOString() });
    };
    const lepas = async () => {
      if (!terpasang) return;
      terpasang = false;
      await channel.untrack();
    };
    const sesuaikan = () => {
      if (document.visibilityState === 'visible') pasang();
      else lepas();
    };

    channel
      .on('presence', { event: 'sync' }, sinkron)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          terpasang = false; // koneksi (ulang) -> pasang lagi bila tab terlihat
          sesuaikan();
        }
      });

    document.addEventListener('visibilitychange', sesuaikan);
    window.addEventListener('pagehide', lepas);

    return () => {
      document.removeEventListener('visibilitychange', sesuaikan);
      window.removeEventListener('pagehide', lepas);
      supabase.removeChannel(channel);
      setOnline(new Set());
    };
  }, [me]);

  const kirim = useCallback(
    async (lawanId: string, isi: string, balasId?: number): Promise<KirimHasil> => {
      const teks = isi.trim();
      if (!meRef.current) return { ok: false, error: 'Belum login.' };
      if (!teks) return { ok: false, error: 'Pesan kosong.' };
      if (teks.length > CHAT_MAX_PANJANG)
        return { ok: false, error: `Maksimal ${CHAT_MAX_PANJANG} karakter.` };

      const { data, error: err } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: meRef.current,
          receiver_id: lawanId,
          body: teks,
          reply_to: balasId ?? null,
        })
        .select()
        .single();
      if (err || !data) return { ok: false, error: err?.message || 'Gagal mengirim.' };
      setMessages((prev) => gabungPesan(prev, fromDb(data)));
      return { ok: true };
    },
    [],
  );

  const tandaiDibaca = useCallback(async (lawanId: string) => {
    const saya = meRef.current;
    if (!saya) return;
    const sekarang = new Date().toISOString();
    let adaBaru = false;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.senderId === lawanId && m.receiverId === saya && !m.readAt) {
          adaBaru = true;
          return { ...m, readAt: sekarang };
        }
        return m;
      }),
    );
    if (!adaBaru) return;
    await supabase
      .from('chat_messages')
      .update({ read_at: sekarang })
      .eq('receiver_id', saya)
      .eq('sender_id', lawanId)
      .is('read_at', null);
  }, []);

  const kontak = useMemo(
    () => buatRingkasanKontak(contacts, messages, me),
    [contacts, messages, me],
  );
  const totalBelum = useMemo(() => totalBelumDibaca(messages, me), [messages, me]);

  return (
    <ChatContext.Provider
      value={{
        me,
        tersedia,
        loading,
        error,
        messages,
        kontak,
        totalBelum,
        online,
        kirim,
        tandaiDibaca,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
