export const formatDuration = (totalMinutes: number): string => {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
};

export const formatTimerSeconds = (secs: number): string => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export const calculateEstimateProgress = (
  totalSpentMinutes: number,
  estimateHours: number
): {
  estMinutes: number;
  percentage: number;
  isOvertime: boolean;
} => {
  const estMinutes = (estimateHours || 0) * 60;
  if (estMinutes <= 0) {
    return {
      estMinutes: 0,
      percentage: totalSpentMinutes > 0 ? 100 : 0,
      isOvertime: false,
    };
  }
  const percentage = Math.round((totalSpentMinutes / estMinutes) * 100);
  return {
    estMinutes,
    percentage: Math.min(100, percentage),
    isOvertime: totalSpentMinutes > estMinutes,
  };
};
