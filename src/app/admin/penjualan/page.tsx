'use client';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabaseClient';
import PenjualanAdminView from 'components/admin/penjualan/PenjualanAdminView';
import PenjualanMemberView from 'components/admin/penjualan/PenjualanMemberView';

const PenjualanPage = () => {
  const { profile } = useAuth();

  // Selama Supabase belum dikonfigurasi, tampilkan view admin (default) agar
  // tetap bisa dites secara lokal tanpa login sungguhan.
  if (isSupabaseConfigured && profile?.role === 'member') {
    return <PenjualanMemberView />;
  }

  return <PenjualanAdminView />;
};

export default PenjualanPage;
