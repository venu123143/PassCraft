import { Module } from '@nestjs/common';
import { QrCodeService } from '../common/qr/qr-code.service';
import { GoogleWalletAdapter } from './adapters/google-wallet/google-wallet.adapter';
import { GoogleWalletClient } from './adapters/google-wallet/google-wallet.client';
import { GoogleWalletMapper } from './adapters/google-wallet/google-wallet.mapper';
import { GoogleWalletSaveLinkFactory } from './adapters/google-wallet/google-wallet.save-link';
import { WalletProviderRegistry } from './adapters/wallet-provider.registry';
import { PassesController } from './controllers/passes.controller';
import { PassRepository } from './interfaces/pass-repository.interface';
import {
  WALLET_PROVIDERS,
  WalletProvider,
} from './interfaces/wallet-provider.interface';
import { PrismaPassRepository } from './repositories/prisma-pass.repository';
import { CreatePassUseCase } from './use-cases/create-pass.use-case';
import { GetPassUseCase } from './use-cases/get-pass.use-case';
import { UpdatePassValueUseCase } from './use-cases/update-pass-value.use-case';

/**
 * Composition root for the passes feature: the only place that knows which
 * concrete adapters back the WalletProvider and PassRepository ports.
 *
 * To add a wallet platform (e.g. Apple): implement WalletProvider in
 * adapters/apple-wallet/, register its classes below and add it to the
 * WALLET_PROVIDERS factory. Use-cases and controllers stay untouched.
 */
@Module({
  controllers: [PassesController],
  providers: [
    // Use-cases
    CreatePassUseCase,
    UpdatePassValueUseCase,
    GetPassUseCase,

    // Persistence
    { provide: PassRepository, useClass: PrismaPassRepository },

    // Wallet platforms
    GoogleWalletClient,
    GoogleWalletMapper,
    GoogleWalletSaveLinkFactory,
    GoogleWalletAdapter,
    {
      provide: WALLET_PROVIDERS,
      useFactory: (google: GoogleWalletAdapter): WalletProvider[] => [google],
      inject: [GoogleWalletAdapter],
    },
    WalletProviderRegistry,

    QrCodeService,
  ],
})
export class PassesModule {}
