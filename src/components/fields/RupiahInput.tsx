'use client';
import InputField from 'components/fields/InputField';

/** "70000" / 70000 -> "70.000" (format ribuan Indonesia, tanpa "Rp") */
const formatRibuan = (value: number | string): string => {
  const num =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/[^0-9]/g, '')) || 0;
  return num === 0 ? '' : num.toLocaleString('id-ID');
};

/**
 * Input angka untuk field finansial (harga jual, modal, denda, saldo iklan,
 * dsb). Menampilkan format ribuan otomatis saat mengetik (mis. 70000 -> 70.000)
 * sementara nilai asli yang dikirim ke `onChange` tetap number murni, bukan
 * string berformat, supaya tetap aman disimpan sebagai kolom numeric di DB.
 */
const RupiahInput = (props: {
  id: string;
  label: string;
  placeholder?: string;
  value: number;
  onChange: (value: number) => void;
  extra?: string;
  disabled?: boolean;
}) => {
  const { id, label, placeholder, value, onChange, extra, disabled } = props;

  return (
    <InputField
      id={id}
      label={label}
      placeholder={placeholder || '0'}
      type="text"
      extra={extra || ''}
      disabled={disabled}
      value={formatRibuan(value)}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        onChange(raw ? Number(raw) : 0);
      }}
    />
  );
};

export default RupiahInput;
