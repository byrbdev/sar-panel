'use client';
import React from 'react';
import InputField from 'components/fields/InputField';

/**
 * Input "Jumlah". Default 1, hanya angka >= 1. Boleh dikosongkan
 * sementara saat mengetik; saat kolom ditinggalkan otomatis kembali ke 1.
 */
const JumlahInput = (props: {
  id: string;
  value?: number;
  onChange: (value: number) => void;
  label?: string;
}) => {
  const { id, value, onChange, label = 'Jumlah' } = props;
  const [text, setText] = React.useState(String(value && value >= 1 ? value : 1));

  // Sinkron kalau nilai diubah dari luar (mis. form di-reset / dibuka ulang)
  React.useEffect(() => {
    const cur = Number(text);
    const ext = value && value >= 1 ? value : 1;
    if (text !== '' && cur !== ext) setText(String(ext));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div onBlur={() => {
      if (text === '' || Number(text) < 1) {
        setText('1');
        onChange(1);
      }
    }}>
      <InputField
        id={id}
        label={label}
        placeholder="1"
        type="text"
        extra=""
        value={text}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
          setText(digits);
          const n = Number(digits);
          if (n >= 1) onChange(n);
        }}
      />
    </div>
  );
};

export default JumlahInput;
