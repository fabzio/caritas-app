import { useGetAttentions } from './hooks/use-get-attentions'

export default function Dashboard() {
  const { data, error } = useGetAttentions()
  console.log({ data, error })
  return <div>Dashboard</div>
}
