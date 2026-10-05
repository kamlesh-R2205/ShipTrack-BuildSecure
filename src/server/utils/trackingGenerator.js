const crypto = require('crypto');

/**
 * Generates an unguessable, cryptographically secure tracking number.
 * Format: ST-<YEAR>-<RANDOM_CHARS>
 * Example: ST-2026-F89A-24E1
 */
function generateTrackingNumber() {
  const year = new Date().getFullYear();
  const bytes = crypto.randomBytes(4).toString('hex').toUpperCase();
  const segment1 = bytes.slice(0, 4);
  const segment2 = bytes.slice(4, 8);
  return `ST-${year}-${segment1}-${segment2}`;
}

module.exports = {
  generateTrackingNumber,
};
