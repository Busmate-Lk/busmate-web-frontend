"use client"

import { useEffect } from 'react'
import { ensureServiceWorkerRegistered, subscribeUserToPush } from '@/lib/push/registerServiceWorker'
import { getCookie } from '@/lib/utils/cookieUtils'

export default function ClientSWBootstrap() {
    useEffect(() => {
        let cancelled = false
            ; (async () => {
                const reg = await ensureServiceWorkerRegistered()
                if (cancelled || !reg) return
                // Subscribe with auth token if available
                const token = getCookie('access_token') || undefined
                await subscribeUserToPush(token)
            })()
        return () => { cancelled = true }
    }, [])
    return null
}
