/**
 * ISO 3166-1 alpha-2 country codes (as of 2025).
 * Used for validating API input where a country code is expected.
 *
 * Source: ISO 3166-1 alpha-2 official list (https://www.iso.org/obp/ui/)
 * Includes: 249 officially assigned codes + EU (exceptionally reserved) + XK (Kosovo, user-assigned, commonly accepted).
 */
export const ISO_3166_ALPHA2: ReadonlySet<string> = new Set([
  // A
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  // B
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ',
  // C
  'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ',
  // D
  'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ',
  // E
  'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'EU',
  // F
  'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
  // G
  'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY',
  // H
  'HK', 'HM', 'HN', 'HR', 'HT', 'HU',
  // I
  'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT',
  // J
  'JE', 'JM', 'JO', 'JP',
  // K
  'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ',
  // L
  'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
  // M
  'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
  // N
  'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ',
  // O
  'OM',
  // P
  'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY',
  // Q
  'QA',
  // R
  'RE', 'RO', 'RS', 'RU', 'RW',
  // S
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ',
  // T
  'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
  // U
  'UA', 'UG', 'UM', 'US', 'UY', 'UZ',
  // V
  'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU',
  // W
  'WF', 'WS',
  // X — user-assigned (Kosovo is commonly accepted)
  'XK',
  // Y
  'YE', 'YT',
  // Z
  'ZA', 'ZM', 'ZW',
]);
