'use client';
import React from 'react';
import {
  MdArrowBack,
  MdChat,
  MdClose,
  MdDone,
  MdDoneAll,
  MdKeyboardArrowDown,
  MdPerson,
  MdReply,
  MdSearch,
  MdSend,
} from 'react-icons/md';
import { useChat } from 'context/ChatContext';
import { useHariBerjalan } from 'hooks/useHariBerjalan';
import {
  CHAT_MAX_PANJANG,
  CHAT_RETENSI_HARI,
  ChatMessage,
  LABEL_ROLE,
} from 'variables/chat';
import {
  jamWib,
  labelHari,
  pesanPercakapan,
  pratinjau,
  waktuSingkat,
} from 'utils/chatHelpers';

/* Tata letak panel meniru Chat Shopee versi web: satu panel di kanan bawah,
 * header putih "Chat (n)", kolom kiri = pencarian + filter + daftar chat,
 * kolom kanan = sambutan (belum ada yang dipilih) atau percakapan. Di layar
 * kecil (< md) otomatis jadi satu kolom. Isi percakapan tetap bergaya
 * WhatsApp (gelembung dengan jam & centang, pemisah tanggal), tetapi WARNANYA memakai tema panel ini: brand
 * (ungu) untuk aksen & pesan kita, navy untuk mode gelap, lightPrimary untuk
 * latar. Catatan: palet Tailwind proyek ini menimpa bawaan dan TIDAK punya
 * `transparent`/`black`, jadi bagian itu ditulis dengan nilai arbitrer. */

const Avatar = ({ kecil = false }: { kecil?: boolean }) => (
  <div
    className={`flex flex-none items-center justify-center rounded-full bg-lightPrimary text-brand-500 dark:bg-navy-700 dark:text-white ${
      kecil ? 'h-9 w-9' : 'h-10 w-10'
    }`}
  >
    <MdPerson className={kecil ? 'h-6 w-6' : 'h-7 w-7'} />
  </div>
);

/** Centang status. `gelembung` = di dalam gelembung ungu pesan kita;
 * `daftar` = di pratinjau daftar chat (latar terang/gelap biasa). */
const Centang = ({
  dibaca,
  varian = 'daftar',
  kelas = '',
}: {
  dibaca: boolean;
  varian?: 'gelembung' | 'daftar';
  kelas?: string;
}) => {
  const warna =
    varian === 'gelembung'
      ? dibaca
        ? 'text-cyan-300'
        : 'text-white/70'
      : dibaca
        ? 'text-brand-500 dark:text-brand-300'
        : 'text-gray-700 dark:text-gray-400';
  return dibaca ? (
    <MdDoneAll className={`h-4 w-4 ${warna} ${kelas}`} />
  ) : (
    <MdDone className={`h-4 w-4 ${warna} ${kelas}`} />
  );
};

const ChatWidget = () => {
  const {
    me,
    tersedia,
    loading,
    error,
    messages,
    kontak,
    totalBelum,
    kirim,
    tandaiDibaca,
  } = useChat();
  const hariIni = useHariBerjalan();

  const [open, setOpen] = React.useState(false);
  const [lawanId, setLawanId] = React.useState<string | null>(null);
  const [cari, setCari] = React.useState('');
  const [filter, setFilter] = React.useState<'semua' | 'belum'>('semua');
  const [draft, setDraft] = React.useState('');
  const [balas, setBalas] = React.useState<ChatMessage | null>(null);
  const [mengirim, setMengirim] = React.useState(false);
  const [galat, setGalat] = React.useState<string | null>(null);
  const [sorot, setSorot] = React.useState<number | null>(null);
  // Penanda "N PESAN BELUM DIBACA" (dicatat saat percakapan dibuka).
  const [batasBaru, setBatasBaru] = React.useState<{ id: number; jumlah: number } | null>(
    null,
  );

  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const dekatBawahRef = React.useRef(true);

  const lawan = kontak.find((k) => k.id === lawanId) || null;
  const percakapan = React.useMemo(
    () => (lawanId ? pesanPercakapan(messages, me, lawanId) : []),
    [messages, me, lawanId],
  );
  // Pesan yang dibalas dicari HANYA di percakapan yang sedang dibuka.
  const byId = React.useMemo(() => {
    const map = new Map<number, ChatMessage>();
    percakapan.forEach((m) => map.set(m.id, m));
    return map;
  }, [percakapan]);

  const kontakTampil = React.useMemo(() => {
    const term = cari.trim().toLowerCase();
    return kontak.filter(
      (k) =>
        (!term || k.nama.toLowerCase().includes(term)) &&
        (filter === 'semua' || k.belumDibaca > 0),
    );
  }, [kontak, cari, filter]);

  // Tandai dibaca selama percakapan terbuka dan ada pesan masuk baru.
  const belumDibacaLawan = lawanId
    ? percakapan.filter((m) => m.receiverId === me && !m.readAt).length
    : 0;
  React.useEffect(() => {
    if (open && lawanId && belumDibacaLawan > 0) tandaiDibaca(lawanId);
  }, [open, lawanId, belumDibacaLawan, tandaiDibaca]);

  // Saat percakapan dibuka: loncat ke penanda belum dibaca, atau ke bawah.
  React.useEffect(() => {
    dekatBawahRef.current = true;
    if (!lawanId) return;
    const el = listRef.current;
    if (!el) return;
    const penanda = document.getElementById('chat-penanda-baru');
    if (penanda) {
      el.scrollTop = Math.max(0, penanda.offsetTop - 12);
      dekatBawahRef.current = false;
    } else {
      el.scrollTop = el.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lawanId, open]);

  // Pesan baru: ikut turun hanya kalau pengguna memang sedang di bawah.
  React.useEffect(() => {
    const el = listRef.current;
    if (!el || !lawanId) return;
    if (dekatBawahRef.current) el.scrollTop = el.scrollHeight;
  }, [percakapan.length, lawanId]);

  // Tinggi kotak ketik menyesuaikan isi (maks ±5 baris).
  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [draft, lawanId]);

  if (!tersedia || !me) return null;

  const bukaPercakapan = (id: string) => {
    const belum = pesanPercakapan(messages, me, id).filter(
      (m) => m.receiverId === me && !m.readAt,
    );
    setBatasBaru(belum.length ? { id: belum[0].id, jumlah: belum.length } : null);
    setLawanId(id);
    setBalas(null);
    setDraft('');
    setGalat(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const kembali = () => {
    setLawanId(null);
    setBatasBaru(null);
    setBalas(null);
    setGalat(null);
  };

  const handleKirim = async () => {
    if (!lawanId || mengirim) return;
    const teks = draft.trim();
    if (!teks) return;
    setMengirim(true);
    setGalat(null);
    const hasil = await kirim(lawanId, teks, balas?.id);
    setMengirim(false);
    if ('error' in hasil) {
      setGalat(hasil.error);
      return;
    }
    setDraft('');
    setBalas(null);
    dekatBawahRef.current = true;
    inputRef.current?.focus();
  };

  const lompatKePesan = (id: number) => {
    const el = document.getElementById(`chat-msg-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setSorot(id);
    setTimeout(() => setSorot(null), 1400);
  };

  const namaPengirim = (m: ChatMessage) =>
    m.senderId === me ? 'Anda' : lawan?.nama || '';

  return (
    <>
      {/* Tombol chat kanan bawah + badge belum dibaca. Disembunyikan saat
          panel terbuka (tidak ada tombol X; menutup lewat tombol kecilkan
          di header panel). */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Buka chat"
          className="linear fixed bottom-5 right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdChat className="h-6 w-6" />
          {totalBelum > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white dark:border-navy-900">
              {totalBelum > 99 ? '99+' : totalBelum}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed bottom-0 right-3 z-[60] flex h-[min(430px,calc(100dvh-2rem))] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-t-lg border border-b-0 border-gray-200 bg-white shadow-3xl shadow-shadow-500 dark:border-white/10 dark:bg-navy-800 dark:shadow-none sm:right-5 md:w-[520px]">
          {/* Header putih ala Shopee: "Chat (n)" + tombol kecilkan.
              Di layar kecil disembunyikan saat percakapan terbuka
              (percakapan punya header sendiri). */}
          <div
            className={`${
              lawan ? 'hidden md:flex' : 'flex'
            } flex-none items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-white/10`}
          >
            <p className="text-lg font-bold text-brand-500 dark:text-brand-300">
              Chat
              {totalBelum > 0 && (
                <span className="ml-1.5 text-xs font-medium text-red-500">
                  ({totalBelum})
                </span>
              )}
            </p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Kecilkan chat"
              title="Kecilkan"
              className="rounded p-0.5 text-gray-700 hover:bg-lightPrimary dark:text-gray-400 dark:hover:bg-navy-700"
            >
              <MdKeyboardArrowDown className="h-6 w-6" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* ===================== KOLOM KIRI: DAFTAR CHAT ===================== */}
            <div
              className={`${
                lawan ? 'hidden md:flex' : 'flex'
              } w-full flex-none flex-col border-gray-100 dark:border-white/10 md:w-[190px] md:border-r`}
            >
              <div className="flex flex-none items-center gap-2 px-3 py-2.5">
                <div className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded border border-gray-200 px-2 focus-within:border-brand-500 dark:border-white/10 dark:focus-within:border-brand-300">
                  <MdSearch className="h-4 w-4 flex-none text-gray-700 dark:text-gray-400" />
                  <input
                    value={cari}
                    onChange={(e) => setCari(e.target.value)}
                    placeholder="Cari nama"
                    className="h-full w-full bg-white/0 text-sm text-navy-700 outline-none placeholder:text-gray-600 dark:text-white dark:placeholder:text-gray-400"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'semua' | 'belum')}
                  aria-label="Filter chat"
                  className="h-8 flex-none cursor-pointer rounded bg-white/0 text-sm text-navy-700 outline-none dark:text-white dark:[&>option]:bg-navy-800"
                >
                  <option value="semua">Semua</option>
                  <option value="belum">Belum dibaca</option>
                </select>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <p className="p-6 text-center text-sm text-gray-700 dark:text-gray-400">
                    Memuat...
                  </p>
                ) : error ? (
                  <p className="p-6 text-center text-sm text-red-500">{error}</p>
                ) : kontakTampil.length === 0 ? (
                  <p className="p-6 text-center text-sm text-gray-700 dark:text-gray-400">
                    {cari || filter === 'belum'
                      ? 'Tidak ada hasil.'
                      : 'Belum ada kontak.'}
                  </p>
                ) : (
                  kontakTampil.map((k) => {
                    const t = k.terakhir;
                    const dariSaya = !!t && t.senderId === me;
                    const aktif = k.id === lawanId;
                    return (
                      <button
                        key={k.id}
                        onClick={() => bukaPercakapan(k.id)}
                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition duration-100 hover:bg-lightPrimary dark:hover:bg-navy-700 ${
                          aktif ? 'bg-lightPrimary dark:bg-navy-700' : ''
                        }`}
                      >
                        <Avatar />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                              {k.nama}
                            </p>
                            {t && (
                              <span
                                className={`flex-none text-[11px] ${
                                  k.belumDibaca > 0
                                    ? 'font-bold text-brand-500 dark:text-brand-300'
                                    : 'text-gray-700 dark:text-gray-400'
                                }`}
                              >
                                {waktuSingkat(t.createdAt, hariIni)}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <div
                              className={`flex min-w-0 items-center gap-1 text-[13px] ${
                                k.belumDibaca > 0
                                  ? 'font-medium text-navy-700 dark:text-white'
                                  : 'text-gray-700 dark:text-gray-400'
                              }`}
                            >
                              {dariSaya && (
                                <Centang dibaca={!!t?.readAt} kelas="flex-none" />
                              )}
                              <p className="truncate">
                                {t ? pratinjau(t.body) : LABEL_ROLE[k.role]}
                              </p>
                            </div>
                            {k.belumDibaca > 0 && (
                              <span className="flex h-[18px] min-w-[18px] flex-none items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                                {k.belumDibaca}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ===================== KOLOM KANAN ===================== */}
            <div
              className={`${
                lawan ? 'flex' : 'hidden md:flex'
              } min-w-0 flex-1 flex-col`}
            >
              {!lawan ? (
                /* Sambutan (belum ada percakapan dipilih) */
                <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
                  <svg
                    viewBox="0 0 120 90"
                    className="mb-3 h-24 w-32"
                    aria-hidden
                    fill="none"
                  >
                    <rect x="22" y="12" width="76" height="50" rx="5" className="fill-lightPrimary stroke-gray-300 dark:fill-navy-700 dark:stroke-navy-600" strokeWidth="3" />
                    <rect x="32" y="22" width="40" height="14" rx="3" className="fill-brand-500 dark:fill-brand-400" />
                    <rect x="32" y="42" width="28" height="4" rx="2" className="fill-gray-300 dark:fill-navy-600" />
                    <path d="M10 66h100l-6 10H16z" className="fill-gray-300 dark:fill-navy-600" />
                    <rect x="74" y="34" width="34" height="24" rx="5" className="fill-red-500" />
                    <circle cx="83" cy="46" r="2.5" fill="#fff" />
                    <circle cx="91" cy="46" r="2.5" fill="#fff" />
                    <circle cx="99" cy="46" r="2.5" fill="#fff" />
                  </svg>
                  <p className="text-base font-bold text-navy-700 dark:text-white">
                    Selamat Datang di Chat
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-400">
                    Pilih salah satu chat di kiri untuk mulai mengobrol.
                  </p>
                </div>
              ) : (
                /* Percakapan */
                <>
                  <div className="flex flex-none items-center gap-2 border-b border-gray-100 bg-white px-2 py-2 dark:border-white/10 dark:bg-navy-800">
                    <button
                      onClick={kembali}
                      aria-label="Kembali"
                      className="flex items-center rounded-full p-1.5 text-navy-700 hover:bg-lightPrimary dark:text-white dark:hover:bg-navy-700 md:hidden"
                    >
                      <MdArrowBack className="h-5 w-5" />
                    </button>
                    <Avatar kecil />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold leading-tight text-navy-700 dark:text-white">
                        {lawan.nama}
                      </p>
                      <p className="text-xs leading-tight text-gray-700 dark:text-gray-400">
                        {LABEL_ROLE[lawan.role]}
                      </p>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      aria-label="Tutup chat"
                      className="rounded-full p-1.5 text-gray-700 hover:bg-lightPrimary dark:text-gray-400 dark:hover:bg-navy-700 md:hidden"
                    >
                      <MdClose className="h-5 w-5" />
                    </button>
                  </div>

                {/* Area pesan */}
                <div
                  ref={listRef}
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    dekatBawahRef.current =
                      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
                  }}
                  className="relative flex-1 overflow-y-auto bg-lightPrimary px-3 py-2 dark:bg-navy-900"
                >
                  <div className="my-2 flex justify-center">
                    <span className="max-w-[90%] rounded-lg bg-amber-50 px-3 py-1.5 text-center text-[11px] leading-snug text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      Pesan hanya tersimpan {CHAT_RETENSI_HARI} hari, lalu terhapus
                      otomatis.
                    </span>
                  </div>

                  {percakapan.length === 0 ? (
                    <p className="mt-8 text-center text-xs text-gray-700 dark:text-gray-400">
                      Belum ada pesan. Kirim pesan pertama ke {lawan.nama}; pesan
                      tetap sampai walau {lawan.nama} sedang offline.
                    </p>
                  ) : (
                    percakapan.map((m, i) => {
                      const saya = m.senderId === me;
                      const prev = i > 0 ? percakapan[i - 1] : null;
                      const hari = labelHari(m.createdAt, hariIni);
                      const hariBaru = !prev || labelHari(prev.createdAt, hariIni) !== hari;
                      // Pesan pertama dalam satu rangkaian dari orang yang sama
                      // dapat "ekor" gelembung, seperti di WhatsApp.
                      const awalRangkaian = hariBaru || prev?.senderId !== m.senderId;
                      const dibalas = m.replyTo ? byId.get(m.replyTo) : undefined;
                      return (
                        <React.Fragment key={m.id}>
                          {hariBaru && (
                            <div className="my-3 flex justify-center">
                              <span className="rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:bg-navy-700 dark:text-gray-300">
                                {hari}
                              </span>
                            </div>
                          )}
                          {batasBaru?.id === m.id && (
                            <div
                              id="chat-penanda-baru"
                              className="my-3 flex justify-center"
                            >
                              <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold uppercase text-brand-500 shadow-sm dark:bg-navy-700 dark:text-brand-300">
                                {batasBaru.jumlah} pesan belum dibaca
                              </span>
                            </div>
                          )}
                          <div
                            id={`chat-msg-${m.id}`}
                            className={`group flex items-center gap-1 ${
                              awalRangkaian ? 'mt-2' : 'mt-0.5'
                            } ${saya ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            <div
                              className={`relative max-w-[82%] rounded-lg px-2 pb-1.5 pt-1.5 shadow-[0_1px_2px_rgba(27,37,75,0.12)] transition duration-300 ${
                                saya
                                  ? 'bg-brand-500 text-white'
                                  : 'bg-white text-navy-700 dark:bg-navy-700 dark:text-white'
                              } ${awalRangkaian ? (saya ? 'rounded-tr-none' : 'rounded-tl-none') : ''} ${
                                sorot === m.id ? 'ring-2 ring-amber-400' : ''
                              }`}
                            >
                              {awalRangkaian && (
                                <span
                                  aria-hidden
                                  className={
                                    saya
                                      ? 'absolute -right-[7px] top-0 h-0 w-0 border-l-[8px] border-t-[8px] border-l-brand-500 border-t-[#00000000]'
                                      : 'absolute -left-[7px] top-0 h-0 w-0 border-r-[8px] border-t-[8px] border-r-white border-t-[#00000000] dark:border-r-navy-700'
                                  }
                                />
                              )}

                              {/* Kutipan pesan yang dibalas */}
                              {m.replyTo != null && (
                                <button
                                  onClick={() => dibalas && lompatKePesan(dibalas.id)}
                                  className={`mb-1 block w-full rounded-md border-l-4 px-2 py-1 text-left text-[13px] ${
                                    saya
                                      ? 'border-white/70 bg-white/15'
                                      : 'border-brand-500 bg-lightPrimary dark:bg-navy-800'
                                  }`}
                                >
                                  <span
                                    className={`block text-xs font-bold ${
                                      saya
                                        ? 'text-white'
                                        : 'text-brand-500 dark:text-brand-300'
                                    }`}
                                  >
                                    {dibalas ? namaPengirim(dibalas) : 'Pesan'}
                                  </span>
                                  <span
                                    className={`line-clamp-2 break-words ${
                                      saya
                                        ? 'text-white/85'
                                        : 'text-gray-700 dark:text-gray-400'
                                    }`}
                                  >
                                    {dibalas ? dibalas.body : 'Pesan tidak tersedia'}
                                  </span>
                                </button>
                              )}

                              {/* Isi + ruang kosong supaya jam tidak menimpa teks */}
                              <p className="whitespace-pre-wrap break-words text-sm leading-[19px]">
                                {m.body}
                                <span
                                  aria-hidden
                                  className={`inline-block ${saya ? 'w-[68px]' : 'w-[44px]'}`}
                                />
                              </p>
                              <span
                                className={`absolute bottom-1 right-2 flex items-center gap-0.5 text-[11px] leading-none ${
                                  saya
                                    ? 'text-white/70'
                                    : 'text-gray-700 dark:text-gray-400'
                                }`}
                              >
                                {jamWib(m.createdAt)}
                                {saya && (
                                  <Centang dibaca={!!m.readAt} varian="gelembung" />
                                )}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setBalas(m);
                                inputRef.current?.focus();
                              }}
                              aria-label="Balas pesan"
                              title="Balas"
                              className="flex-none rounded-full p-1.5 text-gray-700 opacity-40 transition duration-150 hover:bg-white hover:opacity-100 group-hover:opacity-100 dark:text-gray-400 dark:hover:bg-navy-700"
                            >
                              <MdReply className="h-4 w-4" />
                            </button>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>

                {/* Kotak ketik */}
                <div className="border-t border-gray-100 bg-white px-2 py-2 dark:border-white/10 dark:bg-navy-800">
                  {balas && (
                    <div className="mb-2 flex items-stretch overflow-hidden rounded-lg bg-lightPrimary dark:bg-navy-700">
                      <div
                        className={`w-1 flex-none ${
                          balas.senderId === me ? 'bg-brand-500' : 'bg-brand-300'
                        }`}
                      />
                      <div className="min-w-0 flex-1 px-3 py-1.5 text-[13px]">
                        <p className="text-xs font-bold text-brand-500 dark:text-brand-300">
                          {namaPengirim(balas)}
                        </p>
                        <p className="line-clamp-1 break-words text-gray-700 dark:text-gray-300">
                          {balas.body}
                        </p>
                      </div>
                      <button
                        onClick={() => setBalas(null)}
                        aria-label="Batal membalas"
                        className="px-2 text-gray-700 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white"
                      >
                        <MdClose className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  {galat && <p className="mb-1.5 px-1 text-xs text-red-500">{galat}</p>}
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={draft}
                      maxLength={CHAT_MAX_PANJANG}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          handleKirim();
                        }
                      }}
                      placeholder="Ketik pesan"
                      className="max-h-[120px] min-h-[42px] flex-1 resize-none rounded-lg bg-lightPrimary px-3 py-2.5 text-sm text-navy-700 outline-none placeholder:text-gray-600 dark:bg-navy-700 dark:text-white dark:placeholder:text-gray-400"
                    />
                    <button
                      onClick={handleKirim}
                      disabled={mengirim || !draft.trim()}
                      aria-label="Kirim"
                      className="linear flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full bg-brand-500 text-white transition duration-200 hover:bg-brand-600 disabled:opacity-50 dark:bg-brand-400 dark:hover:bg-brand-300"
                    >
                      <MdSend className="h-5 w-5" />
                    </button>
                  </div>
                  {draft.length > CHAT_MAX_PANJANG - 200 && (
                    <p className="mt-1 text-right text-[10px] text-gray-700 dark:text-gray-400">
                      {draft.length}/{CHAT_MAX_PANJANG}
                    </p>
                  )}
                </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
