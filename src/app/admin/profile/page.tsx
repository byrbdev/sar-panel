'use client';
import Card from 'components/card';
import ChangePasswordCard from 'components/admin/profile/ChangePasswordCard';
import { useAuth } from 'context/AuthContext';
import { MdPerson } from 'react-icons/md';

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  member: 'Member',
};

const ProfileOverview = () => {
  const { profile } = useAuth();

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      <Card extra="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white dark:bg-brand-400">
            {profile?.nama?.charAt(0)?.toUpperCase() || (
              <MdPerson className="h-7 w-7" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-700 dark:text-white">
              {profile?.nama || 'Pengguna'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {roleLabel[profile?.role || ''] || profile?.role}
            </p>
          </div>
        </div>
      </Card>

      <ChangePasswordCard />
    </div>
  );
};

export default ProfileOverview;
