import { createHmac, timingSafeEqual } from 'node:crypto';


export function verifyGitHubSignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}


export function verifyGitLabToken(token, secret) {
  if (!token || !secret) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  } catch {
    return false;
  }
}
