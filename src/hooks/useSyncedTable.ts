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

    if (!isSupabaseConfigured) return;

    const nextIds = new Set(next.map((n) => String(n.id)));

    // Hapus baris yang tidak ada lagi
    prev.forEach((p) => {
      if (!nextIds.has(String(p.id))) {
        supabase.from(table).delete().eq('id', p.id).then();
      }
    });

    // Insert baru / update yang berubah
    next.forEach((n) => {
      const before = prev.find((p) => String(p.id) === String(n.id));
      const looksTemporaryId =
        numericId && typeof n.id === 'string' && !/^\d+$/.test(n.id);

      if (!before) {
        const payload = toDb(n);
        if (numericId) delete (payload as any).id; // biarkan DB generate id
        supabase
          .from(table)
          .insert(payload)
          .select()
          .single()
          .then(({ data: inserted, error }) => {
            if (error || !inserted) return;
            const realRow = fromDb(inserted);
            // ganti id sementara (client-side) dengan id asli dari DB
            setDataRaw((cur) =>
              cur.map((c) => (String(c.id) === String(n.id) ? realRow : c)),
            );
          });
      } else if (JSON.stringify(before) !== JSON.stringify(n)) {
        supabase.from(table).update(toDb(n)).eq('id', n.id).then();
      }
    });
  };

  return [data, setData as React.Dispatch<React.SetStateAction<T[]>>] as const;
}
