'use client'
import { Button, useTranslation } from '@payloadcms/ui'
import { useAuth } from '@payloadcms/ui/providers'
import LinkDefault from 'next/link.js'
import React, { Fragment, useEffect } from 'react'

const Link = LinkDefault.default

export const LogoutClient: React.FC<{
  adminRoute: string
  inactivity?: boolean
  redirect: string
}> = (props) => {
  const { adminRoute, inactivity, redirect } = props

  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean | undefined>(undefined)
  const { logOut } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    if (!isLoggingOut) {
      setIsLoggingOut(true)
      logOut()
    }
  }, [isLoggingOut, logOut])

  if (isLoggingOut) {
    return (
      <Fragment>
        {inactivity && <h2>{t('authentication:loggedOutInactivity')}</h2>}
        {!inactivity && <h2>{t('authentication:loggedOutSuccessfully')}</h2>}
        <Button
          Link={Link}
          buttonStyle="secondary"
          el="link"
          url={`${adminRoute}/login${
            redirect && redirect.length > 0 ? `?redirect=${encodeURIComponent(redirect)}` : ''
          }`}
        >
          {t('authentication:logBackIn')}
        </Button>
      </Fragment>
    )
  }

  // TODO(i18n): needs translation in all languages
  return <Fragment>Logging Out...</Fragment>
}
