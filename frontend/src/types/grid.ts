// Tipos locales para evitar importar de @mui/x-data-grid
import React from 'react';

export interface GridColDef {
  field: string;
  headerName?: string;
  width?: number;
  type?: string;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  hide?: boolean;
  valueGetter?: (params: any) => any;
  valueSetter?: (params: any) => any;
  renderCell?: (params: any) => React.ReactNode;
  renderHeader?: (params: any) => React.ReactNode;
  getActions?: (params: any) => React.ReactNode[];
}

export interface GridActionsCellItemProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  showInMenu?: boolean;
}

export interface DataGridProps {
  columns?: GridColDef[];
  rows?: any[];
  loading?: boolean;
  height?: number;
  sx?: any;
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  disableColumnMenu?: boolean;
  disableColumnFilter?: boolean;
  autoHeight?: boolean;
  density?: 'compact' | 'standard' | 'comfortable';
  rowHeight?: number;
  headerHeight?: number;
  experimentalFeatures?: any;
  pagination?: boolean;
  paginationMode?: string;
  rowCount?: number;
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
}

export interface GridRowParams {
  id: string;
  row: any;
  api: any;
  getValue: (field: string) => any;
}

export interface GridCellParams extends GridRowParams {
  field: string;
  value: any;
  hasFocus: boolean;
  tabIndex: number;
  getValue: (field: string) => any;
}

export interface GridRenderCellParams extends GridCellParams {
  colDef: GridColDef;
  cellMode: 'edit' | 'view';
  isEditable: boolean;
}
