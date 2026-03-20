/**
 * Calculate peak summer daylight hours for a given latitude.
 * Uses the sunrise equation for the summer solstice (June 21, day 172).
 *
 * For latitudes above the Arctic Circle (~66.5°N), returns 24 (midnight sun).
 * For latitudes below the Antarctic Circle, returns 0 (polar night in June).
 */
export function calculatePeakDaylightHours(latitude: number): number {
  const latRad = (latitude * Math.PI) / 180;

  // Solar declination on summer solstice (June 21, day 172)
  // declination ≈ 23.44°
  const declination = (23.44 * Math.PI) / 180;

  // Hour angle: cos(ω) = -tan(φ) * tan(δ)
  const cosHourAngle = -Math.tan(latRad) * Math.tan(declination);

  // Clamp for midnight sun / polar night
  if (cosHourAngle <= -1) return 24;
  if (cosHourAngle >= 1) return 0;

  const hourAngleRad = Math.acos(cosHourAngle);
  const daylightHours = (2 * hourAngleRad * 180) / (Math.PI * 15);

  return Math.round(daylightHours * 10) / 10;
}
