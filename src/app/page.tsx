'use client';
import { useState, useEffect } from 'react';
import { getAllJobs, Job, Operator } from '../utils/connector';
import AgGridTable from '../components/Functions/AgGridTable/AgGridTable';
// import moment from 'moment';

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [checkInStatus, setCheckInStatus] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    getAllJobs().then(setJobs);

    const stored = localStorage.getItem('checkInStatus');
    // if (stored) setCheckInStatus(JSON.parse(stored));
  }, []);

  const handleCheckInOut = (operatorId: number) => {
    const newStatus = { ...checkInStatus, [operatorId]: !checkInStatus[operatorId] };
    setCheckInStatus(newStatus);
    localStorage.setItem('checkInStatus', JSON.stringify(newStatus));
  };

  return (
    <div>
      <h1>Job Listings</h1>

      {jobs.map((job) => {
        // Ag-Grid columns for Operators
        const columnDefs = [
          { headerName: 'Full Name', field: 'fullName', flex: 1 },
          { headerName: 'Ops Completed', field: 'opsCompleted', flex: 1 },
          { headerName: 'Reliability (%)', field: 'reliability', flex: 1 },
          { headerName: 'Endorsements', field: 'endorsements', flex: 2 },
          {
            headerName: 'Check In / Out',
            field: 'checkInOut',
            flex: 1,
            cellRenderer: (params: any) => {
              const id = params.data.id;
              const checkedIn = checkInStatus[id] || false;
              return (
                <button
                  onClick={() => handleCheckInOut(id)}
                  style={{
                    backgroundColor: checkedIn ? 'green' : 'white',
                    color: checkedIn ? 'white' : 'black',
                    border: '1px solid gray',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  {checkedIn ? 'Check Out' : 'Check In'}
                </button>
              );
            },
          },
        ];

        // Map Operators to rows
        const rowData = job.operators.map((op: Operator) => ({
          id: op.id,
          fullName: `${op.firstName} ${op.lastName}`,
          opsCompleted: op.opsCompleted,
          reliability: (op.reliability * 100).toFixed(0),
          endorsements: op.endorsements.join(', '),
        }));

        return (
          <div
            key={job.opId}
            style={{
              border: '1px solid #ccc',
              margin: '1rem',
              padding: '1rem',
              borderRadius: '8px',
            }}
          >
            <h2>{job.opTitle}</h2>
            <p>
              <strong>Public ID:</strong> {job.publicId}
            </p>
            <p>
              <strong>Operators Needed:</strong> {job.filledQuantity}/{job.operatorsNeeded}
            </p>
            <p>
              {/* <strong>Time:</strong> {moment(job.startTime).format('YYYY-MM-DD HH:mm')} –{' '}
              {moment(job.endTime).format('YYYY-MM-DD HH:mm')} */}
            </p>

            <AgGridTable
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{ sortable: true, filter: true, resizable: true }}
              suppressHorizontalScroll={true}
            />
          </div>
        );
      })}
    </div>
  );
}