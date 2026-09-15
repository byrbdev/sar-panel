'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from 'components/card';
import { useAppData } from 'context/AppDataContext';
import { useMember } from 'context/MemberContext';
import { MdStorefront, MdPeople } from 'react-icons/md';

const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const TokoPage = () => {
  const { toko } = useAppData();
  const { member } = useMember();
  const router = useRouter();

  const tokoMilik = (id: string) => toko.filter((t) => t.ownerId === id);
  const tokoTanpaPemilik = toko.filter((t) => !t.ownerId);

  return (
    <div className="mt-3">
      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Toko
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Klik nama member untuk melihat & mengelola toko miliknya
            </p>
          </div>
          <Link
            href="/admin/member"
            className="linear flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            <MdPeople className="h-5 w-5" />
            Kelola Anggota
          </Link>
        </div>

        <div className="mt-8 w-full">
          <table className="w-full table-fixed">
            <thead>
              <tr className="!border-px !border-gray-400">
                {['NAMA MEMBER', 'JUMLAH TOKO', 'TOTAL SALDO IKLAN'].map(
                  (h) => (
                    <th
                      key={h}
                      className="border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 text-start"
                    >
                      <p className="truncate text-xs font-bold text-gray-600 dark:text-white sm:text-sm">
                        {h}
                      </p>
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {member.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Belum ada anggota. Tambahkan lewat halaman{' '}
                    <Link
                      href="/admin/member"
                      className="text-brand-500 underline"
                    >
                      Member
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                member.map((m) => {
                  const list = tokoMilik(m.id);
                  const totalSaldo = list.reduce(
                    (a, t) => a + t.saldoIklan,
                    0,
                  );
                  return (
                    <tr
                      key={m.id}
                      onClick={() => router.push(`/admin/pemulihan/${m.id}`)}
                      className="cursor-pointer transition duration-150 hover:bg-lightPrimary dark:hover:bg-navy-700"
                    >
                      <td className="border-white/0 py-3 pr-2">
                        <div className="flex items-center gap-2">
                          <MdStorefront className="h-4 w-4 flex-shrink-0 text-brand-500 dark:text-white" />
                          <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                            {m.nama}
                          </p>
                        </div>
                      </td>
                      <td className="border-white/0 py-3 pr-2">
                        <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                          {list.length} toko
                        </p>
                      </td>
                      <td className="border-white/0 py-3 pr-2">
                        <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                          {formatRupiah(totalSaldo)}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {tokoTanpaPemilik.length > 0 && (
          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            Ada <b>{tokoTanpaPemilik.length} toko</b> yang belum punya pemilik.
            Buka salah satu member lalu edit tokonya untuk mengaitkan
            kepemilikan.
          </div>
        )}
      </Card>
    </div>
  );
};

export default TokoPage;
