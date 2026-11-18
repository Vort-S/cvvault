import { describe,it,expect } from 'vitest';
import { hashToken,token } from '../../src/lib/security';
describe('share and session token secrecy',()=>{
 it('generates unique high-entropy URL-safe bearer values',()=>{const a=token(),b=token();expect(a).toMatch(/^[A-Za-z0-9_-]{40,64}$/);expect(a).not.toBe(b);});
 it('uses one-way fixed-width token hashes for database lookup',()=>{const raw=token();expect(hashToken(raw)).toMatch(/^[a-f0-9]{64}$/);expect(hashToken(raw)).toBe(hashToken(raw));expect(hashToken(raw)).not.toContain(raw);});
});
