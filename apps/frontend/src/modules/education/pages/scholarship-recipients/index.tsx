import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import RecipientsTable from './components/recipients-table'
import SearchRecipients from './components/search-recipients'

export default function ScholarshipRecipients() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="w-full flex gap-8">
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>Becados</CardTitle>
            <CardDescription>
              Aquí podrás visualizar a todos los alumnos becados.
            </CardDescription>
          </CardHeader>
          <div className="px-10 flex gap-4 items-center justify-between">
            <SearchRecipients />
            <Link to="/education/recipients/create">
              <Button
                className="whitespace-nowrap"
                size={isMobile ? 'sm' : 'lg'}
              >
                <PlusCircle />
                Agregar becado
              </Button>
            </Link>
          </div>
          <CardContent className="px-10">
            <RecipientsTable
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
