import GoogleButton from '@/modules/auth/components/google-button'
import { useLinkGoogle } from '@/modules/settings/hooks/use-link-google'
import { useLinkedAccounts } from '@/modules/settings/hooks/use-linked-accounts'

export default function LinkedAccounts() {
  const { data: linkedAccounts } = useLinkedAccounts()
  const { mutate } = useLinkGoogle()
  console.log({ linkedAccounts })
  return (
    <div className="my-4">
      {linkedAccounts?.some((ac) => ac.providerId === 'google') ? (
        <GoogleButton
          className="w-fit"
          buttonText="Cuenta de Google Vinculada"
          disabled
        />
      ) : (
        <GoogleButton
          className="w-fit"
          buttonText="Vincular Cuenta de Google"
          onClick={() => mutate()}
        />
      )}
    </div>
  )
}
