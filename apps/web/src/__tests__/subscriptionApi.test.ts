import { describe, it, expect } from 'vitest';
import { normalisePlanName } from '@/lib/subscriptionApi';

describe('normalisePlanName', () => {
  // Free tier aliases
  it('maps "free" → "Free"', () => {
    expect(normalisePlanName('free')).toBe('Free');
  });

  it('maps "starter" → "Free" (legacy alias)', () => {
    expect(normalisePlanName('starter')).toBe('Free');
  });

  it('is case-insensitive for "FREE"', () => {
    expect(normalisePlanName('FREE')).toBe('Free');
  });

  it('is case-insensitive for "Starter"', () => {
    expect(normalisePlanName('Starter')).toBe('Free');
  });

  // Standard tier
  it('maps "standard" → "Standard"', () => {
    expect(normalisePlanName('standard')).toBe('Standard');
  });

  it('is case-insensitive for "STANDARD"', () => {
    expect(normalisePlanName('STANDARD')).toBe('Standard');
  });

  // Pro tier aliases
  it('maps "pro" → "Pro"', () => {
    expect(normalisePlanName('pro')).toBe('Pro');
  });

  it('maps "professional" → "Pro" (legacy alias)', () => {
    expect(normalisePlanName('professional')).toBe('Pro');
  });

  it('is case-insensitive for "PRO"', () => {
    expect(normalisePlanName('PRO')).toBe('Pro');
  });

  it('is case-insensitive for "Professional"', () => {
    expect(normalisePlanName('Professional')).toBe('Pro');
  });

  // Unknown / invalid values
  it('returns null for an unrecognised plan name', () => {
    expect(normalisePlanName('unknown')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(normalisePlanName('')).toBeNull();
  });

  it('returns null for a plan name with extra whitespace', () => {
    expect(normalisePlanName(' pro')).toBeNull();
  });
});
