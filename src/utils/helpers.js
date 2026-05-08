/**
 * Haversine formula to calculate distance between two coordinates
 * Returns distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Calculate speed given two positions and time difference
 * Returns speed in km/h
 */
export function calculateSpeed(pos1, pos2) {
  if (!pos1 || !pos2) return 0;

  const distance = haversineDistance(
    pos1.latitude, pos1.longitude,
    pos2.latitude, pos2.longitude
  );

  const timeDiffHours = (pos2.timestamp - pos1.timestamp) / (1000 * 3600);
  if (timeDiffHours <= 0) return 0;

  const speed = distance / timeDiffHours;
  // ISS travels at ~28,000 km/h, cap unreasonable values
  return speed > 50000 ? 0 : Math.round(speed);
}

/**
 * Format timestamp to readable time string
 */
export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format date for news articles
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
