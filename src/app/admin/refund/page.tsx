'use client';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabaseClient';
import RefundAdminView from 'components/admin/refund/RefundAdminView';
import RefundMemberView from 'components/admin/refund/RefundMemberView';

const RefundPage = () => {
  const { profile } = useAuth();

  if (isSupabaseConfigured && profile?.role === 'member') {
    return <RefundMemberView />;
  }

  return <RefundAdminView />;
};

export default RefundPage;
