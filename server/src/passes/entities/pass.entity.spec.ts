import { InvalidPassError } from '../../common/errors/domain.errors';
import { Pass } from './pass.entity';
import { WalletPlatform } from './wallet-platform.enum';

const validInput = {
  name: '  Venu  ',
  label: ' Balance ',
  value: 40,
  platform: WalletPlatform.GOOGLE,
};

describe('Pass', () => {
  it('creates a pass with trimmed fields and distinct ids', () => {
    const pass = Pass.create(validInput);

    expect(pass.name).toBe('Venu');
    expect(pass.label).toBe('Balance');
    expect(pass.value).toBe(40);
    expect(pass.saveUrl).toBeNull();
    expect(pass.id).not.toEqual(pass.uniquePassId);
  });

  it.each([NaN, Infinity, -1, 1_000_000_001])(
    'rejects invalid value %p',
    (value) => {
      expect(() => Pass.create({ ...validInput, value })).toThrow(
        InvalidPassError,
      );
    },
  );

  it('rejects blank name or label', () => {
    expect(() => Pass.create({ ...validInput, name: '  ' })).toThrow(
      InvalidPassError,
    );
    expect(() => Pass.create({ ...validInput, label: '' })).toThrow(
      InvalidPassError,
    );
  });

  it('updates the value and bumps updatedAt', () => {
    const pass = Pass.create(validInput);
    const before = pass.updatedAt.getTime();

    jest.useFakeTimers({ now: before + 1000 });
    pass.updateValue(55);
    jest.useRealTimers();

    expect(pass.value).toBe(55);
    expect(pass.updatedAt.getTime()).toBeGreaterThan(before);
  });

  it('keeps the old value when an update is invalid', () => {
    const pass = Pass.create(validInput);
    expect(() => pass.updateValue(-5)).toThrow(InvalidPassError);
    expect(pass.value).toBe(40);
  });

  it('restores from a snapshot without changing identity', () => {
    const pass = Pass.create(validInput);
    const restored = Pass.restore(pass.toSnapshot());
    expect(restored.toSnapshot()).toEqual(pass.toSnapshot());
  });
});
