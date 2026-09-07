'use client';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabaseClient';
import AnalisaSuperAdminView from 'components/admin/analisa/AnalisaSuperAdminView';
import AnalisaMemberView from 'components/admin/analisa/AnalisaMemberView';

const AnalisaPage = () => {
  const { profile } = useAuth();

  if (isSupabaseConfigured && profile?.role === 'member') {
    return <AnalisaMemberView />;
  }

  return <AnalisaSuperAdminView />;
};

export default AnalisaPage;
