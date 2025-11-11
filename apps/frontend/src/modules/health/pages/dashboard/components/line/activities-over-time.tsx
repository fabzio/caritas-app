import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from 'recharts'
import { useGetActivitiesByTime } from '../../hooks/use-get-activities-by-time'

export default function ActivityOverTime() {
  const [granularity, setGranularity] = useState<string>('week')
  const { data: activities } = useGetActivitiesByTime(
    granularity as 'week' | 'month' | 'quarter' | 'year',
  )
  const chartConfig = {
    talks: {
      label: 'Charlas',
      color: 'var(--chart-4)',
    },
    campaigns: {
      label: 'Campañas',
      color: 'var(--chart-5)',
    },
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cantidad de actividades a lo largo del tiempo</CardTitle>
        <CardAction>
          <Select value={granularity} onValueChange={setGranularity}>
            <SelectTrigger>
              <SelectValue placeholder="Granularidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Año</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={activities}
            margin={{
              left: 25,
              right: 25,
              top: 16,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              dataKey="talks"
              type="natural"
              strokeWidth={2}
              stroke="var(--color-talks)"
              fill="var(--color-talks)"
            />
            <Area
              dataKey="campaigns"
              type="natural"
              strokeWidth={2}
              fill="var(--color-campaigns)"
              stroke="var(--color-campaigns)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
