'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import TokoListPerMemberContent from 'components/admin/pemulihan/TokoListPerMemberContent';
import { useMember } from 'context/MemberContext';
import { MdArrowBack } from 'react-icons/md';

const TokoMemberPage = ({
  params,
}: {
  params: Promise<{ member: string }>;
}) => {
  const { member: memberId } = React.use(params);
  const { member } = useMember();
  const router = useRouter();

  const current = member.find((m) => m.id === memberId);

  return (
    <div className="mt-3">
      <button
        onClick={() => router.push('/admin/pemulihan')}
        className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gray-600 transition duration-150 hover:text-brand-500 dark:text-gray-300 dark:hover:text-white"
      >
        <MdArrowBack className="h-4 w-4" />
        Kembali ke Toko
      </button>

      <p className="mb-2 text-lg font-bold text-navy-700 dark:text-white">
        Toko Milik {current?.nama || memberId}
      </p>

      <TokoListPerMemberContent
        ownerId={memberId}
        ownerNama={current?.nama}
      />
    </div>
  );
};

export default TokoMemberPage;
