'use client';
import InputField from 'components/fields/InputField';

const AnggotaForm = (props: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { value, onChange } = props;
  return (
    <InputField
      id="anggota_nama"
      label="Nama Anggota"
      placeholder="Nama tim/anggota"
      type="text"
      extra=""
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.target.value)
      }
    />
  );
};

export default AnggotaForm;
