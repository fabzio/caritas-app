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
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'
import { useGetByOrganization } from '../../hooks/use-get-by-organization'
export default function OrganizationComparison() {
  const { filters, setFilters } = useFilters('/_authenticated/health/')
  const { data: organizationData } = useGetByOrganization()

  const chartConfig: Record<
    string,
    {
      color: string
      label: string
    }
  > =
    organizationData?.reduce(
      (acc, item, idx) => {
        const key = String(item.organization)
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
        acc[key] = {
          color: colorVars[idx % colorVars.length],
          label: item.organization as string,
        }
        return acc
      },
      {} as Record<
        string,
        {
          label: string
          color: string
        }
      >,
    ) ?? {}
  chartConfig.attentions = { color: 'var(--chart-1)', label: 'Atenciones' }
  const chartData = organizationData?.map((item) => {
    const key = String(item.organization)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    return {
      organization: key,
      attentions: item.attentions,
      fill: `var(--color-${key})`,
    }
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cantidad de atenciones por aliado</CardTitle>
        <CardAction>
          <Select
            value={filters.allied || 'all'}
            onValueChange={(value) => {
              setFilters({
                ...filters,
                allied: value === 'all' ? undefined : value,
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por aliado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {organizationData?.map((item) => (
                <SelectItem
                  key={item.organization}
                  value={item.organization as string}
                >
                  {item.organization}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
              right: 25,
            }}
          >
            <YAxis
              dataKey="organization"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => chartConfig[value]?.label || value}
            />
            <XAxis dataKey="attentions" type="number" hide />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="attentions" radius={5}>
              <LabelList
                dataKey="attentions"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
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
