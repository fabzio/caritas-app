import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
// import { Link } from '@tanstack/react-router'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Filter, Search } from 'lucide-react'
import { useState } from 'react'
import { ScholarshipCard } from '../../../components/scolarship-card'
import useGetScholarship from '../../../hooks/use-get-scholarship'
export default function ScholarshipPage() {
  const [nameFilter, setNameFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 3
  const { data, isLoading, isError } = useGetScholarship(
    nameFilter,
    currentPage,
    pageSize,
  )
  const scholarships = data?.data

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Becas Disponibles
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Aquí podrá visualizar las becas a las que puede postular. Seleccione
          para más detalles.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar becas ..."
            className="pl-9"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <Button variant="default" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>
      <div>
        {/* lista de becas en formato desktop y mobile(priori) */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-6" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-destructive">
              <p>Error al cargar las becas. Intente de nuevo.</p>
            </CardContent>
          </Card>
        )}
        {/* en caso no hayan becas */}
        {!isLoading && scholarships && scholarships.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p>No hay becas registradas aún.</p>
            </CardContent>
          </Card>
        )}
        {!isLoading && scholarships && scholarships.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scholarships.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                />
              ))}
            </div>
            {data && data.pageCount > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: data.pageCount },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) => Math.min(data.pageCount, p + 1))
                        }
                        className={
                          !data.hasNext
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
