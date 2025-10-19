"use client";
import React, { useEffect, useRef } from 'react';
import { getCookie } from '@/lib/utils/cookieUtils';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

// Lightweight global push setup executed on first client render.
const BACKEND_BASE = process.env.NEXT_PUBLIC_NOTIFICATION_MANAGEMENT_API_URL || 'http://localhost:8080';

const checkPermission = () => {
    if (!('serviceWorker' in navigator)) {
        throw new Error("No support for service worker!");
    }

    if (!('Notification' in window)) {
        throw new Error("No support for notification API");
    }

    if (!('PushManager' in window)) {
        throw new Error("No support for Push API");
    }
};

const registerSW = async () => {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

    // Proactively send backend base so SW has it even before subscribe message
    if (registration.active) {
        registration.active.postMessage({ type: 'CONFIG', backendBase: BACKEND_BASE });
    } else if (registration.installing) {
        const sw = registration.installing;
        sw.addEventListener('statechange', () => {
            if (sw.state === 'activated' && registration.active) {
                registration.active.postMessage({ type: 'CONFIG', backendBase: BACKEND_BASE });
            }
        });
    }
    return registration;
};

const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        throw new Error("Notification permission not granted");
    }
};

const subscribeWithServiceWorker = async (registration: ServiceWorkerRegistration, authToken: string | null, deviceId: string) => {
    // Wait for service worker to be active
    if (!registration.active) {
        await new Promise((resolve) => {
            const checkActive = () => {
                if (registration.active) {
                    resolve(registration.active);
                } else {
                    setTimeout(checkActive, 100);
                }
            };
            checkActive();
        });
    }

    // Send SUBSCRIBE message to service worker with token and deviceId
    const channel = new MessageChannel();

    registration.active!.postMessage(
        { type: 'SUBSCRIBE', authToken, deviceId, backendBase: BACKEND_BASE },
        [channel.port2]
    );

    // Listen for response from service worker
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Service worker subscription timeout'));
        }, 10000); // 10 second timeout

        channel.port1.onmessage = (event) => {
            clearTimeout(timeout);
            if (event.data.success) {
                console.log('[PushInitializer] Subscription successful:', event.data.data);
                // Store subscriptionId in localStorage for unsubscribing
                if (event.data.data.subscriptionId) {
                    localStorage.setItem('pushSubscriptionId', event.data.data.subscriptionId);
                }
                resolve(event.data.data);
            } else {
                console.error('[PushInitializer] Subscription failed:', event.data.error);
                reject(new Error(event.data.error));
            }
        };
    });
};

const PushInitializer: React.FC = () => {
    const started = useRef(false);
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        // Run only after auth check completed and user is authenticated
        if (isLoading || !isAuthenticated || started.current) return;
        started.current = true;

        (async () => {
            if (typeof window === 'undefined') return;

            try {
                checkPermission();

                // Get or generate deviceId
                let deviceId = localStorage.getItem('deviceId');
                if (!deviceId) {
                    deviceId = uuidv4();
                    localStorage.setItem('deviceId', deviceId);
                }
                console.log('[PushInitializer] Device ID:', deviceId);

                // Check for existing subscription
                const registration = await registerSW();
                await navigator.serviceWorker.ready;
                const existingSubscription = await registration.pushManager.getSubscription();

                if (existingSubscription) {
                    console.log('[PushInitializer] Existing subscription found:', existingSubscription);
                    // Send existing subscription with deviceId to ensure it's associated with the user
                    const authToken = getCookie('access_token');
                    if (!authToken) {
                        console.warn('[PushInitializer] No auth token found even though user is authenticated – aborting push subscription');
                        return;
                    }
                    await subscribeWithServiceWorker(registration, authToken, deviceId);
                    return;
                }

                // Ask for permission only if no existing subscription
                if (Notification.permission === 'default') {
                    await requestNotificationPermission();
                }

                if (Notification.permission !== 'granted') {
                    console.warn('[PushInitializer] Notification permission not granted after login');
                    return;
                }

                const authToken = getCookie('access_token');
                if (!authToken) {
                    console.warn('[PushInitializer] No auth token found even though user is authenticated – aborting push subscription');
                    return;
                }
                console.log('[PushInitializer] Retrieved token from cookie: token provided (' + authToken.substring(0, 20) + '...)');

                // Unsubscribe any old subscription before creating a new one
                const oldSubscriptionId = localStorage.getItem('pushSubscriptionId');
                if (oldSubscriptionId) {
                    try {
                        const channel = new MessageChannel();
                        registration.active!.postMessage(
                            { type: 'UNSUBSCRIBE', subscriptionId: oldSubscriptionId },
                            [channel.port2]
                        );
                        await new Promise<void>((resolve, reject) => {
                            channel.port1.onmessage = (event) => {
                                if (event.data.success) {
                                    console.log('[PushInitializer] Unsubscribed old subscription:', oldSubscriptionId);
                                    localStorage.removeItem('pushSubscriptionId');
                                    resolve();
                                } else {
                                    console.error('[PushInitializer] Failed to unsubscribe old subscription:', event.data.error);
                                    reject(new Error(event.data.error));
                                }
                            };
                        });
                    } catch (error) {
                        console.warn('[PushInitializer] Error unsubscribing old subscription, proceeding with new subscription:', error);
                    }
                }

                // Create new subscription
                await subscribeWithServiceWorker(registration, authToken, deviceId);
            } catch (error) {
                console.error('[PushInitializer] Error in push initialization (post-login):', error);
                // Allow retry if user refreshes or re-authenticates
                started.current = false;
            }
        })();
    }, [isAuthenticated, isLoading]);

    return null; // no UI
};

export default PushInitializer;