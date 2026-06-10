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
  { id: 'mobile',      label: 'Mobile',      icon: '📱' },
  { id: 'datacenter',  label: 'Datacenter',  icon: '🖥️' },
  { id: 'isp',         label: 'ISP',         icon: '🌐' },
]

export const MARKETPLACE_LISTINGS = [
  // ── North America ──────────────────────────────────────────────
  { id: 'us-ny-res-elite',    country: 'United States', countryCode: 'US', region: 'North America',  city: 'New York',       ipType: 'residential', tier: 'elite',    available: 12,  total: 50,  featured: true  },
  { id: 'us-la-mob-low',      country: 'United States', countryCode: 'US', region: 'North America',  city: 'Los Angeles',    ipType: 'mobile',      tier: 'low',      available: 88,  total: 150, featured: false },
  { id: 'us-chi-res-strong',  country: 'United States', countryCode: 'US', region: 'North America',  city: 'Chicago',        ipType: 'residential', tier: 'strong',   available: 27,  total: 80,  featured: false },
  { id: 'us-mia-isp-standard',country: 'United States', countryCode: 'US', region: 'North America',  city: 'Miami',          ipType: 'isp',         tier: 'standard', available: 43,  total: 100, featured: false },
  { id: 'us-sf-dc-elite',     country: 'United States', countryCode: 'US', region: 'North America',  city: 'San Francisco',  ipType: 'datacenter',  tier: 'elite',    available: 5,   total: 30,  featured: true  },
  { id: 'us-dal-res-standard',country: 'United States', countryCode: 'US', region: 'North America',  city: 'Dallas',         ipType: 'residential', tier: 'standard', available: 61,  total: 120, featured: false },
  { id: 'us-sea-mob-strong',  country: 'United States', countryCode: 'US', region: 'North America',  city: 'Seattle',        ipType: 'mobile',      tier: 'strong',   available: 19,  total: 60,  featured: false },
  { id: 'us-hou-isp-low',     country: 'United States', countryCode: 'US', region: 'North America',  city: 'Houston',        ipType: 'isp',         tier: 'low',      available: 94,  total: 160, featured: false },
  { id: 'ca-tor-res-elite',   country: 'Canada',        countryCode: 'CA', region: 'North America',  city: 'Toronto',        ipType: 'residential', tier: 'elite',    available: 8,   total: 30,  featured: true  },
  { id: 'ca-van-mob-standard',country: 'Canada',        countryCode: 'CA', region: 'North America',  city: 'Vancouver',      ipType: 'mobile',      tier: 'standard', available: 51,  total: 90,  featured: false },
  { id: 'ca-mon-res-strong',  country: 'Canada',        countryCode: 'CA', region: 'North America',  city: 'Montreal',       ipType: 'residential', tier: 'strong',   available: 33,  total: 70,  featured: false },
  { id: 'ca-cal-isp-low',     country: 'Canada',        countryCode: 'CA', region: 'North America',  city: 'Calgary',        ipType: 'isp',         tier: 'low',      available: 77,  total: 130, featured: false },
  { id: 'mx-mex-res-standard',country: 'Mexico',        countryCode: 'MX', region: 'North America',  city: 'Mexico City',    ipType: 'residential', tier: 'standard', available: 55,  total: 100, featured: false },
  { id: 'mx-gdl-mob-low',     country: 'Mexico',        countryCode: 'MX', region: 'North America',  city: 'Guadalajara',    ipType: 'mobile',      tier: 'low',      available: 82,  total: 140, featured: false },

  // ── Europe ─────────────────────────────────────────────────────
  { id: 'uk-lon-res-elite',   country: 'United Kingdom',countryCode: 'GB', region: 'Europe',         city: 'London',         ipType: 'residential', tier: 'elite',    available: 9,   total: 40,  featured: true  },
  { id: 'uk-man-mob-standard',country: 'United Kingdom',countryCode: 'GB', region: 'Europe',         city: 'Manchester',     ipType: 'mobile',      tier: 'standard', available: 44,  total: 90,  featured: false },
  { id: 'uk-bir-res-strong',  country: 'United Kingdom',countryCode: 'GB', region: 'Europe',         city: 'Birmingham',     ipType: 'residential', tier: 'strong',   available: 31,  total: 70,  featured: false },
  { id: 'uk-gla-isp-low',     country: 'United Kingdom',countryCode: 'GB', region: 'Europe',         city: 'Glasgow',        ipType: 'isp',         tier: 'low',      available: 66,  total: 120, featured: false },
  { id: 'de-ber-dc-elite',    country: 'Germany',       countryCode: 'DE', region: 'Europe',         city: 'Berlin',         ipType: 'datacenter',  tier: 'elite',    available: 7,   total: 25,  featured: true  },
  { id: 'de-mun-res-strong',  country: 'Germany',       countryCode: 'DE', region: 'Europe',         city: 'Munich',         ipType: 'residential', tier: 'strong',   available: 22,  total: 65,  featured: false },
  { id: 'de-fra-mob-standard',country: 'Germany',       countryCode: 'DE', region: 'Europe',         city: 'Frankfurt',      ipType: 'mobile',      tier: 'standard', available: 58,  total: 100, featured: false },
  { id: 'de-ham-isp-low',     country: 'Germany',       countryCode: 'DE', region: 'Europe',         city: 'Hamburg',        ipType: 'isp',         tier: 'low',      available: 91,  total: 150, featured: false },
  { id: 'fr-par-res-elite',   country: 'France',        countryCode: 'FR', region: 'Europe',         city: 'Paris',          ipType: 'residential', tier: 'elite',    available: 7,   total: 35,  featured: true  },
  { id: 'fr-lyo-mob-strong',  country: 'France',        countryCode: 'FR', region: 'Europe',         city: 'Lyon',           ipType: 'mobile',      tier: 'strong',   available: 28,  total: 60,  featured: false },
  { id: 'fr-mar-res-standard',country: 'France',        countryCode: 'FR', region: 'Europe',         city: 'Marseille',      ipType: 'residential', tier: 'standard', available: 49,  total: 90,  featured: false },
  { id: 'fr-bor-isp-low',     country: 'France',        countryCode: 'FR', region: 'Europe',         city: 'Bordeaux',       ipType: 'isp',         tier: 'low',      available: 73,  total: 130, featured: false },
  { id: 'nl-ams-dc-elite',    country: 'Netherlands',   countryCode: 'NL', region: 'Europe',         city: 'Amsterdam',      ipType: 'datacenter',  tier: 'elite',    available: 11,  total: 40,  featured: true  },
  { id: 'nl-rot-res-strong',  country: 'Netherlands',   countryCode: 'NL', region: 'Europe',         city: 'Rotterdam',      ipType: 'residential', tier: 'strong',   available: 24,  total: 55,  featured: false },
  { id: 'nl-hag-mob-standard',country: 'Netherlands',   countryCode: 'NL', region: 'Europe',         city: 'The Hague',      ipType: 'mobile',      tier: 'standard', available: 56,  total: 100, featured: false },
  { id: 'es-mad-res-elite',   country: 'Spain',         countryCode: 'ES', region: 'Europe',         city: 'Madrid',         ipType: 'residential', tier: 'elite',    available: 6,   total: 25,  featured: false },
  { id: 'es-bar-mob-strong',  country: 'Spain',         countryCode: 'ES', region: 'Europe',         city: 'Barcelona',      ipType: 'mobile',      tier: 'strong',   available: 21,  total: 55,  featured: false },
  { id: 'es-val-res-standard',country: 'Spain',         countryCode: 'ES', region: 'Europe',         city: 'Valencia',       ipType: 'residential', tier: 'standard', available: 47,  total: 85,  featured: false },
  { id: 'es-sev-isp-low',     country: 'Spain',         countryCode: 'ES', region: 'Europe',         city: 'Seville',        ipType: 'isp',         tier: 'low',      available: 79,  total: 140, featured: false },
  { id: 'it-rom-res-elite',   country: 'Italy',         countryCode: 'IT', region: 'Europe',         city: 'Rome',           ipType: 'residential', tier: 'elite',    available: 8,   total: 30,  featured: false },
  { id: 'it-mil-dc-strong',   country: 'Italy',         countryCode: 'IT', region: 'Europe',         city: 'Milan',          ipType: 'datacenter',  tier: 'strong',   available: 18,  total: 50,  featured: false },
  { id: 'it-nap-mob-standard',country: 'Italy',         countryCode: 'IT', region: 'Europe',         city: 'Naples',         ipType: 'mobile',      tier: 'standard', available: 52,  total: 95,  featured: false },
  { id: 'se-sto-res-strong',  country: 'Sweden',        countryCode: 'SE', region: 'Europe',         city: 'Stockholm',      ipType: 'residential', tier: 'strong',   available: 23,  total: 55,  featured: false },
  { id: 'se-got-mob-standard',country: 'Sweden',        countryCode: 'SE', region: 'Europe',         city: 'Gothenburg',     ipType: 'mobile',      tier: 'standard', available: 41,  total: 80,  featured: false },
  { id: 'se-mal-isp-low',     country: 'Sweden',        countryCode: 'SE', region: 'Europe',         city: 'Malmö',          ipType: 'isp',         tier: 'low',      available: 68,  total: 120, featured: false },
  { id: 'pl-war-res-standard',country: 'Poland',        countryCode: 'PL', region: 'Europe',         city: 'Warsaw',         ipType: 'residential', tier: 'standard', available: 53,  total: 95,  featured: false },
  { id: 'pl-kra-mob-low',     country: 'Poland',        countryCode: 'PL', region: 'Europe',         city: 'Krakow',         ipType: 'mobile',      tier: 'low',      available: 84,  total: 150, featured: false },
  { id: 'ch-zur-dc-elite',    country: 'Switzerland',   countryCode: 'CH', region: 'Europe',         city: 'Zurich',         ipType: 'datacenter',  tier: 'elite',    available: 4,   total: 20,  featured: true  },
  { id: 'ch-gen-res-strong',  country: 'Switzerland',   countryCode: 'CH', region: 'Europe',         city: 'Geneva',         ipType: 'residential', tier: 'strong',   available: 16,  total: 40,  featured: false },

  // ── Asia Pacific ───────────────────────────────────────────────
  { id: 'jp-tok-res-elite',   country: 'Japan',         countryCode: 'JP', region: 'Asia Pacific',   city: 'Tokyo',          ipType: 'residential', tier: 'elite',    available: 6,   total: 25,  featured: true  },
  { id: 'jp-osa-mob-strong',  country: 'Japan',         countryCode: 'JP', region: 'Asia Pacific',   city: 'Osaka',          ipType: 'mobile',      tier: 'strong',   available: 14,  total: 45,  featured: false },
  { id: 'jp-nag-res-standard',country: 'Japan',         countryCode: 'JP', region: 'Asia Pacific',   city: 'Nagoya',         ipType: 'residential', tier: 'standard', available: 38,  total: 75,  featured: false },
  { id: 'jp-sap-isp-low',     country: 'Japan',         countryCode: 'JP', region: 'Asia Pacific',   city: 'Sapporo',        ipType: 'isp',         tier: 'low',      available: 72,  total: 130, featured: false },
  { id: 'sg-sin-dc-elite',    country: 'Singapore',     countryCode: 'SG', region: 'Asia Pacific',   city: 'Singapore',      ipType: 'datacenter',  tier: 'elite',    available: 11,  total: 40,  featured: true  },
  { id: 'sg-sin-res-strong',  country: 'Singapore',     countryCode: 'SG', region: 'Asia Pacific',   city: 'Singapore',      ipType: 'residential', tier: 'strong',   available: 25,  total: 60,  featured: false },
  { id: 'sg-sin-mob-standard',country: 'Singapore',     countryCode: 'SG', region: 'Asia Pacific',   city: 'Singapore',      ipType: 'mobile',      tier: 'standard', available: 44,  total: 80,  featured: false },
  { id: 'sg-sin-isp-low',     country: 'Singapore',     countryCode: 'SG', region: 'Asia Pacific',   city: 'Singapore',      ipType: 'isp',         tier: 'low',      available: 81,  total: 150, featured: false },
  { id: 'au-syd-res-elite',   country: 'Australia',     countryCode: 'AU', region: 'Asia Pacific',   city: 'Sydney',         ipType: 'residential', tier: 'elite',    available: 7,   total: 28,  featured: false },
  { id: 'au-mel-mob-strong',  country: 'Australia',     countryCode: 'AU', region: 'Asia Pacific',   city: 'Melbourne',      ipType: 'mobile',      tier: 'strong',   available: 29,  total: 65,  featured: false },
  { id: 'au-bri-res-standard',country: 'Australia',     countryCode: 'AU', region: 'Asia Pacific',   city: 'Brisbane',       ipType: 'residential', tier: 'standard', available: 46,  total: 90,  featured: false },
  { id: 'au-per-isp-low',     country: 'Australia',     countryCode: 'AU', region: 'Asia Pacific',   city: 'Perth',          ipType: 'isp',         tier: 'low',      available: 75,  total: 130, featured: false },
  { id: 'kr-seo-res-elite',   country: 'South Korea',   countryCode: 'KR', region: 'Asia Pacific',   city: 'Seoul',          ipType: 'residential', tier: 'elite',    available: 4,   total: 20,  featured: true  },
  { id: 'kr-bus-mob-strong',  country: 'South Korea',   countryCode: 'KR', region: 'Asia Pacific',   city: 'Busan',          ipType: 'mobile',      tier: 'strong',   available: 17,  total: 45,  featured: false },
  { id: 'kr-inc-dc-standard', country: 'South Korea',   countryCode: 'KR', region: 'Asia Pacific',   city: 'Incheon',        ipType: 'datacenter',  tier: 'standard', available: 39,  total: 75,  featured: false },
  { id: 'kr-dae-isp-low',     country: 'South Korea',   countryCode: 'KR', region: 'Asia Pacific',   city: 'Daegu',          ipType: 'isp',         tier: 'low',      available: 68,  total: 120, featured: false },
  { id: 'in-mum-res-strong',  country: 'India',         countryCode: 'IN', region: 'Asia Pacific',   city: 'Mumbai',         ipType: 'residential', tier: 'strong',   available: 32,  total: 70,  featured: false },
  { id: 'in-ban-mob-standard',country: 'India',         countryCode: 'IN', region: 'Asia Pacific',   city: 'Bangalore',      ipType: 'mobile',      tier: 'standard', available: 59,  total: 110, featured: false },
  { id: 'in-del-res-low',     country: 'India',         countryCode: 'IN', region: 'Asia Pacific',   city: 'Delhi',          ipType: 'residential', tier: 'low',      available: 103, total: 200, featured: false },
  { id: 'in-hyd-isp-low',     country: 'India',         countryCode: 'IN', region: 'Asia Pacific',   city: 'Hyderabad',      ipType: 'isp',         tier: 'low',      available: 88,  total: 170, featured: false },
  { id: 'hk-hkg-dc-elite',    country: 'Hong Kong',     countryCode: 'HK', region: 'Asia Pacific',   city: 'Hong Kong',      ipType: 'datacenter',  tier: 'elite',    available: 9,   total: 35,  featured: true  },
  { id: 'hk-hkg-res-strong',  country: 'Hong Kong',     countryCode: 'HK', region: 'Asia Pacific',   city: 'Hong Kong',      ipType: 'residential', tier: 'strong',   available: 21,  total: 55,  featured: false },
  { id: 'hk-hkg-mob-standard',country: 'Hong Kong',     countryCode: 'HK', region: 'Asia Pacific',   city: 'Hong Kong',      ipType: 'mobile',      tier: 'standard', available: 43,  total: 80,  featured: false },
  { id: 'tw-tai-res-elite',   country: 'Taiwan',        countryCode: 'TW', region: 'Asia Pacific',   city: 'Taipei',         ipType: 'residential', tier: 'elite',    available: 5,   total: 22,  featured: false },
  { id: 'tw-kao-mob-strong',  country: 'Taiwan',        countryCode: 'TW', region: 'Asia Pacific',   city: 'Kaohsiung',      ipType: 'mobile',      tier: 'strong',   available: 19,  total: 50,  featured: false },
  { id: 'my-kul-res-standard',country: 'Malaysia',      countryCode: 'MY', region: 'Asia Pacific',   city: 'Kuala Lumpur',   ipType: 'residential', tier: 'standard', available: 48,  total: 90,  featured: false },
  { id: 'my-pen-mob-low',     country: 'Malaysia',      countryCode: 'MY', region: 'Asia Pacific',   city: 'Penang',         ipType: 'mobile',      tier: 'low',      available: 76,  total: 140, featured: false },
  { id: 'th-ban-res-standard',country: 'Thailand',      countryCode: 'TH', region: 'Asia Pacific',   city: 'Bangkok',        ipType: 'residential', tier: 'standard', available: 54,  total: 100, featured: false },
  { id: 'th-chi-mob-low',     country: 'Thailand',      countryCode: 'TH', region: 'Asia Pacific',   city: 'Chiang Mai',     ipType: 'mobile',      tier: 'low',      available: 82,  total: 150, featured: false },
  { id: 'id-jak-res-standard',country: 'Indonesia',     countryCode: 'ID', region: 'Asia Pacific',   city: 'Jakarta',        ipType: 'residential', tier: 'standard', available: 61,  total: 110, featured: false },
  { id: 'id-sur-mob-low',     country: 'Indonesia',     countryCode: 'ID', region: 'Asia Pacific',   city: 'Surabaya',       ipType: 'mobile',      tier: 'low',      available: 89,  total: 160, featured: false },
  { id: 'ph-man-res-standard',country: 'Philippines',   countryCode: 'PH', region: 'Asia Pacific',   city: 'Manila',         ipType: 'residential', tier: 'standard', available: 57,  total: 105, featured: false },
  { id: 'ph-ceb-mob-low',     country: 'Philippines',   countryCode: 'PH', region: 'Asia Pacific',   city: 'Cebu',           ipType: 'mobile',      tier: 'low',      available: 83,  total: 150, featured: false },
  { id: 'vn-hcm-res-low',     country: 'Vietnam',       countryCode: 'VN', region: 'Asia Pacific',   city: 'Ho Chi Minh',    ipType: 'residential', tier: 'low',      available: 94,  total: 170, featured: false },
  { id: 'nz-auc-res-strong',  country: 'New Zealand',   countryCode: 'NZ', region: 'Asia Pacific',   city: 'Auckland',       ipType: 'residential', tier: 'strong',   available: 21,  total: 50,  featured: false },

  // ── Middle East ────────────────────────────────────────────────
  { id: 'ae-dub-res-elite',   country: 'UAE',           countryCode: 'AE', region: 'Middle East',    city: 'Dubai',          ipType: 'residential', tier: 'elite',    available: 8,   total: 30,  featured: true  },
  { id: 'ae-dub-dc-strong',   country: 'UAE',           countryCode: 'AE', region: 'Middle East',    city: 'Dubai',          ipType: 'datacenter',  tier: 'strong',   available: 17,  total: 50,  featured: false },
  { id: 'ae-abu-mob-standard',country: 'UAE',           countryCode: 'AE', region: 'Middle East',    city: 'Abu Dhabi',      ipType: 'mobile',      tier: 'standard', available: 42,  total: 80,  featured: false },
  { id: 'ae-sha-isp-low',     country: 'UAE',           countryCode: 'AE', region: 'Middle East',    city: 'Sharjah',        ipType: 'isp',         tier: 'low',      available: 71,  total: 130, featured: false },
  { id: 'sa-riy-res-elite',   country: 'Saudi Arabia',  countryCode: 'SA', region: 'Middle East',    city: 'Riyadh',         ipType: 'residential', tier: 'elite',    available: 6,   total: 25,  featured: false },
  { id: 'sa-jed-mob-strong',  country: 'Saudi Arabia',  countryCode: 'SA', region: 'Middle East',    city: 'Jeddah',         ipType: 'mobile',      tier: 'strong',   available: 19,  total: 50,  featured: false },
  { id: 'sa-dam-res-standard',country: 'Saudi Arabia',  countryCode: 'SA', region: 'Middle East',    city: 'Dammam',         ipType: 'residential', tier: 'standard', available: 44,  total: 85,  featured: false },
  { id: 'qa-doh-dc-elite',    country: 'Qatar',         countryCode: 'QA', region: 'Middle East',    city: 'Doha',           ipType: 'datacenter',  tier: 'elite',    available: 5,   total: 20,  featured: false },
  { id: 'qa-doh-res-strong',  country: 'Qatar',         countryCode: 'QA', region: 'Middle East',    city: 'Doha',           ipType: 'residential', tier: 'strong',   available: 16,  total: 40,  featured: false },
  { id: 'il-tel-res-elite',   country: 'Israel',        countryCode: 'IL', region: 'Middle East',    city: 'Tel Aviv',       ipType: 'residential', tier: 'elite',    available: 7,   total: 28,  featured: false },
  { id: 'il-jer-mob-standard',country: 'Israel',        countryCode: 'IL', region: 'Middle East',    city: 'Jerusalem',      ipType: 'mobile',      tier: 'standard', available: 38,  total: 75,  featured: false },
  { id: 'tr-ist-res-strong',  country: 'Turkey',        countryCode: 'TR', region: 'Middle East',    city: 'Istanbul',       ipType: 'residential', tier: 'strong',   available: 26,  total: 60,  featured: false },
  { id: 'tr-ank-mob-standard',country: 'Turkey',        countryCode: 'TR', region: 'Middle East',    city: 'Ankara',         ipType: 'mobile',      tier: 'standard', available: 48,  total: 90,  featured: false },
  { id: 'tr-izm-isp-low',     country: 'Turkey',        countryCode: 'TR', region: 'Middle East',    city: 'Izmir',          ipType: 'isp',         tier: 'low',      available: 74,  total: 130, featured: false },

  // ── Africa ─────────────────────────────────────────────────────
  { id: 'za-joh-res-elite',   country: 'South Africa',  countryCode: 'ZA', region: 'Africa',         city: 'Johannesburg',   ipType: 'residential', tier: 'elite',    available: 6,   total: 25,  featured: true  },
  { id: 'za-cap-mob-strong',  country: 'South Africa',  countryCode: 'ZA', region: 'Africa',         city: 'Cape Town',      ipType: 'mobile',      tier: 'strong',   available: 22,  total: 55,  featured: false },
  { id: 'za-dur-res-standard',country: 'South Africa',  countryCode: 'ZA', region: 'Africa',         city: 'Durban',         ipType: 'residential', tier: 'standard', available: 48,  total: 90,  featured: false },
  { id: 'za-pre-isp-low',     country: 'South Africa',  countryCode: 'ZA', region: 'Africa',         city: 'Pretoria',       ipType: 'isp',         tier: 'low',      available: 77,  total: 140, featured: false },
  { id: 'ng-lag-res-strong',  country: 'Nigeria',       countryCode: 'NG', region: 'Africa',         city: 'Lagos',          ipType: 'residential', tier: 'strong',   available: 28,  total: 65,  featured: false },
  { id: 'ng-abj-mob-standard',country: 'Nigeria',       countryCode: 'NG', region: 'Africa',         city: 'Abuja',          ipType: 'mobile',      tier: 'standard', available: 51,  total: 95,  featured: false },
  { id: 'ng-kano-isp-low',    country: 'Nigeria',       countryCode: 'NG', region: 'Africa',         city: 'Kano',           ipType: 'isp',         tier: 'low',      available: 83,  total: 150, featured: false },
  { id: 'ng-ph-res-low',      country: 'Nigeria',       countryCode: 'NG', region: 'Africa',         city: 'Port Harcourt',  ipType: 'residential', tier: 'low',      available: 91,  total: 160, featured: false },
  { id: 'ke-nai-res-standard',country: 'Kenya',         countryCode: 'KE', region: 'Africa',         city: 'Nairobi',        ipType: 'residential', tier: 'standard', available: 46,  total: 90,  featured: false },
  { id: 'ke-mom-mob-low',     country: 'Kenya',         countryCode: 'KE', region: 'Africa',         city: 'Mombasa',        ipType: 'mobile',      tier: 'low',      available: 78,  total: 140, featured: false },
  { id: 'gh-acc-res-standard',country: 'Ghana',         countryCode: 'GH', region: 'Africa',         city: 'Accra',          ipType: 'residential', tier: 'standard', available: 52,  total: 95,  featured: false },
  { id: 'gh-kum-mob-low',     country: 'Ghana',         countryCode: 'GH', region: 'Africa',         city: 'Kumasi',         ipType: 'mobile',      tier: 'low',      available: 79,  total: 145, featured: false },
  { id: 'eg-cai-res-strong',  country: 'Egypt',         countryCode: 'EG', region: 'Africa',         city: 'Cairo',          ipType: 'residential', tier: 'strong',   available: 31,  total: 70,  featured: false },
  { id: 'eg-ale-mob-standard',country: 'Egypt',         countryCode: 'EG', region: 'Africa',         city: 'Alexandria',     ipType: 'mobile',      tier: 'standard', available: 54,  total: 100, featured: false },
  { id: 'eg-giz-isp-low',     country: 'Egypt',         countryCode: 'EG', region: 'Africa',         city: 'Giza',           ipType: 'isp',         tier: 'low',      available: 82,  total: 150, featured: false },
  { id: 'ma-cas-res-standard',country: 'Morocco',       countryCode: 'MA', region: 'Africa',         city: 'Casablanca',     ipType: 'residential', tier: 'standard', available: 49,  total: 90,  featured: false },
  { id: 'ma-rab-mob-low',     country: 'Morocco',       countryCode: 'MA', region: 'Africa',         city: 'Rabat',          ipType: 'mobile',      tier: 'low',      available: 76,  total: 140, featured: false },
  { id: 'tz-dar-res-low',     country: 'Tanzania',      countryCode: 'TZ', region: 'Africa',         city: 'Dar es Salaam',  ipType: 'residential', tier: 'low',      available: 87,  total: 160, featured: false },
  { id: 'et-add-mob-low',     country: 'Ethiopia',      countryCode: 'ET', region: 'Africa',         city: 'Addis Ababa',    ipType: 'mobile',      tier: 'low',      available: 92,  total: 170, featured: false },
  { id: 'ci-abi-res-low',     country: 'Côte d\'Ivoire',countryCode: 'CI', region: 'Africa',         city: 'Abidjan',        ipType: 'residential', tier: 'low',      available: 88,  total: 160, featured: false },
  { id: 'sn-dak-mob-low',     country: 'Senegal',       countryCode: 'SN', region: 'Africa',         city: 'Dakar',          ipType: 'mobile',      tier: 'low',      available: 81,  total: 150, featured: false },

  // ── South America ──────────────────────────────────────────────
  { id: 'br-sao-res-elite',   country: 'Brazil',        countryCode: 'BR', region: 'South America',  city: 'São Paulo',      ipType: 'residential', tier: 'elite',    available: 7,   total: 28,  featured: false },
  { id: 'br-rio-mob-strong',  country: 'Brazil',        countryCode: 'BR', region: 'South America',  city: 'Rio de Janeiro', ipType: 'mobile',      tier: 'strong',   available: 24,  total: 60,  featured: false },
  { id: 'br-bel-res-standard',country: 'Brazil',        countryCode: 'BR', region: 'South America',  city: 'Belo Horizonte', ipType: 'residential', tier: 'standard', available: 55,  total: 100, featured: false },
  { id: 'br-bra-isp-low',     country: 'Brazil',        countryCode: 'BR', region: 'South America',  city: 'Brasília',       ipType: 'isp',         tier: 'low',      available: 91,  total: 160, featured: false },
  { id: 'ar-bue-res-strong',  country: 'Argentina',     countryCode: 'AR', region: 'South America',  city: 'Buenos Aires',   ipType: 'residential', tier: 'strong',   available: 26,  total: 60,  featured: false },
  { id: 'ar-cor-mob-standard',country: 'Argentina',     countryCode: 'AR', region: 'South America',  city: 'Córdoba',        ipType: 'mobile',      tier: 'standard', available: 48,  total: 90,  featured: false },
  { id: 'ar-ros-isp-low',     country: 'Argentina',     countryCode: 'AR', region: 'South America',  city: 'Rosario',        ipType: 'isp',         tier: 'low',      available: 74,  total: 135, featured: false },
  { id: 'co-bog-res-standard',country: 'Colombia',      countryCode: 'CO', region: 'South America',  city: 'Bogotá',         ipType: 'residential', tier: 'standard', available: 52,  total: 95,  featured: false },
  { id: 'co-med-mob-low',     country: 'Colombia',      countryCode: 'CO', region: 'South America',  city: 'Medellín',       ipType: 'mobile',      tier: 'low',      available: 79,  total: 145, featured: false },
  { id: 'cl-san-res-strong',  country: 'Chile',         countryCode: 'CL', region: 'South America',  city: 'Santiago',       ipType: 'residential', tier: 'strong',   available: 27,  total: 62,  featured: false },
  { id: 'cl-val-mob-standard',country: 'Chile',         countryCode: 'CL', region: 'South America',  city: 'Valparaíso',     ipType: 'mobile',      tier: 'standard', available: 46,  total: 88,  featured: false },
  { id: 'pe-lim-res-standard',country: 'Peru',          countryCode: 'PE', region: 'South America',  city: 'Lima',           ipType: 'residential', tier: 'standard', available: 51,  total: 95,  featured: false },
  { id: 'pe-are-mob-low',     country: 'Peru',          countryCode: 'PE', region: 'South America',  city: 'Arequipa',       ipType: 'mobile',      tier: 'low',      available: 77,  total: 140, featured: false },
]

// Shuffle listings for mixed display
const shuffle = arr => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const SHUFFLED_LISTINGS = shuffle(MARKETPLACE_LISTINGS)
export const REGIONS   = [...new Set(MARKETPLACE_LISTINGS.map(l => l.region))].sort()
export const TIER_ORDER = ['low', 'standard', 'strong', 'elite']