// src/app/page.tsx
import { getAllJobs, Job } from '../utils/connector';

export default async function Page() {
  const jobs: Job[] = await getAllJobs();

  return (
    <div>
      <h1>Job Listings</h1>
      {jobs.map((job) => (
        <div key={job.opId} style={{ border: '1px solid #ccc', margin: '1rem', padding: '1rem' }}>
          <h2>{job.opTitle}</h2>
          <p>
            <strong>Shift:</strong> {new Date(job.startTime).toLocaleString()} –{' '}
            {new Date(job.endTime).toLocaleString()}
          </p>
          <p>
            <strong>Operators Filled:</strong> {job.filledQuantity}/{job.operatorsNeeded}
          </p>
          <h3>Operators:</h3>
          <ul>
            {job.operators.map((op) => (
              <li key={op.id}>
                {op.firstName} {op.lastName} — Reliability: {op.reliability}, Ops Completed: {op.opsCompleted}
                <br />
                Endorsements: {op.endorsements.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}