'use client';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabaseClient';
import DashboardSuperAdminView from 'components/admin/dashboard/DashboardSuperAdminView';
import DashboardAdminView from 'components/admin/dashboard/DashboardAdminView';
import DashboardMemberView from 'components/admin/dashboard/DashboardMemberView';

const Dashboard = () => {
  const { profile } = useAuth();

  if (isSupabaseConfigured) {
    if (profile?.role === 'admin') return <DashboardAdminView />;
    if (profile?.role === 'member') return <DashboardMemberView />;
  }

  return <DashboardSuperAdminView />;
};

export default Dashboard;
