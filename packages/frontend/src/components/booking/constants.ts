export const HOURLY_SLOTS = Array.from({ length: 16 }, (_, i) => i + 5); // 5h đến 20h

export const getBookingStyle = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'CONFIRMED': return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50';
        case 'COMPLETED': return 'bg-green-500/20 text-green-400 border border-green-500/50';
        default: return 'bg-blue-500/20 text-blue-400 border border-blue-500/50';
    }
};