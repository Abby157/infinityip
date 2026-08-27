import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const ADMIN_EMAIL = 'davehack966@gmail.com'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uid } = req.body
  if (!uid) return res.status(400).json({ error: 'Missing uid' })

  const authHeader = req.headers.authorization || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) return res.status(401).json({ error: 'Missing auth token' })

  try {
    const decoded = await getAuth().verifyIdToken(idToken)
    if (decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    await getAuth().deleteUser(uid)
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Delete user error:', err)
    return res.status(500).json({ error: err.message })
  }
}