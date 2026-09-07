'use client';
import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  MdCheckCircle,
  MdError,
  MdInfo,
  MdWarningAmber,
  MdClose,
} from 'react-icons/md';

/* ================= Toast ================= */
type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; message: string; type: ToastType };

let toastCounter = 0;

const toastIcon: Record<ToastType, JSX.Element> = {
  success: <MdCheckCircle className="h-5 w-5 text-green-500" />,
  error: <MdError className="h-5 w-5 text-red-500" />,
  info: <MdInfo className="h-5 w-5 text-brand-500" />,
};

const toastBorder: Record<ToastType, string> = {
  success: 'border-l-4 border-green-500',
  error: 'border-l-4 border-red-500',
  info: 'border-l-4 border-brand-500',
};

/* ================= Confirm ================= */
type ConfirmOptions = {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmState = ConfirmOptions & {
  message: string;
  resolve: (value: boolean) => void;
} | null;

type UIContextType = {
  notify: (message: string, type?: ToastType) => void;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
};

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const notify = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const confirm = useCallback(
    (message: string, options?: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setConfirmState({ message, ...options, resolve });
      }),
    [],
  );

  const handleConfirm = (result: boolean) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  return (
    <UIContext.Provider value={{ notify, confirm }}>
      {children}

      {/* Toast container - bottom right */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl bg-white p-4 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none ${toastBorder[t.type]}`}
            style={{
              animation: 'toastIn 0.25s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            <div className="mt-0.5 flex-shrink-0">{toastIcon[t.type]}</div>
            <p className="flex-1 text-sm text-navy-700 dark:text-white">
              {t.message}
            </p>
            <button
              onClick={() => dismissToast(t.id)}
              className="flex-shrink-0 text-gray-400 transition hover:text-gray-600 dark:hover:text-white"
            >
              <MdClose className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            onClick={() => handleConfirm(false)}
          />
          <div className="relative z-[211] w-full max-w-[400px] rounded-[20px] bg-white p-7 text-center shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                confirmState.danger
                  ? 'bg-red-50 dark:bg-red-500/10'
                  : 'bg-lightPrimary dark:bg-navy-700'
              }`}
            >
              <MdWarningAmber
                className={`h-7 w-7 ${confirmState.danger ? 'text-red-500' : 'text-brand-500 dark:text-white'}`}
              />
            </div>
            <h3 className="mb-2 text-lg font-bold text-navy-700 dark:text-white">
              {confirmState.title || 'Konfirmasi'}
            </h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
              {confirmState.message}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleConfirm(false)}
                className="flex-1 rounded-lg bg-lightPrimary px-5 py-2.5 text-sm font-medium text-gray-600 transition duration-200 hover:bg-gray-100 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
              >
                {confirmState.cancelText || 'Batal'}
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className={`flex-1 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition duration-200 ${
                  confirmState.danger
                    ? 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                    : 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700'
                }`}
              >
                {confirmState.confirmText || 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
