'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from 'lib/supabaseClient';

/**
 * Menyinkronkan sebuah tabel Supabase dengan state array lokal, TANPA
 * mengubah cara halaman-halaman lain memanggil setState (masih
 * `setData([...])`, `setData(prev => ...)`, dll seperti biasa).
 *
 * Cara kerja:
 * - Saat mount: fetch semua baris dari Supabase, isi state lokal.
 * - Berlangganan Realtime: perubahan dari user/tab lain otomatis masuk.
 * - Saat setData dipanggil: dibandingkan (diff) dengan state sebelumnya
 *   untuk tahu baris mana yang baru/berubah/dihapus, lalu dikirim ke
 *   Supabase di background (insert/update/delete berdasarkan id).
 * - Karena tabel pakai `id bigint generated always as identity`, saat
 *   insert kita KIRIM TANPA kolom id, lalu tempel id asli dari Supabase
 *   ke baris lokal begitu responsnya datang (id sementara di-replace).
 *
 * Kalau Supabase belum dikonfigurasi, hook ini berperilaku persis seperti
 * useState biasa (fallback untuk pengembangan/demo lokal).
 */
export type SyncResult = { ok: boolean; errors: string[] };
/** Setter yang kompatibel dengan `React.Dispatch<SetStateAction<T[]>>` (jadi
 * semua pemanggilan lama `setData([...])` tetap valid tanpa diubah), TAPI
 * juga mengembalikan Promise<SyncResult> supaya pemanggil yang butuh
 * kepastian (mis. sebelum menampilkan toast "berhasil disimpan") bisa
 * `await` hasilnya. */
export type SyncedSetter<T> = (
  action: T[] | ((prev: T[]) => T[]),
) => Promise<SyncResult>;

export function useSyncedTable<T extends { id: string | number }>(
  table: string,
  initial: T[],
  toDb: (row: T) => Record<string, unknown>,
  fromDb: (row: Record<string, unknown>) => T,
  numericId = true,
) {
  const [data, setDataRaw] = useState<T[]>(initial);
  const dataRef = useRef<T[]>(initial);
  dataRef.current = data;

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    (async () => {
      const { data: rows, error } = await supabase
        .from(table)
        .select('*')
        .order('id', { ascending: false });
      if (!error && rows && active) {
        setDataRaw(rows.map(fromDb));
      }
    })();

    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          setDataRaw((prev) => {
            if (payload.eventType === 'INSERT') {
              const row = fromDb(payload.new as Record<string, unknown>);
              if (prev.some((p) => String(p.id) === String(row.id)))
                return prev;
              return [row, ...prev];
            }
            if (payload.eventType === 'UPDATE') {
              const row = fromDb(payload.new as Record<string, unknown>);
              return prev.map((p) =>
                String(p.id) === String(row.id) ? row : p,
              );
            }
            if (payload.eventType === 'DELETE') {
              const oldRow = fromDb(payload.old as Record<string, unknown>);
              return prev.filter((p) => String(p.id) !== String(oldRow.id));
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const setData = (action: T[] | ((prev: T[]) => T[])) => {
    const prev = dataRef.current;
    const next = typeof action === 'function' ? (action as any)(prev) : action;
    setDataRaw(next);
    // Update ref SEGERA (bukan menunggu render berikutnya) supaya kalau
    // setData dipanggil dua kali beruntun sebelum React sempat re-render,
    // panggilan kedua tetap diff dari state TERBARU, bukan yang basi (stale).
    // Tanpa ini, perubahan dari panggilan pertama bisa ketimpa/hilang.
    dataRef.current = next;

    if (!isSupabaseConfigured) return Promise.resolve({ ok: true, errors: [] as string[] });

    const nextIds = new Set(next.map((n) => String(n.id)));
    const pending: PromiseLike<string | null>[] = [];

    // Hapus baris yang tidak ada lagi
    prev.forEach((p) => {
      if (!nextIds.has(String(p.id))) {
        pending.push(
          supabase
            .from(table)
            .delete()
            .eq('id', p.id)
            .then(({ error }) => {
              if (error) {
                console.error(`[${table}] delete gagal:`, error);
                return `Gagal menghapus data (${error.message})`;
              }
              return null;
            }),
        );
      }
    });

    // Insert baru / update yang berubah
    next.forEach((n) => {
      const before = prev.find((p) => String(p.id) === String(n.id));

      if (!before) {
        const payload = toDb(n);
        if (numericId) delete (payload as any).id; // biarkan DB generate id
        pending.push(
          supabase
            .from(table)
            .insert(payload)
            .select()
            .single()
            .then(({ data: inserted, error }) => {
              if (error || !inserted) {
                console.error(`[${table}] insert gagal:`, error);
                return `Gagal menyimpan data baru (${error?.message || 'tidak diketahui'})`;
              }
              const realRow = fromDb(inserted);
              // ganti id sementara (client-side) dengan id asli dari DB
              setDataRaw((cur) =>
                cur.map((c) => (String(c.id) === String(n.id) ? realRow : c)),
              );
              dataRef.current = dataRef.current.map((c) =>
                String(c.id) === String(n.id) ? realRow : c,
              );
              return null;
            }),
        );
      } else {
        // Bandingkan bentuk payload DB-nya (bukan objek mentah), supaya
        // urutan key tidak memengaruhi hasil perbandingan.
        const beforePayload = toDb(before);
        const nextPayload = toDb(n);
        if (
          JSON.stringify(beforePayload) !== JSON.stringify(nextPayload)
        ) {
          // PENTING: kolom `id` adalah GENERATED ALWAYS AS IDENTITY —
          // Postgres akan MENOLAK update kalau kolom ini ikut dikirim.
          // Inilah penyebab semua perubahan edit tidak tersimpan.
          const updatePayload = { ...nextPayload };
          delete (updatePayload as any).id;

          pending.push(
            supabase
              .from(table)
              .update(updatePayload)
              .eq('id', n.id)
              .then(({ error }) => {
                if (error) {
                  console.error(`[${table}] update gagal:`, error);
                  return `Gagal menyimpan perubahan (${error.message})`;
                }
                return null;
              }),
          );
        }
      }
    });

    // Dikembalikan supaya pemanggil BISA `await` dan baru menampilkan toast
    // "berhasil disimpan" setelah benar-benar tersimpan di Supabase — bukan
    // langsung optimis sebelum tahu hasilnya (penyebab "edit kadang tidak
    // tersimpan tapi tetap muncul notifikasi sukses").
    return Promise.all(pending).then((results) => {
      const errors = results.filter((r): r is string => !!r);
      return { ok: errors.length === 0, errors };
    });
  };

  return [data, setData as unknown as SyncedSetter<T>] as const;
}
