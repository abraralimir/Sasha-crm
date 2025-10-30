import { OverviewChart } from '@/components/dashboard/overview-chart';
import { UsersTable } from '@/components/dashboard/users-table';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI cards can be re-added here with real data */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OverviewChart />
        <UsersTable />
      </div>
    </div>
  );
}
