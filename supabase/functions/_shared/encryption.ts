/**
 * Shared encryption utilities for secure storage of API keys
 * Uses AES-256-GCM encryption
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recommended for GCM
const TAG_LENGTH = 128; // 128 bits authentication tag

/**
 * Get the encryption key from environment
 */
function getEncryptionKey(): Uint8Array {
  const keyString = Deno.env.get('INTEGRATION_ENCRYPTION_KEY');
  if (!keyString) {
    throw new Error('INTEGRATION_ENCRYPTION_KEY not configured');
  }
  
  // Convert hex string to Uint8Array
  const keyBytes = new Uint8Array(keyString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
  if (keyBytes.length !== 32) {
    throw new Error('INTEGRATION_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }
  
  return keyBytes;
}

/**
 * Encrypt a plaintext string
 * Returns base64-encoded: iv || ciphertext || tag
 */
export async function encryptSecret(plaintext: string): Promise<string> {
  try {
    const keyBytes = getEncryptionKey();
    
    // Import the key for AES-GCM
    // Create a new Uint8Array with proper buffer type
    const keyBuffer = new Uint8Array(keyBytes);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt']
    );
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    // Encrypt the plaintext
    const encoder = new TextEncoder();
    const plaintextBytes = encoder.encode(plaintext);
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
      cryptoKey,
      plaintextBytes
    );
    
    // Combine IV + ciphertext (tag is included in ciphertext)
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    // Return as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt secret');
  }
}

/**
 * Decrypt an encrypted string
 * Expects base64-encoded: iv || ciphertext || tag
 */
export async function decryptSecret(encrypted: string): Promise<string> {
  try {
    const keyBytes = getEncryptionKey();
    
    // Import the key for AES-GCM
    // Create a new Uint8Array with proper buffer type
    const keyBuffer = new Uint8Array(keyBytes);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['decrypt']
    );
    
    // Decode base64
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    
    // Extract IV and ciphertext
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);
    
    // Decrypt
    const plaintextBytes = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
      cryptoKey,
      ciphertext
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(plaintextBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt secret');
  }
}
