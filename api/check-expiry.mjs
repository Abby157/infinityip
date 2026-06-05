import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { credential } from 'firebase-admin'

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

export default async function handler(req, res) {
  // Only allow GET requests from Vercel cron
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const now = new Date()
    const in3Days = new Date()
    in3Days.setDate(now.getDate() + 3)

    // Get all active orders
    const snap = await db.collection('orders')
      .where('status', '==', 'active')
      .get()

    const batch = db.batch()
    let count = 0

    for (const docSnap of snap.docs) {
      const order = docSnap.data()

      if (!order.expiryDate) continue

      const expiry = order.expiryDate.toDate
        ? order.expiryDate.toDate()
        : new Date(order.expiryDate)

      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

      // Send alert if 3 days or less remaining and not already alerted
      if (daysLeft <= 3 && daysLeft > 0 && !order.expiryAlertSent) {
        // Create notification
        const notifRef = db.collection('notifications').doc()
        batch.set(notifRef, {
          userId:    order.userId,
          type:      'alert',
          title:     `⚠️ IP Expiring in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
          message:   `Your ${order.tier?.toUpperCase()} IP in ${order.city}, ${order.country} expires on ${expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Renew now to avoid interruption.`,
          read:      false,
          createdAt: new Date(),
        })

        // Mark alert as sent
        batch.update(docSnap.ref, { expiryAlertSent: true })
        count++
      }

      // Send expired notification
      if (daysLeft <= 0 && order.status === 'active') {
        // Update order to expired
        batch.update(docSnap.ref, { status: 'expired', expiredAt: new Date() })

        // Notify user
        const notifRef = db.collection('notifications').doc()
        batch.set(notifRef, {
          userId:    order.userId,
          type:      'alert',
          title:     '❌ IP Expired',
          message:   `Your ${order.tier?.toUpperCase()} IP in ${order.city}, ${order.country} has expired. Renew it from My IPs to reactivate.`,
          read:      false,
          createdAt: new Date(),
        })
        count++
      }
    }

    await batch.commit()

    return res.status(200).json({
      success: true,
      processed: count,
      message: `Checked ${snap.size} orders, sent ${count} alerts`,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}