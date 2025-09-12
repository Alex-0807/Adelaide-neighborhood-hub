import { Suspense } from 'react';
import Dashboard from './dashboardContent';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <Dashboard />
    </Suspense>
  );
}