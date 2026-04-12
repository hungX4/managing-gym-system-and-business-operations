const buildExpiry = (ttl: string): Date => {
    const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }
    const match = ttl.match(/^(\d+)([smhd])$/)
    if (!match) throw new Error(`Invalid TTL format: ${ttl}`)
    const seconds = parseInt(match[1]) * units[match[2]]
    return new Date(Date.now() + seconds * 1000)
}

export { buildExpiry }