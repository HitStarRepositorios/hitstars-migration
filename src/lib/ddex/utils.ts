export function convertSecondsToDuration(seconds: number) {

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `PT${minutes}M${secs}S`
}