import { createTable as createReactTable } from "@tanstack/react-table";
import type { Table, TableOptionsResolved } from "@tanstack/table-core";

export const createTable = <T>(config: TableOptionsResolved<T>): Table<T> => {
  return createReactTable<T>(config);
};
