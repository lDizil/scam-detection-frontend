import { describe, it, expect } from 'vitest';

describe('Пример теста', () => {
  it('должен пройти успешно', () => {
    expect(true).toBe(true);
  });

  it('должен провалиться если 2+2 не равно 4', () => {
    expect(2 + 2).toBe(4);
  });
});
