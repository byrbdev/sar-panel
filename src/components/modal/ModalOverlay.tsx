'use client';
import { ReactNode, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const ModalOverlay = (props: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidthClass?: string;
}) => {
  const { open, onClose, title, children, maxWidthClass } = props;

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

  if (!open) return null;

  return (
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
    </div>
  );
};

export default ModalOverlay;
