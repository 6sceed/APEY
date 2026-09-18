export function formatRemainingTime(resetAt?: string): { formatted: string; isExpired: boolean } {
  if (!resetAt) {
    return { formatted: '00:00:00', isExpired: true };
  }

  const targetDate = new Date(resetAt);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (isNaN(diffMs) || diffMs <= 0) {
    return { formatted: '00:00:00', isExpired: true };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (days > 0) {
    return {
      formatted: `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      isExpired: false,
    };
  }

  return {
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    isExpired: false,
  };
}

export function parseResetDateTime(input: string): string | undefined {
  if (!input.trim()) return undefined;

  const trimmed = input.trim();
  const parsedDate = new Date(trimmed);

  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString();
  }

  return undefined;
}
