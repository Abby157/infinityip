export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }
  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getFirestore }                 = await import('firebase-admin/firestore')

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    }

    const db  = getFirestore()
    const now = new Date()
    let count = 0

    const snap = await db.collection('orders').where('status', '==', 'active').get()
    const batch = db.batch()

    for (const docSnap of snap.docs) {
      const order = docSnap.data()
      if (!order.expiryDate) continue

      const expiry   = order.expiryDate.toDate ? order.expiryDate.toDate() : new Date(order.expiryDate)
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

      const alertsSent = order.expiryAlertsSent || []

      // Send alerts at 7 days, 3 days, and 1 day
      const alertDays = [7, 3, 1]

      for (const day of alertDays) {
        if (daysLeft === day && !alertsSent.includes(day)) {

          // In-app notification
          const notifRef = db.collection('notifications').doc()
          batch.set(notifRef, {
            userId:    order.userId,
            type:      'alert',
            title:     `⚠️ IP Expiring in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
            message:   `Your ${order.tier?.toUpperCase()} IP in ${order.city}, ${order.country} expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Renew now to avoid interruption.`,
            read:      false,
            createdAt: new Date(),
          })

          // Mark this day's alert as sent
          batch.update(docSnap.ref, {
            expiryAlertsSent:  [...alertsSent, day],
            expiryAlertSent:   true,
          })

          // Send expiry warning email
          try {
            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                service_id:  'service_hlb446o',
                template_id: 'template_qyd1v3c',
                user_id:     't8kS5uait_n1Z8x-i',
                template_params: {
                  to_email: order.userEmail,
                  subject:  `⚠️ Your IP expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''} — Infinity IP`,
                  message:  `Hi ${order.userEmail?.split('@')[0]},\n\nYour ${order.tier?.toUpperCase()} IP in ${order.city}, ${order.country} is expiring in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.\n\n🌐 IP Address: ${order.ipAddress}\n📅 Expiry Date: ${expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n⏳ Days Remaining: ${daysLeft}\n\nPlease renew your IP from the My IPs section to avoid interruption.\n\nBest regards,\nInfinity IP Team`,
                },
              }),
            })
          } catch (emailErr) {
            console.error('Expiry email failed:', emailErr)
          }

          count++
        }
      }

      // Handle expired orders
      if (daysLeft <= 0) {
        batch.update(docSnap.ref, {
          status:    'expired',
          expiredAt: new Date(),
        })

        const notifRef = db.collection('notifications').doc()
        batch.set(notifRef, {
          userId:    order.userId,
          type:      'alert',
          title:     '❌ IP Expired',
          message:   `Your ${order.tier?.toUpperCase()} IP in ${order.city}, ${order.country} has expired. Renew from My IPs.`,
          read:      false,
          createdAt: new Date(),
        })

        // Send expired email
        try {
          await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id:  'service_hlb446o',
              template_id: 'template_qyd1v3c',
              user_id:     't8kS5uait_n1Z8x-i',
              template_params: {
                to_email: order.userEmail,
                subject:  '❌ Your IP has expired — Infinity IP',
                message:  `Hi ${order.userEmail?.split('@')[0]},\n\nYour ${order.tier?.toUpperCase()} IP in ${order.city}, ${order.country} has expired.\n\n🌐 IP Address: ${order.ipAddress}\n\nYou can renew your IP from the My IPs section in your dashboard.\n\nBest regards,\nInfinity IP Team`,
              },
            }),
          })
        } catch (emailErr) {
          console.error('Expired email failed:', emailErr)
        }

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
    return res.status(500).json({
      error: err.message,
      code:  err.code || null,
    })
  }
}