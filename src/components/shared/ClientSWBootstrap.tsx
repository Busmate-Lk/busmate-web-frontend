"use client"

import { useEffect } from 'react'
import { ensureServiceWorkerRegistered, subscribeUserToPush } from '@/lib/push/registerServiceWorker'
import { getCookie } from '@/lib/utils/cookieUtils'
import { useAuth } from '@/context/AuthContext'
import { v4 as uuidv4 } from 'uuid'

export default function ClientSWBootstrap() {
    const { isAuthenticated, isLoading, user } = useAuth()

    useEffect(() => {
        // Only register service worker on initial mount
        let cancelled = false
            ; (async () => {
                await ensureServiceWorkerRegistered()
            })()
        return () => { cancelled = true }
    }, [])

    useEffect(() => {
        // Only subscribe to push notifications after user is authenticated
        if (isLoading || !isAuthenticated || !user) return

        let cancelled = false
            ; (async () => {
                if (cancelled) return

                // Get or generate deviceId
                let deviceId = localStorage.getItem('deviceId')
                if (!deviceId) {
                    deviceId = uuidv4()
                    localStorage.setItem('deviceId', deviceId)
                }

                // Get auth token
                const token = getCookie('access_token')
                if (!token) {
                    console.warn('[ClientSWBootstrap] No auth token found, skipping push subscription')
                    return
                }

                console.log('[ClientSWBootstrap] User authenticated, subscribing to push notifications with userId:', user.id)

                // Subscribe with auth token and deviceId (which includes userId from token)
                await subscribeUserToPush(token, deviceId)
            })()

        return () => { cancelled = true }
    }, [isAuthenticated, isLoading, user])

    return null
}
