import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenEntity {
  @ApiProperty()
  @Expose()
  fid: number;

  @ApiProperty()
  @Expose()
  beneficiaryAddress: string;

  @ApiProperty()
  @Expose()
  ticker: string;

  @ApiProperty()
  @Expose()
  decimals: number;

  @ApiProperty()
  @Expose()
  maxSupply: string;

  @ApiProperty()
  @Expose()
  limit: number;

  @ApiProperty()
  @Expose()
  remaining: string;

  @ApiProperty()
  @Expose()
  txId: string;

  @ApiProperty()
  @Expose()
  block: number;

  @ApiProperty()
  @Expose()
  bvo: number;

  @ApiProperty()
  @Expose()
  vo: number;

  @ApiPropertyOptional()
  @Expose()
  amount?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<TokenEntity>) {
    Object.assign(this, partial);
  }
}
