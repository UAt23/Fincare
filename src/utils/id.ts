export const generateId = (): string => {
  // Generate a random string with timestamp to ensure uniqueness
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}; 