import { CxTextField } from '@cx/ui-web';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Card, Note } from './helpers';

const meta: Meta<typeof CxTextField> = {
  title: 'Alanlar/CxTextField',
  component: CxTextField,
  args: {
    label: 'Ad Soyad',
    helperText: '',
    required: false,
    disabled: false,
    readOnly: false,
    busy: false,
    multiline: false,
    kind: 'text',
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['text', 'email', 'phone', 'password'] },
    transform: { control: 'inline-radio', options: [undefined, 'upper', 'lower', 'trim'] },
    error: { control: 'text' },
    value: { table: { disable: true } },
    onChange: { table: { disable: true } },
    col: { table: { disable: true } },
    readOnlyOn: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof CxTextField>;

/** Sağdaki kontrollerle tüm props'u deneyin. */
export const Playground: Story = {
  render: function Render(args) {
    const [v, setV] = useState('');
    return (
      <Card maxWidth={480}>
        <CxTextField {...args} value={v} onChange={setV} />
        <Note>
          <br />
          Değer: <code>{JSON.stringify(v)}</code>
        </Note>
      </Card>
    );
  },
};

function Controlled(props: Omit<React.ComponentProps<typeof CxTextField>, 'value' | 'onChange'> & { initial?: string }) {
  const { initial = '', ...rest } = props;
  const [v, setV] = useState(initial);
  return <CxTextField {...rest} value={v} onChange={setV} />;
}

export const Turler: Story = {
  name: 'Türler (kind)',
  render: () => (
    <Card maxWidth={480}>
      <Stack spacing={2}>
        <Controlled label="Metin" />
        <Controlled label="E-posta" kind="email" helperText="Yazarken küçük harfe çevrilir, boşluk atılır" />
        <Controlled label="Telefon" kind="phone" helperText="E.164 olarak saklanır: +905321234567" />
        <Controlled label="Şifre" kind="password" initial="gizli123" />
        <Controlled label="Kod" transform="upper" helperText="transform='upper' — Türkçe: i → İ" />
        <Controlled label="Açıklama" multiline rows={3} />
      </Stack>
    </Card>
  ),
};

export const Durumlar: Story = {
  render: () => (
    <Card maxWidth={480}>
      <Stack spacing={2}>
        <Controlled label="Zorunlu" required />
        <Controlled label="Yardım metni" helperText="Kısa bir açıklama" />
        <Controlled label="Hatalı" error="Ad Soyad zorunludur" required />
        <Controlled label="Salt okunur (yıldız gösterilmez)" readOnly required initial="K0001" />
        <Controlled label="Pasif" disabled initial="Değiştirilemez" />
        <Controlled label="Meşgul (busy)" busy initial="1234567890" />
      </Stack>
    </Card>
  ),
};
