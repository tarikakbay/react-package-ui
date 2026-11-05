import type { ButtonProps } from 'react-native-paper';

export type CxSubmitButtonProps = Omit<ButtonProps, 'onPress' | 'loading'>;
