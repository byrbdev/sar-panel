import { MdLogout } from 'react-icons/md';

const LogoutButton = () => {
  return (
    <div className="mt-14 flex w-[256px] justify-center">
      <button className="linear flex w-full items-center justify-center gap-2 rounded-xl bg-lightPrimary py-3 text-sm font-bold text-red-500 transition duration-200 hover:bg-red-50 active:bg-red-100 dark:bg-navy-700 dark:text-red-400 dark:hover:bg-white/10 dark:active:bg-white/5">
        <MdLogout className="h-5 w-5" />
        Logout
      </button>
    </div>
  );
};

export default LogoutButton;
