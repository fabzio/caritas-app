import { useFilters } from '@frontend/hooks/use-filters'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@workspace/ui/components/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Pie, PieChart } from 'recharts'
import { useGetSexDistribution } from '../../hooks/use-sex-distribution'

export default function SexDistribution() {
  const { filters, setFilters } = useFilters('/_authenticated/health/')
  const { data } = useGetSexDistribution()

  const chartConfig: Record<
    string,
    {
      label: string
      color?: string
    }
  > =
    data?.reduce(
      (acc, item) => {
        acc[item.sex] = {
          label: item.sex === 'M' ? 'Hombre' : 'Mujer',
          color:
            item.sex === 'M'
              ? '#9dcaeb'
              : item.sex === 'F'
                ? '#ff91ae'
                : '#a1a1aa',
        }
        return acc
      },
      {} as Record<
        string,
        {
          label: string
          color?: string
        }
      >,
    ) || {}
  chartConfig.total = { label: 'Total' }

  const chartData =
    data?.map((item) => ({
      ...item,
      fill: `var(--color-${item.sex})`,
    })) || []
  const total = data?.reduce((sum, item) => sum + item.total, 0) || 0
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por sexo</CardTitle>
        <CardAction>
          <Select
            value={filters.sex || 'all'}
            onValueChange={(value) => {
              setFilters({
                ...filters,
                sex: value === 'all' ? undefined : (value as 'M' | 'F'),
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="M">Hombres</SelectItem>
              <SelectItem value="F">Mujeres</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="sex"
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
                    {' '}
                    <tspan>{payload.sex === 'M' ? 'Hombres' : 'Mujeres'}</tspan>
                    <tspan>{': '}</tspan>
                    <tspan>
                      {total === 0
                        ? '0%'
                        : `${Math.round((payload.total / total) * 100)}%`}
                    </tspan>
                  </text>
                )
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
