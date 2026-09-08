'use client';
import React from 'react';
import Dropdown from 'components/dropdown';
import { FiAlignJustify } from 'react-icons/fi';
import NavLink from 'components/link/NavLink';
import { FiSearch } from 'react-icons/fi';
import { RiMoonFill, RiSunFill } from 'react-icons/ri';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { MdPerson, MdLogout, MdReceiptLong } from 'react-icons/md';
import { useAuth } from 'context/AuthContext';
import { useGlobalSearch } from 'hooks/useGlobalSearch';
import ModalOverlay from 'components/modal/ModalOverlay';

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  member: 'Member',
};

const Navbar = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
  [x: string]: any;
}) => {
  const { onOpenSidenav, brandText } = props;
  const { profile, signOut } = useAuth();
  const [darkmode, setDarkmode] = React.useState(false);
  React.useEffect(() => {
    setDarkmode(document.body.classList.contains('dark'));
  }, []);

  const [searchTerm, setSearchTerm] = React.useState('');
  const { results, notifications, selectedNotif, setSelectedNotif } =
    useGlobalSearch(searchTerm);

  const greetingName =
    profile?.role === 'member'
      ? profile?.nama
      : roleLabel[profile?.role || ''] || '';

  return (
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#0b14374d]">
      <div className="ml-[6px]">
        <div className="h-6 w-[224px] pt-1">
          <a
            className="text-sm font-normal text-navy-700 hover:underline dark:text-white dark:hover:text-white"
            href=" "
          >
            Pages
            <span className="mx-1 text-sm text-navy-700 hover:text-navy-700 dark:text-white">
              {' '}
              /{' '}
            </span>
          </a>
          <NavLink
            className="text-sm font-normal capitalize text-navy-700 hover:underline dark:text-white dark:hover:text-white"
            href="#"
          >
            {brandText}
          </NavLink>
        </div>
        <p className="shrink text-[33px] capitalize text-navy-700 dark:text-white">
          <NavLink
            href="#"
            className="font-bold capitalize hover:text-navy-700 dark:hover:text-white"
          >
            {brandText}
          </NavLink>
        </p>
      </div>

      <div className="relative mt-[3px] flex h-[61px] w-[355px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:w-[365px] md:flex-grow-0 md:gap-1 xl:w-[365px] xl:gap-2">
        <div className="relative flex h-full items-center rounded-full bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white xl:w-[225px]">
          <p className="pl-3 pr-2 text-xl">
            <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
          </p>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari no pesanan, toko, produk..."
            className="block h-full w-full rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white sm:w-fit"
          />
          {searchTerm.trim().length > 1 && (
            <div className="absolute left-0 top-[52px] z-50 max-h-[320px] w-[320px] overflow-y-auto rounded-xl bg-white p-2 shadow-xl shadow-shadow-500 dark:bg-navy-700">
              {results.length === 0 ? (
                <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada hasil.
                </p>
              ) : (
                results.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-2.5 text-xs hover:bg-lightPrimary dark:hover:bg-navy-800"
                  >
                    <p className="font-bold text-navy-700 dark:text-white">
                      {r.title}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {r.subtitle}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>

        {/* Notifikasi */}
        <Dropdown
          button={
            <p className="relative cursor-pointer">
              <IoMdNotificationsOutline className="h-4 w-4 text-gray-600 dark:text-white" />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </p>
          }
          animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          classNames={'py-2 top-4 -left-[230px] md:-left-[350px] w-max'}
        >
          <div className="flex w-[320px] flex-col gap-2 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none sm:w-[360px]">
            <p className="text-base font-bold text-navy-700 dark:text-white">
              Notifikasi
            </p>
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Belum ada notifikasi.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNotif(n)}
                  className="flex w-full items-start gap-2 rounded-lg p-2 text-left transition hover:bg-lightPrimary dark:hover:bg-navy-800"
                >
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-navy-800">
                    <MdReceiptLong className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-navy-700 dark:text-white">
                      {n.produk}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {n.namaToko} • Resi: {n.noResi}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Dropdown>

        <div
          className="cursor-pointer text-gray-600"
          onClick={() => {
            if (darkmode) {
              document.body.classList.remove('dark');
              setDarkmode(false);
            } else {
              document.body.classList.add('dark');
              setDarkmode(true);
            }
          }}
        >
          {darkmode ? (
            <RiSunFill className="h-4 w-4 text-gray-600 dark:text-white" />
          ) : (
            <RiMoonFill className="h-4 w-4 text-gray-600 dark:text-white" />
          )}
        </div>

        {/* Profile & Dropdown */}
        <Dropdown
          button={
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
              {(greetingName || 'U').charAt(0).toUpperCase()}
            </div>
          }
          classNames={'py-2 top-8 -left-[180px] w-max'}
        >
          <div className="flex w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
            <div className="ml-4 flex items-center gap-2">
              <MdPerson className="h-4 w-4 text-brand-500 dark:text-white" />
              <p className="text-sm font-bold text-navy-700 dark:text-white">
                👋 Hey, {greetingName || 'User'}
              </p>
            </div>
            <div className="mt-3 h-px w-full bg-gray-200 dark:bg-white/20" />
            <div className="ml-4 mt-3 flex flex-col">
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600"
              >
                <MdLogout className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </div>
        </Dropdown>
      </div>

      {selectedNotif && (
        <ModalOverlay
          open={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          title="Detail Pengiriman"
        >
          <div className="space-y-3 text-sm">
            <p className="text-navy-700 dark:text-white">
              <b>Produk:</b> {selectedNotif.produk}
            </p>
            <p className="text-navy-700 dark:text-white">
              <b>No Resi:</b> {selectedNotif.noResi || '-'}
            </p>
            <p className="text-navy-700 dark:text-white">
              <b>Jasa Pengiriman:</b> {selectedNotif.jasaPengiriman || '-'}
            </p>
            <p className="text-navy-700 dark:text-white">
              <b>Toko:</b> {selectedNotif.namaToko}
            </p>
          </div>
        </ModalOverlay>
      )}
    </nav>
  );
};

export default Navbar;
