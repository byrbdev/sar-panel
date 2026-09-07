'use client';
import InputField from 'components/fields/InputField';

export type MemberFormValue = {
  nama: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
};

export const emptyMemberForm = (): MemberFormValue => ({
  nama: '',
  email: '',
  password: '',
  role: 'member',
});

const MemberForm = (props: {
  value: MemberFormValue;
  onChange: (value: MemberFormValue) => void;
}) => {
  const { value, onChange } = props;

  return (
    <div className="flex flex-col gap-5">
      <InputField
        id="member_nama"
        label="Nama"
        placeholder="Nama anggota tim"
        type="text"
        extra=""
        value={value.nama}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...value, nama: e.target.value })
        }
      />
      <InputField
        id="member_email"
        label="Email (untuk login)"
        placeholder="nama@email.com"
        type="email"
        extra=""
        value={value.email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...value, email: e.target.value })
        }
      />
      <InputField
        id="member_password"
        label="Password"
        placeholder="Minimal 6 karakter"
        type="password"
        extra=""
        value={value.password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...value, password: e.target.value })
        }
      />
      <div>
        <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
          Role
        </label>
        <select
          value={value.role}
          onChange={(e) =>
            onChange({ ...value, role: e.target.value as 'admin' | 'member' })
          }
          className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:text-white"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <p className="mt-1.5 ml-1.5 text-xs text-gray-500 dark:text-gray-400">
          Member: dashboard & penjualan sesuai toko miliknya sendiri. Admin:
          memproses Pesanan Masuk & Refund untuk semua toko.
        </p>
      </div>
    </div>
  );
};

export default MemberForm;
