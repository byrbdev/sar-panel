'use client';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';

const ModalOverlay = (props: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidthClass?: string;
}) => {
  const { open, onClose, title, children, maxWidthClass } = props;

  // Render lewat portal ke document.body. WAJIB, jangan dihapus: kalau
  // komponen ini dirender di dalam elemen yang punya `backdrop-filter`,
  // `filter`, atau `transform` (mis. Navbar pakai class `backdrop-blur-xl`),
  // elemen tsb otomatis jadi "containing block" baru buat descendant
  // `position: fixed` -- akibatnya modal ini jadi kejebak/gepeng cuma di
  // area elemen itu (kelihatan seperti nempel di navbar, bukan menutupi
  // layar penuh). Render ke document.body lewat portal membuat modal ini
  // SELALU relatif ke viewport asli, apapun ancestor-nya nanti.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative z-[101] flex max-h-[90vh] w-full ${maxWidthClass || 'max-w-[520px]'} flex-col rounded-[20px] bg-white shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:shadow-none`}>
        <div className="flex items-center justify-between px-7 pb-4 pt-7">
          <h3 className="text-2xl font-bold text-navy-700 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-lightPrimary text-gray-600 transition duration-200 hover:bg-gray-100 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-7 pb-7">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalOverlay;
