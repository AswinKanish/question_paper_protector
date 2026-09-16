/**
 * Cryptographic utility layer for SecureExams Cloud.
 * Uses the standard Web Crypto API (SubtleCrypto) for SHA-256 digests
 * with deterministic fallback for rapid verification.
 */

// Compute SHA-256 using standard browser Web Crypto API
export async function computeSHA256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return fallbackSHA256(message);
    }
  }
  return fallbackSHA256(message);
}

// Deterministic fast SHA-256 hash algorithm fallback
export function fallbackSHA256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: number[] = [];
  let k: number[] = [];
  let primeCounter = 0;

  const isPrime = (candidate: number) => {
    for (let factor = 2, max = Math.sqrt(candidate); factor <= max; factor++) {
      if (candidate % factor === 0) return false;
    }
    return true;
  };

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 1 / 2) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  let padded = ascii + '\x80';
  while ((padded.length % 64) !== 56) {
    padded += '\x00';
  }
  for (i = 0; i < padded.length; i++) {
    j = padded.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 =
        hash[7] +
        (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
        ch +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const temp2 =
        (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) +
        maj;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (let b = 3; b >= 0; b--) {
      const byte = (hash[i] >> (8 * b)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

// Generate realistic simulated AES-256-GCM ciphertext envelope
export function encryptQuestionPayload(plaintext: string): {
  cipherPayload: string;
  iv: string;
  authTag: string;
  keyId: string;
} {
  const randomHex = (bytes: number) => {
    let out = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < bytes * 2; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  };

  // Convert plaintext string into simulated encrypted hex stream
  let encodedHex = '';
  for (let i = 0; i < Math.min(plaintext.length, 64); i++) {
    const code = plaintext.charCodeAt(i) ^ 0x5a;
    encodedHex += code.toString(16).padStart(2, '0');
  }
  while (encodedHex.length < 64) {
    encodedHex += randomHex(4);
  }

  return {
    cipherPayload: `0x_AES256GCM_${encodedHex.substring(0, 48)}...[TRUNCATED_PROTECTED_BLOB]`,
    iv: `iv_${randomHex(12)}`,
    authTag: `tag_${randomHex(16)}`,
    keyId: `HSM-KMS-${randomHex(4).toUpperCase()}-2026`,
  };
}

// Generate canonical serialized string for a paper bundle to ensure determinism
export function serializePaperForHash(questions: {
  id: string;
  sectionId: string;
  text: string;
  options: { id: string; text: string }[];
  marks: number;
}[]): string {
  return JSON.stringify(
    questions.map((q, idx) => ({
      index: idx + 1,
      id: q.id,
      sectionId: q.sectionId,
      text: q.text.trim(),
      options: q.options.map(o => ({ id: o.id, text: o.text.trim() })),
      marks: q.marks,
    }))
  );
}

// Merkle Root calculation of question hashes
export function computeMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return '0000000000000000000000000000000000000000000000000000000000000000';
  let currentLevel = [...hashes];

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
      nextLevel.push(fallbackSHA256(left + right));
    }
    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

// Generate random OTP
export function generateRandomOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format cryptographic hash with clean ellipsis
export function formatCryptoHash(hash: string, lead = 8, trail = 8): string {
  if (!hash || hash.length <= lead + trail) return hash;
  return `${hash.substring(0, lead)}...${hash.substring(hash.length - trail)}`;
}
