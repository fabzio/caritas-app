import { useFilters } from '@frontend/hooks/use-filters'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { ChartContainer, ChartTooltip } from '@workspace/ui/components/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Pie, PieChart } from 'recharts'
import { useRegionDistribution } from '../../hooks/use-region-distribution'

export default function RegionDistribution() {
  const { filters, setFilters } = useFilters('/_authenticated/health/')
  const { data } = useRegionDistribution()
  const chartConfig = {
    total: {
      label: 'Total',
    },
    ...(data?.reduce(
      (acc, item) => {
        acc[item.region?.replaceAll(' ', '_') as string] = {
          color: colorVars[Object.keys(acc).length % colorVars.length],
          label: item.region as string,
        }
        return acc
      },
      {} as Record<string, { color: string; label: string }>,
    ) || {}),
  }
  const chartData =
    data?.map((item) => ({
      ...item,
      fill: `var(--color-${item.region?.replaceAll(' ', '_')})`,
    })) || []
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividades por región</CardTitle>
        <CardAction>
          <Select
            value={filters.region || 'all'}
            onValueChange={(value) => {
              setFilters({
                ...filters,
                region: value === 'all' ? undefined : value,
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por región" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {data?.map((item) => (
                <SelectItem key={item.region} value={item.region as string}>
                  {item.region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart
            margin={{
              top: 20,
            }}
          >
            <ChartTooltip />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="region"
              innerRadius={60}
              label={({ payload, ...props }) => {
                return (
                  <text
                    cx={props.cx}
                    cy={props.cy}
                    x={props.x}
                    y={props.y}
                    textAnchor={props.textAnchor}
                    dominantBaseline={props.dominantBaseline}
                    fill="var(--foreground)"
                  >
                    <tspan className="text-foreground">{payload.region}</tspan>
                    <tspan>{': '}</tspan>
                    <tspan>{payload.total}</tspan>
                  </text>
                )
              }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const colorVars = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]
