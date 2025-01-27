export const serializeDate = (date: Date | string): string => {
  if (typeof date === 'string') return date;
  return date.toISOString();
};

export const deserializeDate = (dateString: string): Date => {
  return new Date(dateString);
}; 