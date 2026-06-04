export const TIERS = {
  low: {
    id: 'low', label: 'Low', price: 220,
    color: '#6b7280', accent: '#9ca3af',
    trustScore: '55–65', latency: '80–150ms', uptime: '94%',
    features: ['Residential IP', 'Monthly rotation', 'Basic support'],
  },
  standard: {
    id: 'standard', label: 'Standard', price: 280,
    color: '#3b82f6', accent: '#60a5fa',
    trustScore: '66–75', latency: '50–90ms', uptime: '97%',
    features: ['Residential IP', 'Bi-weekly rotation', 'Priority support', 'Dashboard analytics'],
  },
  strong: {
    id: 'strong', label: 'Strong', price: 350,
    color: '#8b5cf6', accent: '#a78bfa',
    trustScore: '76–87', latency: '25–55ms', uptime: '98.5%',
    features: ['Premium residential', 'Weekly rotation', '24/7 support', 'Full analytics', 'IP health alerts'],
  },
  elite: {
    id: 'elite', label: 'Elite', price: 500,
    color: '#f59e0b', accent: '#fbbf24',
    trustScore: '88–99', latency: '10–30ms', uptime: '99.9%',
    features: ['Elite residential', 'On-demand rotation', 'Dedicated support', 'Full analytics', 'SLA guarantee', 'Custom config'],
  },
}

export const IP_TYPES = [
  { id: 'residential', label: 'Residential', icon: '🏠' },
  { id: 'mobile', label: 'Mobile', icon: '📱' },
  { id: 'datacenter', label: 'Datacenter', icon: '🖥️' },
  { id: 'isp', label: 'ISP', icon: '🌐' },
]

export const MARKETPLACE_LISTINGS = [
  { id: 'us-ny-res-elite', country: 'United States', countryCode: 'US', region: 'North America', city: 'New York', ipType: 'residential', tier: 'elite', available: 12, total: 50, featured: true },
  { id: 'us-la-res-strong', country: 'United States', countryCode: 'US', region: 'North America', city: 'Los Angeles', ipType: 'residential', tier: 'strong', available: 27, total: 80, featured: false },
  { id: 'us-chi-mob-standard', country: 'United States', countryCode: 'US', region: 'North America', city: 'Chicago', ipType: 'mobile', tier: 'standard', available: 43, total: 100, featured: false },
  { id: 'us-mia-isp-low', country: 'United States', countryCode: 'US', region: 'North America', city: 'Miami', ipType: 'isp', tier: 'low', available: 88, total: 150, featured: false },
  { id: 'us-sf-dc-elite', country: 'United States', countryCode: 'US', region: 'North America', city: 'San Francisco', ipType: 'datacenter', tier: 'elite', available: 5, total: 30, featured: true },
  { id: 'uk-lon-res-elite', country: 'United Kingdom', countryCode: 'GB', region: 'Europe', city: 'London', ipType: 'residential', tier: 'elite', available: 9, total: 40, featured: true },
  { id: 'uk-man-res-strong', country: 'United Kingdom', countryCode: 'GB', region: 'Europe', city: 'Manchester', ipType: 'residential', tier: 'strong', available: 31, total: 60, featured: false },
  { id: 'de-ber-res-strong', country: 'Germany', countryCode: 'DE', region: 'Europe', city: 'Berlin', ipType: 'residential', tier: 'strong', available: 19, total: 70, featured: false },
  { id: 'de-mun-dc-standard', country: 'Germany', countryCode: 'DE', region: 'Europe', city: 'Munich', ipType: 'datacenter', tier: 'standard', available: 54, total: 90, featured: false },
  { id: 'fr-par-res-elite', country: 'France', countryCode: 'FR', region: 'Europe', city: 'Paris', ipType: 'residential', tier: 'elite', available: 7, total: 35, featured: true },
  { id: 'nl-ams-dc-strong', country: 'Netherlands', countryCode: 'NL', region: 'Europe', city: 'Amsterdam', ipType: 'datacenter', tier: 'strong', available: 22, total: 60, featured: false },
  { id: 'nl-ams-res-standard', country: 'Netherlands', countryCode: 'NL', region: 'Europe', city: 'Amsterdam', ipType: 'residential', tier: 'standard', available: 67, total: 120, featured: false },
  { id: 'ca-tor-res-strong', country: 'Canada', countryCode: 'CA', region: 'North America', city: 'Toronto', ipType: 'residential', tier: 'strong', available: 38, total: 80, featured: false },
  { id: 'ca-van-mob-standard', country: 'Canada', countryCode: 'CA', region: 'North America', city: 'Vancouver', ipType: 'mobile', tier: 'standard', available: 51, total: 90, featured: false },
  { id: 'jp-tok-res-elite', country: 'Japan', countryCode: 'JP', region: 'Asia Pacific', city: 'Tokyo', ipType: 'residential', tier: 'elite', available: 6, total: 25, featured: true },
  { id: 'jp-osa-isp-strong', country: 'Japan', countryCode: 'JP', region: 'Asia Pacific', city: 'Osaka', ipType: 'isp', tier: 'strong', available: 14, total: 45, featured: false },
  { id: 'sg-sin-dc-elite', country: 'Singapore', countryCode: 'SG', region: 'Asia Pacific', city: 'Singapore', ipType: 'datacenter', tier: 'elite', available: 11, total: 40, featured: true },
  { id: 'sg-sin-res-standard', country: 'Singapore', countryCode: 'SG', region: 'Asia Pacific', city: 'Singapore', ipType: 'residential', tier: 'standard', available: 44, total: 80, featured: false },
  { id: 'au-syd-res-strong', country: 'Australia', countryCode: 'AU', region: 'Asia Pacific', city: 'Sydney', ipType: 'residential', tier: 'strong', available: 29, total: 65, featured: false },
  { id: 'au-mel-mob-standard', country: 'Australia', countryCode: 'AU', region: 'Asia Pacific', city: 'Melbourne', ipType: 'mobile', tier: 'standard', available: 36, total: 70, featured: false },
  { id: 'br-sao-res-standard', country: 'Brazil', countryCode: 'BR', region: 'South America', city: 'São Paulo', ipType: 'residential', tier: 'standard', available: 72, total: 130, featured: false },
  { id: 'br-rio-mob-low', country: 'Brazil', countryCode: 'BR', region: 'South America', city: 'Rio de Janeiro', ipType: 'mobile', tier: 'low', available: 91, total: 160, featured: false },
  { id: 'za-joh-res-standard', country: 'South Africa', countryCode: 'ZA', region: 'Africa', city: 'Johannesburg', ipType: 'residential', tier: 'standard', available: 48, total: 90, featured: false },
  { id: 'ae-dub-res-elite', country: 'UAE', countryCode: 'AE', region: 'Middle East', city: 'Dubai', ipType: 'residential', tier: 'elite', available: 8, total: 30, featured: true },
  { id: 'ae-dub-dc-strong', country: 'UAE', countryCode: 'AE', region: 'Middle East', city: 'Dubai', ipType: 'datacenter', tier: 'strong', available: 17, total: 50, featured: false },
  { id: 'in-mum-res-low', country: 'India', countryCode: 'IN', region: 'Asia Pacific', city: 'Mumbai', ipType: 'residential', tier: 'low', available: 103, total: 200, featured: false },
  { id: 'in-ban-mob-standard', country: 'India', countryCode: 'IN', region: 'Asia Pacific', city: 'Bangalore', ipType: 'mobile', tier: 'standard', available: 59, total: 110, featured: false },
  { id: 'kr-seo-res-elite', country: 'South Korea', countryCode: 'KR', region: 'Asia Pacific', city: 'Seoul', ipType: 'residential', tier: 'elite', available: 4, total: 20, featured: true },
  { id: 'se-sto-res-strong', country: 'Sweden', countryCode: 'SE', region: 'Europe', city: 'Stockholm', ipType: 'residential', tier: 'strong', available: 23, total: 55, featured: false },
]

export const REGIONS = [...new Set(MARKETPLACE_LISTINGS.map(l => l.region))].sort()
export const TIER_ORDER = ['low', 'standard', 'strong', 'elite']