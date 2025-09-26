import { createFileRoute } from '@tanstack/react-router'
import Web from '@/modules/web'

export const Route = createFileRoute('/web')({
  component: Web,
})
