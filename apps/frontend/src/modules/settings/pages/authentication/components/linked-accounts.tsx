import { useLinkGoogle } from '@frontend/modules/settings/hooks/use-link-google'
import { useLinkedAccounts } from '@frontend/modules/settings/hooks/use-linked-accounts'
import GoogleButton from '@frontend/shared/components/google-button'

export default function LinkedAccounts() {
  const { data: linkedAccounts } = useLinkedAccounts()
  const { mutate } = useLinkGoogle()
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
