'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const verifySession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        console.error('Errore durante la verifica della sessione:', error)
        router.push('/login')
        return
      }

      const userEmail = data.session.user.email

      try {
        const res = await fetch('/api/updateEmailStatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }),
        })

        if (!res.ok) {
          throw new Error('Errore nell\'aggiornamento del database')
        }
      } catch (err) {
        console.error('Errore API update-email-status:', err)
      }

      router.push('/dashboard') // o la pagina che preferisci
    }

    verifySession()
  }, [router])

  return <p>Verifica in corso...</p>
}
