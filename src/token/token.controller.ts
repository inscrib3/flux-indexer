import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'src/decorators/pagination';
import { TokenService } from './token.service';
import { TokenEntity } from 'src/entities/token';
import { MongooseClassSerializerInterceptor } from 'src/interceptors/mongoose';
import { PaginationInterceptor } from 'src/interceptors/pagination';
import { LowercasePipe } from 'src/validation/lowercase';
import { UtxoEntity } from 'src/entities/utxo';

@Controller('token')
@UseInterceptors(PaginationInterceptor)
@MongooseClassSerializerInterceptor(TokenEntity)
@ApiTags('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @ApiOperation({ summary: 'Get all recorded tokens' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/')
  async getAll(@Pagination() pagination: any): Promise<TokenEntity[]> {
    const tokens = await this.tokenService.getAll(pagination);
    return tokens;
  }

  @ApiOperation({ summary: 'Search tokens by ticker' })
  @ApiParam({
    name: 'ticker',
    type: String,
    format: '?ticker=flux',
  })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/search')
  async searchByTicker(
    @Query('ticker') ticker: string,
    @Pagination() pagination: any,
  ): Promise<TokenEntity[]> {
    const tokens = await this.tokenService.findByTickerSimilarity(
      ticker,
      pagination,
    );
    return tokens;
  }

  @ApiOperation({ summary: 'Get a token by ticker' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/by-ticker/:ticker')
  async getByTicker(
    @Param('ticker', LowercasePipe) ticker: string,
    @Pagination() pagination: any,
  ): Promise<TokenEntity[]> {
    const tokens = await this.tokenService.getByTicker(ticker, pagination);
    return tokens;
  }

  @ApiOperation({ summary: 'Get a token by fid' })
  @ApiResponse({
    status: 200,
    type: TokenEntity,
  })
  @Get('/by-fid/:fid')
  async getByFid(@Param('fid') fid: number): Promise<TokenEntity> {
    return await this.tokenService.getByFid(fid);
  }

  @ApiOperation({ summary: 'Get tokens by fid range' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/by-fid-range/:start/:stop')
  async getByFidRange(
    @Param('start') start: number,
    @Param('stop') stop: number,
    @Pagination() pagination: any,
  ): Promise<TokenEntity[]> {
    return await this.tokenService.getByFidRange(start, stop, pagination);
  }

  @ApiOperation({ summary: 'Get tokens by block' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/by-block/:block')
  async getByBlock(
    @Param('block') block: number,
    @Pagination() pagination: any,
  ): Promise<TokenEntity[]> {
    return await this.tokenService.getByBlock(block, pagination);
  }

  @ApiOperation({ summary: 'Get tokens by deployer address' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/by-deployer/:address')
  async getByDeployer(
    @Param('address', LowercasePipe) address: string,
    @Pagination() pagination: any,
  ): Promise<TokenEntity[]> {
    return await this.tokenService.getByDeployer(address, pagination);
  }

  @ApiOperation({ summary: 'Get tokens by transaction id' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/by-txid/:txid')
  async getByTxId(
    @Param('txid', LowercasePipe) txid: string,
    @Pagination() pagination: any,
  ): Promise<TokenEntity[]> {
    return await this.tokenService.getByTxId(txid, pagination);
  }

  @ApiOperation({ summary: 'Get all the holders for a specific ticker' })
  @ApiResponse({
    status: 200,
    type: String,
  })
  @Get('/holders/:ticker')
  async getHoldersByTicker(
    @Param('ticker', LowercasePipe) ticker: string,
  ): Promise<
    {
      address: string;
      amount: string;
    }[]
  > {
    return await this.tokenService.getHoldersByTicker(ticker);
  }

  @ApiOperation({ summary: 'Get a specific token balance for a given address' })
  @ApiResponse({
    status: 200,
    type: TokenEntity,
  })
  @Get('/get-balance/:ticker/:address')
  async getBalanceByAddress(
    @Param('ticker', LowercasePipe) ticker: string,
    @Param('address', LowercasePipe) address: string,
  ): Promise<TokenEntity> {
    return await this.tokenService.getBalance(address, ticker);
  }

  @ApiOperation({ summary: 'Get all tokens held by a given address' })
  @ApiResponse({
    status: 200,
    type: [TokenEntity],
  })
  @Get('/balances/:address')
  async getTokensByAddress(
    @Param('address', LowercasePipe) address: string,
  ): Promise<TokenEntity[]> {
    return await this.tokenService.getBalancesForAddress(address);
  }
}
