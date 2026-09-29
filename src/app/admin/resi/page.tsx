'use client';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabaseClient';
import ResiAdminView from 'components/admin/resi/ResiAdminView';
import ResiMemberView from 'components/admin/resi/ResiMemberView';

const ResiPage = () => {
  const { profile } = useAuth();

  // Sama seperti halaman Penjualan: selama Supabase belum dikonfigurasi,
  // tampilkan view admin supaya bisa dites lokal.
  if (isSupabaseConfigured && profile?.role === 'member') {
    return <ResiMemberView />;
  }

  return <ResiAdminView />;
};

export default ResiPage;
