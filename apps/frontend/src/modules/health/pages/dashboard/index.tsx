import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import ActivityComparison from './components/bar/activity-comparison'
import AgeDistribution from './components/bar/age-distribution'
import OrganizationComparison from './components/bar/organization-comparison'
import ActivityFilter from './components/filters/activity'
import DateFilter from './components/filters/date'
import NewBeneficiaries from './components/kpi/new-beneficiaries'
import ActivityOverTime from './components/line/activities-over-time'
import RegionDistribution from './components/pie/region-distribuition'
import SexDistribution from './components/pie/sex-distribution'
import { useSyncDb } from './hooks/use-sync-db'

export default function Dashboard() {
  const { isError, error } = useSyncDb()
  if (isError)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Error al cargar los datos</EmptyTitle>
          <EmptyDescription>{String(error)}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )

  return (
    <div className="h-full p-4">
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
        <ActivityFilter />
        <DateFilter />
      </div>
      <NewBeneficiaries />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <ActivityComparison />
        <AgeDistribution />
        <SexDistribution />
        <ActivityOverTime />
        <OrganizationComparison />
        <RegionDistribution />
      </div>
    </div>
  )
}
