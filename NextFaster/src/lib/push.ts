/**
 * Web Push Notification sender
 * Uses the Web Push Protocol (RFC 8030) with VAPID authentication.
 */

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * Send a push notification to a single subscription.
 * Returns true on success, false if the subscription is expired/invalid.
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload,
): Promise<boolean> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@souqflow.com';

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('[Push] VAPID keys not configured — skipping push notification');
    return false;
  }

  try {
    // Dynamically import web-push to avoid issues during build
    const webpush = await import('web-push');
    webpush.default.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    await webpush.default.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload),
    );
    return true;
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410 || status === 404) {
      // Subscription expired — caller should delete it
      return false;
    }
    console.error('[Push] Failed to send notification:', err);
    return false;
  }
}

/**
 * Send push notifications to multiple subscriptions.
 * Returns the endpoints of expired/invalid subscriptions to be deleted.
 */
export async function sendPushToMany(
  subscriptions: PushSubscriptionData[],
  payload: PushPayload,
): Promise<string[]> {
  const expiredEndpoints: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const ok = await sendPushNotification(sub, payload);
      if (!ok) expiredEndpoints.push(sub.endpoint);
    }),
  );

  return expiredEndpoints;
}
