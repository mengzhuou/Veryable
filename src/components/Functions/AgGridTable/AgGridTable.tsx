// src/components/Functions/AgGridTable/AgGridTable.tsx
'use client';
import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import styles from './AgGridTable.module.scss';

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

interface AgGridTableProps {
  rowData: any[];
  columnDefs: any[];
  defaultColDef?: any;
  domLayout?: string;
  suppressHorizontalScroll?: boolean;
}

const AgGridTable: React.FC<AgGridTableProps> = ({
  rowData,
  columnDefs,
  defaultColDef,
  suppressHorizontalScroll,
}) => (
  <div className={styles.agBody}>
    <div className={`${styles.pageContainer} ag-theme-alpine`} style={{ width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout="autoHeight"
        suppressHorizontalScroll={suppressHorizontalScroll}
      />
    </div>
  </div>
);

export default AgGridTable;