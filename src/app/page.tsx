'use client';
import { useState, useEffect } from 'react';
import { getAllJobs, Job, Operator } from '../utils/connector';
import { Typography, Paper, Stack, Divider, CircularProgress } from '@mui/material';
import { formatDateTime } from '../utils/pageUtils';
import { OPERATOR_COLUMNS, JOB_LABELS } from '../constants/constants';
import AgGridTable from '../components/Functions/AgGridTable/AgGridTable';
import styles from './page.module.scss';

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [checkInStatus, setCheckInStatus] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  // const [errorMessage, setErrorMessage] = useState("Failed to load job data. Please try again.");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem('checkInStatus');
    // if (stored) setCheckInStatus(JSON.parse(stored));

    setTimeout(() => {
      getAllJobs()
        .then((data) => {
          if (!data || data.length === 0) {
            setErrorMessage("No jobs available.");
          } else {
            setJobs(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setErrorMessage("Failed to load job data. Please try again.");
          setLoading(false);
        });
    }, 1000);
  }, []);

  const handleCheckInOut = (operatorId: number) => {
    const newStatus = { ...checkInStatus, [operatorId]: !checkInStatus[operatorId] };
    setCheckInStatus(newStatus);
    localStorage.setItem('checkInStatus', JSON.stringify(newStatus));
  };

  return (
    <div className={styles.pageContainer}>
      <Typography variant="h1">Job Listings</Typography>

      {loading && (
        <div className={styles.loadingWrapper}>
          <CircularProgress className={styles.loadingIcon} size={60} />
        </div>
      )}

      {!loading && errorMessage && (
        <Typography variant="h3" color="error" sx={{ mt: 4, textAlign: 'left' }}>
          {errorMessage}
        </Typography>
      )}

      {!loading && !errorMessage && jobs.length > 0 && (
        <>
          {jobs.map((job) => {
            const columnDefs = [
              { headerName: OPERATOR_COLUMNS.NAME, field: 'fullName', flex: 1 },
              { headerName: OPERATOR_COLUMNS.OPS_COMPLETED, field: 'opsCompleted', flex: 1 },
              { headerName: OPERATOR_COLUMNS.RELIABILITY, field: 'reliability', flex: 1 },
              { headerName: OPERATOR_COLUMNS.ENDORSEMENTS, field: 'endorsements', flex: 2 },
              {
                headerName: OPERATOR_COLUMNS.CHECK_IN_OUT,
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
                  <Typography variant="body2">
                    <strong>{JOB_LABELS.PUBLIC_ID}:</strong> {job.publicId}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{JOB_LABELS.OPERATORS_NEEDED}:</strong> {job.operatorsNeeded}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{JOB_LABELS.START_TIME}:</strong> {formatDateTime(job.startTime)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{JOB_LABELS.END_TIME}:</strong> {formatDateTime(job.endTime)}
                  </Typography>
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
        </>
      )}
    </div>
  );
}