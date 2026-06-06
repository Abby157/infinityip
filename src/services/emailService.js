import emailjs from '@emailjs/browser'

emailjs.init('t8kS5uait_n1Z8x-i')

const SERVICE_ID  = 'service_hlb446o'
const PUBLIC_KEY  = 't8kS5uait_n1Z8x-i'
const TEMPLATE_ID = 'template_qyd1v3c'

const send = async (params) => {
  try {
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY)
    return result
  } catch (err) {
    console.error('EmailJS error:', err)
    throw err
  }
}

// Payment received — user submitted payment
export const sendPaymentReceivedEmail = async ({ toEmail, toName, amount, tier, city }) => {
  return send({
    to_email: toEmail,
    to_name:  toName || toEmail.split('@')[0],
    subject:  'Payment Received — Infinity IP',
    message:  `Hi ${toName || 'there'},\n\nWe have received your payment of $${amount} for your ${tier?.toUpperCase()} IP in ${city}.\n\nOur team will verify your payment within 1–24 hours. You will receive another email once your IP is activated.\n\nThank you for choosing Infinity IP.\n\nBest regards,\nInfinity IP Team`,
  })
}

// IP approved — IP is now active
export const sendIPApprovedEmail = async ({ toEmail, toName, ipAddress, city, country, tier, expiryDate }) => {
  return send({
    to_email: toEmail,
    to_name:  toName || toEmail.split('@')[0],
    subject:  '✅ Your IP is Now Active — Infinity IP',
    message:  `Hi ${toName || 'there'},\n\nGreat news! Your ${tier?.toUpperCase()} IP in ${city}, ${country} has been activated.\n\n🌐 IP Address: ${ipAddress}\n📅 Expires: ${expiryDate}\n\nYou can view and manage your IP from the My IPs section in your dashboard.\n\nBest regards,\nInfinity IP Team`,
  })
}

// IP rejected
export const sendIPRejectedEmail = async ({ toEmail, toName, city, country, reason }) => {
  return send({
    to_email: toEmail,
    to_name:  toName || toEmail.split('@')[0],
    subject:  '❌ Payment Rejected — Infinity IP',
    message:  `Hi ${toName || 'there'},\n\nUnfortunately your payment for ${city}, ${country} has been rejected.\n\nReason: ${reason || 'Payment could not be verified.'}\n\nPlease contact our support team if you believe this is an error or if you need assistance.\n\nBest regards,\nInfinity IP Team`,
  })
}

// IP expiring soon
export const sendIPExpiryEmail = async ({ toEmail, toName, ipAddress, city, country, tier, expiryDate, daysLeft }) => {
  return send({
    to_email: toEmail,
    to_name:  toName || toEmail.split('@')[0],
    subject:  `⚠️ Your IP Expires in ${daysLeft} Day${daysLeft > 1 ? 's' : ''} — Infinity IP`,
    message:  `Hi ${toName || 'there'},\n\nYour ${tier?.toUpperCase()} IP in ${city}, ${country} is expiring soon.\n\n🌐 IP Address: ${ipAddress}\n📅 Expiry Date: ${expiryDate}\n⏳ Days Remaining: ${daysLeft}\n\nPlease renew your IP from the My IPs section to avoid interruption.\n\nBest regards,\nInfinity IP Team`,
  })
}

// Welcome email on signup
export const sendWelcomeEmail = async ({ toEmail, toName }) => {
  return send({
    to_email: toEmail,
    to_name:  toName || toEmail.split('@')[0],
    subject:  '👋 Welcome to Infinity IP',
    message:  `Hi ${toName || 'there'},\n\nWelcome to Infinity IP! Your account has been created successfully.\n\nYou now have access to 29+ premium IP locations across 15 countries worldwide.\n\n🌐 Browse the Marketplace to get your first IP\n💳 Pay with Crypto or Gift Cards\n📡 Get your IP activated within 24 hours\n\nIf you have any questions, our support team is always ready to help.\n\nBest regards,\nInfinity IP Team`,
  })
}

// Newsletter — sent to all users from admin
export const sendNewsletterEmail = async ({ toEmail, toName, subject, message }) => {
  return send({
    to_email: toEmail,
    to_name:  toName || toEmail.split('@')[0],
    subject,
    message,
  })
}