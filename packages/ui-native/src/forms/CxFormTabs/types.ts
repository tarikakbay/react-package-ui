import type { ReactNode } from 'react';

export type CxFormTabProps = {
  /** Sekme kimliği; içindeki alanlar bu kimlikle kaydolur. */
  id: string;
  title: string;
  children: ReactNode;
};

export type CxFormTabsProps = {
  /** Yalnızca <CxFormTab> elemanları. */
  children: ReactNode;
};
