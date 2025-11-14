import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import { Bar, BarChart, CartesianGrid, LabelList, Text, XAxis } from 'recharts'
import { useActivityComparison } from '../../hooks/use-activity-comparison'

export default function ActivityComparison() {
  const [groupby, setGroupby] = useState<string | undefined>('speciality')
  const { data } = useActivityComparison(
    groupby as 'speciality' | 'organization' | undefined,
  )
  const groupedBar = groupby
    ? Object.keys(data?.[0] || {}).filter((key) => key !== 'activity')
    : []
  const chartConfig = {
    total: { label: 'Total' },
    ...groupedBar.reduce(
      (acc, key, idx) => {
        acc[key] = {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          color: colorVars[idx % colorVars.length],
        }
        return acc
      },
      {} as Record<string, { label: string; color: string }>,
    ),
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atenciones por actividad</CardTitle>
        <CardAction>
          <Select
            value={groupby}
            onValueChange={(val) =>
              setGroupby(val === 'none' ? undefined : val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Agrupar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguno</SelectItem>
              <SelectItem value="speciality">Especialidad</SelectItem>
              <SelectItem value="organization">Organización</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, bottom: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="activity"
              tickFormatter={(val) => `${val.slice(0, 20)}...`}
              tickLine={false}
              tickMargin={10}
              angle={-10}
              axisLine={false}
            />
            {groupby === undefined ? (
              <Bar dataKey="total" fill="var(--chart-1)">
                <LabelList position="top" offset={8} fontSize={12} />
              </Bar>
            ) : (
              groupedBar.map((key) => (
                <Bar key={key} dataKey={key} fill={chartConfig[key].color}>
                  <LabelList
                    dataKey={key}
                    position="top"
                    offset={8}
                    fontSize={12}
                  />
                </Bar>
              ))
            )}

            <ChartLegend
              content={<ChartLegendContent payload={{}} />}
              wrapperStyle={{
                overflow: 'auto',
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
