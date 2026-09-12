'use client';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

const PaginationControl = (props: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) => {
  const { page, totalPages, onPrev, onNext } = props;
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Halaman {page} dari {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={page === 1}
          className="flex items-center gap-1 rounded-lg bg-lightPrimary px-3 py-2 text-sm font-medium text-gray-600 transition duration-150 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-navy-700 dark:text-white"
        >
          <MdChevronLeft className="h-4 w-4" />
          Sebelumnya
        </button>
        <button
          onClick={onNext}
          disabled={page === totalPages}
          className="flex items-center gap-1 rounded-lg bg-lightPrimary px-3 py-2 text-sm font-medium text-gray-600 transition duration-150 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-navy-700 dark:text-white"
        >
          Berikutnya
          <MdChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PaginationControl;
