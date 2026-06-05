import { initializeApp, getApps, cert } from 'firebase-admin/app'

export default async function handler(req, res) {
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Firebase Admin authenticated'
    })
  } catch (err) {
    return res.status(500).json({
      error: err.message
    })
  }
}