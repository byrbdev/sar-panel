import Card from 'components/card';
import { MdConstruction } from 'react-icons/md';

const ComingSoon = (props: { title: string; description?: string }) => {
  const { title, description } = props;
  return (
    <Card extra="!p-[40px] flex flex-col items-center justify-center text-center min-h-[420px]">
      <div className="mb-5 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
        <MdConstruction className="h-9 w-9 text-brand-500 dark:text-white" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-navy-700 dark:text-white">
        {title}
      </h2>
      <p className="max-w-[420px] text-base text-gray-600 dark:text-gray-400">
        {description ||
          'Halaman ini sedang dalam pengembangan. Fitur akan segera hadir menyusul modul-modul lainnya.'}
      </p>
      <span className="mt-6 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-500 dark:bg-navy-700 dark:text-white">
        Segera Hadir
      </span>
    </Card>
  );
};

export default ComingSoon;
