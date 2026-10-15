import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePassDto } from '../dto/create-pass.dto';
import { CreatePassResponseDto } from '../dto/create-pass-response.dto';
import { PassResponseDto } from '../dto/pass-response.dto';
import { UpdatePassValueDto } from '../dto/update-pass-value.dto';
import { PassMapper } from '../mappers/pass.mapper';
import { CreatePassUseCase } from '../use-cases/create-pass.use-case';
import { GetPassUseCase } from '../use-cases/get-pass.use-case';
import { UpdatePassValueUseCase } from '../use-cases/update-pass-value.use-case';

const passIdParam = new ParseUUIDPipe({ version: '4' });

@ApiTags('passes')
@Controller('passes')
export class PassesController {
  constructor(
    private readonly createPass: CreatePassUseCase,
    private readonly updatePassValue: UpdatePassValueUseCase,
    private readonly getPass: GetPassUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a pass',
    description:
      'Creates the pass, issues it on the wallet platform and returns the "add to wallet" link plus a QR code of that link.',
  })
  @ApiCreatedResponse({ type: CreatePassResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiBadGatewayResponse({
    description: 'The wallet platform rejected the request',
  })
  async create(@Body() dto: CreatePassDto): Promise<CreatePassResponseDto> {
    const { pass, saveUrl, qrCodeDataUrl } = await this.createPass.execute(dto);
    return { ...PassMapper.toResponse(pass), saveUrl, qrCodeDataUrl };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pass' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PassResponseDto })
  @ApiNotFoundResponse({ description: 'Pass not found' })
  async findOne(
    @Param('id', passIdParam) id: string,
  ): Promise<PassResponseDto> {
    return PassMapper.toResponse(await this.getPass.execute(id));
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update the number on a pass (live)',
    description:
      'Stores the new value and pushes it to the wallet platform; the saved pass on the phone updates without being re-added.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PassResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid id or request body' })
  @ApiNotFoundResponse({ description: 'Pass not found' })
  @ApiBadGatewayResponse({
    description: 'The wallet platform rejected the update',
  })
  updateValue(
    @Param('id', passIdParam) id: string,
    @Body() dto: UpdatePassValueDto,
  ): Promise<PassResponseDto> {
    return this.applyValueUpdate(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update the number on a pass (PATCH alias)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PassResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid id or request body' })
  @ApiNotFoundResponse({ description: 'Pass not found' })
  @ApiBadGatewayResponse({
    description: 'The wallet platform rejected the update',
  })
  patchValue(
    @Param('id', passIdParam) id: string,
    @Body() dto: UpdatePassValueDto,
  ): Promise<PassResponseDto> {
    return this.applyValueUpdate(id, dto);
  }

  private async applyValueUpdate(
    passId: string,
    { value }: UpdatePassValueDto,
  ): Promise<PassResponseDto> {
    const pass = await this.updatePassValue.execute({ passId, value });
    return PassMapper.toResponse(pass);
  }
}
