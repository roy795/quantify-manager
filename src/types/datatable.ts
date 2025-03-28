
import { ReactNode } from "react";

export interface Column<T = any> {
  header: string | ReactNode;
  accessor: string;
  cell?: (row: T) => ReactNode | string;
}
