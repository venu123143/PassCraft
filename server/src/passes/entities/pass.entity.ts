import { randomUUID } from 'node:crypto';
import { InvalidPassError } from '../../common/errors/domain.errors';
import { WalletPlatform } from './wallet-platform.enum';

export const PASS_VALUE_MIN = 0;
export const PASS_VALUE_MAX = 1_000_000_000;

export interface CreatePassProps {
  name: string;
  label: string;
  value: number;
  platform: WalletPlatform;
}

export interface PassProps extends CreatePassProps {
  id: string;
  uniquePassId: string;
  saveUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pass aggregate root. Holds the pass data and enforces its invariants.
 * Persistence and wallet-specific concerns live outside this class.
 */
export class Pass {
  private constructor(private props: PassProps) {}

  /** Creates a brand-new pass with freshly generated identifiers. */
  static create(input: CreatePassProps): Pass {
    const name = input.name.trim();
    const label = input.label.trim();
    if (!name) throw new InvalidPassError('Pass name must not be empty');
    if (!label) throw new InvalidPassError('Pass label must not be empty');
    Pass.assertValidValue(input.value);

    const now = new Date();
    return new Pass({
      id: randomUUID(),
      uniquePassId: randomUUID(),
      name,
      label,
      value: input.value,
      platform: input.platform,
      saveUrl: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Rehydrates a pass from persisted state (no new identifiers). */
  static restore(props: PassProps): Pass {
    return new Pass({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get uniquePassId(): string {
    return this.props.uniquePassId;
  }

  get name(): string {
    return this.props.name;
  }

  get label(): string {
    return this.props.label;
  }

  get value(): number {
    return this.props.value;
  }

  get platform(): WalletPlatform {
    return this.props.platform;
  }

  get saveUrl(): string | null {
    return this.props.saveUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateValue(newValue: number): void {
    Pass.assertValidValue(newValue);
    this.props.value = newValue;
    this.touch();
  }

  attachSaveUrl(saveUrl: string): void {
    if (!saveUrl) throw new InvalidPassError('Save URL must not be empty');
    this.props.saveUrl = saveUrl;
    this.touch();
  }

  toSnapshot(): Readonly<PassProps> {
    return { ...this.props };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  private static assertValidValue(value: number): void {
    if (!Number.isFinite(value)) {
      throw new InvalidPassError('Pass value must be a finite number');
    }
    if (value < PASS_VALUE_MIN || value > PASS_VALUE_MAX) {
      throw new InvalidPassError(
        `Pass value must be between ${PASS_VALUE_MIN} and ${PASS_VALUE_MAX}`,
      );
    }
  }
}
