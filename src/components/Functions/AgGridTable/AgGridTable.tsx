// src/components/Functions/AgGridTable/AgGridTable.tsx
import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './AgGridTable.css';

// ✅ Correct import for modules
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]); // <-- note the array

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
  <div className="ag-body">
    <div className="page-container ag-theme-alpine" style={{ width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout="autoHeight"
        suppressHorizontalScroll={suppressHorizontalScroll}
        pagination={true}
        paginationPageSize={5}
      />
    </div>
  </div>
);

export default AgGridTable;