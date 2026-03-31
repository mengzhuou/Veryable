'use client';
import { useState, useEffect } from 'react';
import { getAllJobs, Job, Operator } from '../utils/connector';
import AgGridTable from '../components/Functions/AgGridTable/AgGridTable';
import styles from './page.module.scss';

import { Typography, Paper, Stack, Divider } from '@mui/material';



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

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Job Listings</h1>

      {jobs.map((job) => {
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
                  className={`${styles.checkInButton} ${checkedIn ? 'checkedIn' : 'checkedOut'}`}
                  onClick={() => handleCheckInOut(id)}
                >
                  {checkedIn ? 'Check Out' : 'Check In'}
                </button>
              );
            },
          },
        ];

        const rowData = job.operators.map((op: Operator) => ({
          id: op.id,
          fullName: `${op.firstName} ${op.lastName}`,
          opsCompleted: op.opsCompleted,
          reliability: (op.reliability * 100).toFixed(0),
          endorsements: op.endorsements.join(', '),
        }));
        

        return (
          <Paper key={job.opId} sx={{ p: 2, mb: 2 }} className={styles.jobContainer}>
            <Stack spacing={2}>
              <Typography variant="h3">{job.opTitle}</Typography>
              <Typography variant="body1"><strong>Public ID:</strong> {job.publicId}</Typography>
              <Typography variant="body1"><strong>Operators Needed:</strong> {job.operatorsNeeded}</Typography>
              <Typography variant="body2"><strong>Start Time:</strong> {formatDateTime(job.startTime)}</Typography>
              <Typography variant="body2"><strong>End Time:</strong> {formatDateTime(job.endTime)}</Typography>
              <Divider />
            </Stack>
            <AgGridTable
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{ sortable: true, resizable: true }}
              suppressHorizontalScroll={true}
            />
          </Paper>
        );
      })}
    </div>
  );
}