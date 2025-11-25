// Generate consistent personas from session tokens using deterministic hashing

const FIRST_NAMES = [
  'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Sophie', 'Ryan',
  'Olivia', 'Daniel', 'Emily', 'Christopher', 'Jessica', 'Matthew', 'Ashley', 'Andrew'
];

const LAST_NAMES = [
  'Johnson', 'Chen', 'Wilson', 'Park', 'Anderson', 'Lee', 'Taylor', 'Kim',
  'Martinez', 'Davis', 'Rodriguez', 'Brown', 'Garcia', 'Miller', 'Thomas', 'Moore'
];

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
];

// Simple hash function for consistent pseudo-random generation
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export interface Persona {
  name: string;
  initials: string;
  avatarColor: string;
}

export function generatePersona(sessionToken: string): Persona {
  const hash = hashString(sessionToken);
  
  const firstName = FIRST_NAMES[hash % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(hash / FIRST_NAMES.length) % LAST_NAMES.length];
  const avatarColor = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  
  const name = `${firstName} ${lastName}`;
  const initials = `${firstName[0]}${lastName[0]}`;
  
  return {
    name,
    initials,
    avatarColor,
  };
}

// Generate initials from a real name
export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
