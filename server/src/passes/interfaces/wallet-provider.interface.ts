import { Pass } from '../entities/pass.entity';
import { WalletPlatform } from '../entities/wallet-platform.enum';

export interface IssuedWalletPass {
  /** Link the user opens to add the pass to their wallet. */
  saveUrl: string;
}

/**
 * Port implemented by every wallet platform adapter (Google, Apple, ...).
 * Use-cases depend only on this abstraction, never on a concrete wallet SDK.
 *
 * Declared as an abstract class so it can double as a Nest DI token.
 */
export abstract class WalletProvider {
  /** Platform this adapter serves; used by WalletProviderRegistry. */
  abstract readonly platform: WalletPlatform;

  /**
   * Makes sure the pass template (class) exists, creates the pass instance
   * (object) on the wallet platform and returns a link to save it.
   */
  abstract createPassClassAndObject(pass: Pass): Promise<IssuedWalletPass>;

  /**
   * Pushes the pass's current state to the wallet platform so devices that
   * already saved it receive the update. Receives the full entity because
   * some platforms (Google PATCH on arrays, Apple .pkpass regeneration)
   * need more than the changed value.
   */
  abstract updatePassObject(pass: Pass): Promise<void>;
}

/** Multi-provider token holding every registered WalletProvider. */
export const WALLET_PROVIDERS = Symbol('WALLET_PROVIDERS');
