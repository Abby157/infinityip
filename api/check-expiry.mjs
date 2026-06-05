export default async function handler(req, res) {
  return res.status(200).json({
    projectId: process.env.FIREBASE_PROJECT_ID || 'missing',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'missing',
    privateKeyExists: !!process.env.FIREBASE_PRIVATE_KEY,
  })
}