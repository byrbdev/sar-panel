'use client';
import React, { createContext, useContext } from 'react';
import { MemberRow } from 'variables/dropshipMember';
import { useSyncedTable } from 'hooks/useSyncedTable';

type ProfileRow = MemberRow & { role?: string };

type MemberContextType = {
  member: MemberRow[];
  setMember: React.Dispatch<React.SetStateAction<MemberRow[]>>;
  namaOptions: string[];
};

const MemberContext = createContext<MemberContextType | null>(null);

const profileToDb = (m: ProfileRow) => ({
  id: m.id,
  nama: m.nama,
  role: m.role || 'member',
});
const profileFromDb = (r: any): ProfileRow => ({
  id: String(r.id),
  nama: r.nama,
  role: r.role,
});

export const MemberProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Sinkron ke tabel `profiles`. Insert/delete sungguhan dilakukan lewat
  // /api/member (server, service role) — di sini utamanya untuk FETCH awal
  // dan REALTIME supaya semua sesi Super Admin selalu lihat data terbaru.
  // numericId=false karena id di 'profiles' = uuid dari auth.users, bukan
  // bigint identity yang perlu digenerate ulang oleh DB.
  const [profiles, setProfiles] = useSyncedTable<ProfileRow>(
    'profiles',
    [],
    profileToDb,
    profileFromDb,
    false,
  );

  // Sembunyikan super_admin dari daftar Member (yang dikelola di sini
  // hanya akun admin & member).
  const member = profiles.filter((p) => p.role !== 'super_admin');

  const setMember: React.Dispatch<React.SetStateAction<MemberRow[]>> = (
    action,
  ) => {
    setProfiles((prev) => {
      const prevMemberOnly = prev.filter((p) => p.role !== 'super_admin');
      const next =
        typeof action === 'function'
          ? (action as any)(prevMemberOnly)
          : action;
      const superAdmins = prev.filter((p) => p.role === 'super_admin');
      return [...superAdmins, ...next];
    });
  };

  const namaOptions = member.map((m) => m.nama);

  return (
    <MemberContext.Provider value={{ member, setMember, namaOptions }}>
      {children}
    </MemberContext.Provider>
  );
};

export const useMember = () => {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error('useMember must be used within MemberProvider');
  return ctx;
};
