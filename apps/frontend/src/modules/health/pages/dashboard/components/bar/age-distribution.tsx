import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@workspace/ui/components/chart'

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts'
import { useGetAgeDistribution } from '../../hooks/use-get-age-distribution'

export default function AgeDistribution() {
  const { data, error } = useGetAgeDistribution()

  const chartData = data?.map((item) => {
    const key =
      item.range === '<18'
        ? 'young'
        : item.range === '18-64'
          ? 'adult'
          : 'senior'
    return {
      ...item,
      fill: `var(--color-${key})`,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por edad</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="range"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="total">
              <LabelList
                position="top"
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
const chartConfig = {
  total: {
    label: 'Total',
  },
  young: {
    label: 'Menor de 18',
    color: 'var(--chart-3)',
  },
  adult: {
    label: '18 a 64',
    color: 'var(--chart-4)',
  },
  senior: {
    label: '65 y más',
    color: 'var(--chart-5)',
  },
}
