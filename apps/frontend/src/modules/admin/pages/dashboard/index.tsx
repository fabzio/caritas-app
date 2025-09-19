import { useOrganization } from './hooks/use-organization'

export default function Dashboard() {
  const { data } = useOrganization()
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
