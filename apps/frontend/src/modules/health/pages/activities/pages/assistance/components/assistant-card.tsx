import { Card, CardContent } from '@workspace/ui/components/card'

export interface Assistant {
  id: string
  name: string
  documentType: string
  documentNumber: string
}

interface AssistantCardProps {
  assistant: Assistant
  onClick?: (assistant: Assistant) => void
}

export default function AssistantCard({
  assistant,
  onClick,
}: Readonly<AssistantCardProps>) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(assistant)}
    >
      <CardContent className="p-4">
        <div className="space-y-1">
          <p className="font-medium text-lg">{assistant.name}</p>
          <p className="text-sm text-muted-foreground">
            {assistant.documentType}: {assistant.documentNumber}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
