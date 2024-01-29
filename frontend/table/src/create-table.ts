import {
  type Table,
  type TableOptionsResolved,
  createTable as createReactTable
} from "@tanstack/react-table";

export const createTable = <T>(config: TableOptionsResolved<T>): Table<T> => {
  return createReactTable<T>(config);
};
