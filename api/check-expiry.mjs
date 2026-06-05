export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getFirestore } = await import('firebase-admin/firestore')

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.split('\\n').join('\n'),
        }),
      })
    }

    const db = getFirestore()
    const now = new Date()
    let count = 0

    const snap = await db.collection('orders')
      .where('status', '==', 'active')
      .get()

    const batch = db.batch()

    for (const docSnap of snap.docs) {
      const order = docSnap.data()
      if (!order.expiryDate) continue

      const expiry = order.expiryDate.toDate
        ? order.expiryDate.toDate()
        : new Date(order.expiryDate)

      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

      if (daysLeft <= 3 && daysLeft > 0 && !order.expiryAlertSent) {
        const notifRef = db.collection('notifications').doc()
        batch.set(notifRef, {
          userId:    order.userId,
          type:      'alert',
          title:     `⚠️ IP Expiring in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
          message:   `Your ${order.tier?.toUpperCase()} IP in ${order.city}, ${order.country} expires soon. Renew now to avoid interruption.`,
          read:      false,
          createdAt: new Date(),
        })
        batch.update(docSnap.ref, { expiryAlertSent: true })
        count++
      }

      if (daysLeft <= 0) {
        batch.update(docSnap.ref, { status: 'expired', expiredAt: new Date() })
        const notifRef = db.collection('notifications').doc()
        batch.set(notifRef, {
          userId:    order.userId,
          type:      'alert',
          title:     '❌ IP Expired',
          message:   `Your ${order.tier?.toUpperCase()} IP in ${order.city}, ${order.country} has expired. Renew from My IPs.`,
          read:      false,
          createdAt: new Date(),
        })
        count++
      }
    }

    await batch.commit()

    return res.status(200).json({
      success:   true,
      processed: count,
      checked:   snap.size,
      message:   `Checked ${snap.size} orders, sent ${count} alerts`,
    })
  } catch (err) {
    console.error('Expiry check error:', err)
    return res.status(500).json({ error: err.message })
  }
}