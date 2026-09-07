'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from 'components/card';
import { useBrutal } from 'context/BrutalContext';
import { useMember } from 'context/MemberContext';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabaseClient';
import { MdWhatshot, MdPeople } from 'react-icons/md';

const BrutalPage = () => {
  const { items } = useBrutal();
  const { member } = useMember();
  const { profile } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    // Member tidak perlu lihat daftar anggota lain — langsung ke data
    // brutal miliknya sendiri.
    if (isSupabaseConfigured && profile?.role === 'member') {
      router.replace(`/admin/brutal/${profile.id}`);
    }
  }, [profile, router]);

  const totalBrutal = (id: string) =>
    items.filter((i) => i.anggotaId === id).length;

  if (isSupabaseConfigured && profile?.role === 'member') {
    return null; // sedang redirect
  }

  return (
    <div className="mt-3">
      <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
        <div className="relative flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Brutal
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Klik nama anggota untuk melihat data brutal miliknya
            </p>
          </div>
          <Link
            href="/admin/member"
            className="linear flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            <MdPeople className="h-5 w-5" />
            Kelola Anggota
          </Link>
        </div>

        <div className="mt-8 w-full">
          <table className="w-full table-fixed">
            <thead>
              <tr className="!border-px !border-gray-400">
                {['NAMA', 'TOTAL BRUTAL'].map((h) => (
                  <th
                    key={h}
                    className="border-b-[1px] border-gray-200 pb-2 pr-2 pt-4 text-start"
                  >
                    <p className="text-sm font-bold text-gray-600 dark:text-white">
                      {h}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {member.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Belum ada anggota. Tambahkan lewat halaman{' '}
                    <Link href="/admin/member" className="text-brand-500 underline">
                      Member
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                member.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => router.push(`/admin/brutal/${a.id}`)}
                    className="cursor-pointer transition duration-150 hover:bg-lightPrimary dark:hover:bg-navy-700"
                  >
                    <td className="border-white/0 py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <MdWhatshot className="h-4 w-4 flex-shrink-0 text-orange-500" />
                        <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                          {a.nama}
                        </p>
                      </div>
                    </td>
                    <td className="border-white/0 py-3 pr-2">
                      <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                        {totalBrutal(a.id)} data
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BrutalPage;
