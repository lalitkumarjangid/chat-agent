
const USER_ID_KEY = 'shopease_guest_id';
const USER_CREATED_AT_KEY = 'shopease_guest_created_at';

/**
 * Generates a unique guest user ID
 * Format: guest_<timestamp>_<random>
 */
function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `guest_${timestamp}_${randomPart}`;
}

/**
 * Gets the current user ID from localStorage, or creates a new one
 */
export function getUserId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
    localStorage.setItem(USER_CREATED_AT_KEY, new Date().toISOString());
  }
  
  return userId;
}

/**
 * Gets the user creation date
 */
export function getUserCreatedAt(): Date | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const createdAt = localStorage.getItem(USER_CREATED_AT_KEY);
  return createdAt ? new Date(createdAt) : null;
}

/**
 * Clears the user ID (for testing or reset purposes)
 */
export function clearUserId(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_CREATED_AT_KEY);
}

/**
 * Checks if user exists
 */
export function hasUser(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return !!localStorage.getItem(USER_ID_KEY);
}
