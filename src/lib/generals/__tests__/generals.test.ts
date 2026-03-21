import { describe, it, expect } from 'vitest';
import {
  generals,
  getGeneralById,
  getGeneralsByFaction,
  factionMeta,
  type Faction,
} from '@/lib/generals';

describe('generals data', () => {
  it('has all 17 generals', () => {
    expect(generals).toHaveLength(17);
  });

  it('each general has required fields (id, name, faction, traits, skillName)', () => {
    for (const general of generals) {
      expect(general.id).toBeTruthy();
      expect(typeof general.id).toBe('string');
      expect(general.name).toBeTruthy();
      expect(typeof general.name).toBe('string');
      expect(['shu', 'wei', 'wu', 'other']).toContain(general.faction);
      expect(general.traits).toBeTruthy();
      expect(typeof general.traits).toBe('string');
      expect(general.skillName).toBeTruthy();
      expect(typeof general.skillName).toBe('string');
    }
  });

  it('has no duplicate IDs', () => {
    const ids = generals.map((g) => g.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('getGeneralById', () => {
  it('returns correct general for a known id', () => {
    const liuBei = getGeneralById('liu-bei');
    expect(liuBei).toBeDefined();
    expect(liuBei!.name).toBe('刘备');
    expect(liuBei!.faction).toBe('shu');
  });

  it('returns undefined for a non-existent id', () => {
    const result = getGeneralById('nonexistent-general');
    expect(result).toBeUndefined();
  });
});

describe('getGeneralsByFaction', () => {
  it('returns only Shu generals for shu faction', () => {
    const groups = getGeneralsByFaction();
    const shuGenerals = groups.shu;

    expect(shuGenerals.length).toBeGreaterThan(0);
    for (const g of shuGenerals) {
      expect(g.faction).toBe('shu');
    }
  });

  it('returns only Wei generals for wei faction', () => {
    const groups = getGeneralsByFaction();
    const weiGenerals = groups.wei;

    expect(weiGenerals.length).toBeGreaterThan(0);
    for (const g of weiGenerals) {
      expect(g.faction).toBe('wei');
    }
  });

  it('faction groups cover all generals', () => {
    const groups = getGeneralsByFaction();
    const factions: Faction[] = ['shu', 'wei', 'wu', 'other'];

    const totalGrouped = factions.reduce(
      (sum, faction) => sum + groups[faction].length,
      0
    );

    expect(totalGrouped).toBe(generals.length);
  });
});

describe('factionMeta coverage', () => {
  it('factionMeta covers all faction values used in generals array', () => {
    const usedFactions = new Set(generals.map((g) => g.faction));

    for (const faction of usedFactions) {
      expect(factionMeta[faction]).toBeDefined();
      expect(factionMeta[faction].label).toBeTruthy();
      expect(factionMeta[faction].color).toBeTruthy();
    }
  });
});
