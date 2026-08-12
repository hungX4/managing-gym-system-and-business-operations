const buildExpiry = (ttl: string): Date => {
    const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }
    const match = ttl.match(/^(\d+)([smhd])$/)
    if (!match) throw new Error(`Invalid TTL format: ${ttl}`)
    const seconds = parseInt(match[1]) * units[match[2]]
    return new Date(Date.now() + seconds * 1000)
}

export { buildExpiry }

// Hàm format Date giữ nguyên giờ địa phương (YYYY-MM-DD HH:mm:ss)
export const formatLocalDateTime = (date: Date): string => {
    if (!date) return '';
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
}