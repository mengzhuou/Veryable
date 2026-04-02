'use client';
import { useState, useEffect } from 'react';
import { getAllJobs, Job, Operator } from '../utils/connector';
import { Typography, Paper, Stack, Divider, CircularProgress, Autocomplete, TextField } from '@mui/material';
import { formatDateTime } from '../utils/pageUtils';
import { OPERATOR_COLUMNS, JOB_LABELS, CHECK_STATUS } from '../constants/constants';
import AgGridTable from '../components/Functions/AgGridTable/AgGridTable';
import styles from './page.module.scss';

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState<{ [key: number]: boolean }>({});
  const [searchValue, setSearchValue] = useState<any>(null);
  const [inputValue, setInputValue] = useState<string>(''); 
  
  // demo
  // const [errorMessage, setErrorMessage] = useState("Failed to load job data. Please try again.");
  const [errorMessage, setErrorMessage] = useState("");

  const searchOptions = jobs.flatMap((job) => {
    const operatorOptions = job?.operators.map((op) => ({
      type: 'operator',
      label: `${op.firstName} ${op.lastName}`,
      jobId: job?.opId,
    }));

    return [
      {
        type: 'job',
        label: job?.opTitle,
        jobId: job?.opId,
      },
      {
        type: 'publicId',
        label: job?.publicId,
        jobId: job?.opId,
      },
      ...operatorOptions,
    ];
  });

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

  const fetchAutoCompleteOptions = (event: any, value: string) => {
    setInputValue(value);
    if (!value) setSearchValue(null)
  };

  const filteredJobs = jobs
    .map((job) => {
    // user typing input value
    if (inputValue) {
      const search = inputValue.toLowerCase();

      // match job title or publicId → return full job
      if (
        job?.opTitle.toLowerCase().includes(search) ||
        job?.publicId.toLowerCase().includes(search)
      ) {
        return job;
      }

      // match operators → filter inside job
      const filteredOperators = job?.operators.filter((op) =>
        `${op.firstName} ${op.lastName}`
          .toLowerCase()
          .includes(search)
      );

      if (filteredOperators.length > 0) {
        return { ...job, operators: filteredOperators };
      }

      return null;
    }

    // selected option
    if (searchValue) {
      if (
        searchValue.type === 'job' ||
        searchValue.type === 'publicId'
      ) {
        return job?.opId === searchValue.jobId ? job : null;
      }

      if (searchValue.type === 'operator') {
        const filteredOperators = job?.operators.filter(
          (op) =>
            `${op.firstName} ${op.lastName}` === searchValue.label
        );

        if (filteredOperators.length > 0) {
          return { ...job, operators: filteredOperators };
        }
      }

      return null;
    }

    // all jobs
    return job;
  })
  .filter(Boolean);

  
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
          <Autocomplete
            className={styles.searchBar}
            options={searchOptions}
            inputValue={inputValue}
            getOptionLabel={(option) => option.label}
            onChange={(e, value) => setSearchValue(value)}
            renderInput={(params) => (
              <TextField {...params} label="Search by Operator / Op / ID" />
            )}
            onInputChange={fetchAutoCompleteOptions}
          />

          {filteredJobs.map((job) => {
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
                      {checkedIn ? CHECK_STATUS.CHECK_OUT : CHECK_STATUS.CHECK_IN}
                    </button>
                  );
                },
              },
            ];

            const rowData = job?.operators.map((op: Operator) => ({
              id: op.id,
              fullName: `${op.firstName} ${op.lastName}`,
              opsCompleted: op.opsCompleted,
              reliability: op.reliability * 100,
              endorsements: op.endorsements.join(', '),
            }));

            return (
              <Paper
                key={job?.opId}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: 'transparent',
                }}
                className={styles.jobContainer}
              >
                <Stack spacing={2}>
                  <Typography variant="h3">{job?.opTitle}</Typography>
                  <Typography variant="body2">
                    <strong>{JOB_LABELS.PUBLIC_ID}:</strong> {job?.publicId}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{JOB_LABELS.OPERATORS_NEEDED}:</strong> {job?.operatorsNeeded}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{JOB_LABELS.START_TIME}:</strong> {formatDateTime(job?.startTime ?? '')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{JOB_LABELS.END_TIME}:</strong> {formatDateTime(job?.endTime ?? '')}
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