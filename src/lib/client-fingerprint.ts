import crypto from 'crypto'

export const GenerateFingerprint = (IpAddress: string, UserAgent: string): string => {
  const CombinedData = `${IpAddress}:${UserAgent}`
  const Hash = crypto.createHash('sha256').update(CombinedData).digest('hex')
  return Hash.substring(0, 16)
}