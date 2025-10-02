import authClient from '@frontend/lib/authClient'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

export const useCreateOrganization = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (params: { name: string; type: string }) =>
      authClient.organization.create({
        name: params.name,
        slug: params.name.toLowerCase().replace(/\s+/g, '-'),
        type: params.type,
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: '/organization' })
          },
        },
      }),
  })
}
