export function formatDurationHours(hoursValue) {
    const hours = Number(hoursValue);

    if (!Number.isFinite(hours) || hours <= 0) {
        return '0m';
    }

    const totalMinutes = Math.round(hours * 60);
    const wholeHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (wholeHours === 0) {
        return `${remainingMinutes}m`;
    }

    if (remainingMinutes === 0) {
        return `${wholeHours}h`;
    }

    return `${wholeHours}h ${remainingMinutes}m`;
}
