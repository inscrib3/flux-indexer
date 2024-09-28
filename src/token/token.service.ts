import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenEntity } from 'src/entities/token';
import { Token } from 'src/schemas/token';
import { Utxo } from 'src/schemas/utxo';
import { findWithTotalCount } from 'src/utils/helpers';

@Injectable()
export class TokenService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    @InjectModel(Utxo.name) private utxoModel: Model<Utxo>,
  ) {
    this.logger = new Logger(TokenService.name);
  }

  async getAll(pagination = null): Promise<TokenEntity[]> {
    const tokens = await findWithTotalCount(this.tokenModel, {}, pagination);
    return tokens;
  }

  async get(ticker: string): Promise<TokenEntity> {
    const token: any = await this.tokenModel.findOne({ ticker }).exec();
    if (token) return token;
    else throw new NotFoundException({ error: 'token not found' });
  }

  async getByTicker(ticker: string, pagination = null): Promise<TokenEntity[]> {
    const tokens = await findWithTotalCount(
      this.tokenModel,
      { ticker },
      pagination,
    );
    return tokens;
  }

  async getByTxId(txId: string, pagination = null): Promise<TokenEntity[]> {
    const tokens = await findWithTotalCount(
      this.tokenModel,
      { txId },
      pagination,
    );
    return tokens;
  }

  async getByFid(fid: number): Promise<TokenEntity> {
    const token: any = await this.tokenModel.findOne({ fid }).exec();
    if (token) return token;
    else throw new NotFoundException({ error: 'token not found' });
  }

  async getByFidRange(
    start: number,
    stop: number,
    pagination = null,
  ): Promise<TokenEntity[]> {
    const query = {
      fid: { $gte: start, $lte: stop },
    };
    const tokens = await findWithTotalCount(this.tokenModel, query, pagination);
    return tokens;
  }

  async getByBlock(block: number, pagination = null): Promise<TokenEntity[]> {
    const tokens = await findWithTotalCount(
      this.tokenModel,
      { block },
      pagination,
    );
    return tokens;
  }

  async getByDeployer(
    beneficiaryAddress: string,
    pagination = null,
  ): Promise<TokenEntity[]> {
    const tokens = await findWithTotalCount(
      this.tokenModel,
      { beneficiaryAddress },
      pagination,
    );
    return tokens;
  }

  async findByTickerSimilarity(
    ticker: string,
    pagination = null,
  ): Promise<TokenEntity[]> {
    const regex = new RegExp(ticker, 'i');
    const query = { ticker: { $regex: regex } };
    const tokens = await findWithTotalCount(this.tokenModel, query, pagination);
    return tokens;
  }

  async getBalance(address: string, ticker: string): Promise<TokenEntity> {
    const token: any = await this.get(ticker);
    const utxos = await this.utxoModel.find({ address, ticker }).exec();
    if (utxos.length === 0) {
      throw new NotFoundException({ error: 'token not found' });
    }

    let totalAmount = 0n;
    utxos.forEach((utxo: Utxo) => {
      totalAmount += BigInt(utxo.amount);
    });

    token.amount = totalAmount.toString();

    return token;
  }

  async getBalancesForAddress(address: string): Promise<TokenEntity[]> {
    const utxos = await this.utxoModel.find({ address }).exec();
    const balanceMap = new Map<string, bigint>();
    utxos.forEach((utxo: Utxo) => {
      const key = `${utxo.ticker}`;
      let value = balanceMap.get(key) || 0n;
      value += BigInt(utxo.amount);
      balanceMap.set(key, value);
    });

    const keys = Array.from(balanceMap.keys());
    const tokens = await Promise.all(
      keys.map(async (key) => {
        const token: any = await this.get(key);
        token.amount = balanceMap.get(key)?.toString();
        return token;
      }),
    );

    return tokens;
  }

  async getHoldersByToken(ticker: string): Promise<string> {
    const balanceMap = new Map<string, bigint>();
    const utxos = await this.utxoModel.find({ ticker }).exec();
    utxos.forEach((utxo: Utxo) => {
      const address = utxo.address;
      let balance = balanceMap.get(address) || 0n;
      balance += BigInt(utxo.amount);
      balanceMap.set(address, balance);
    });

    const holders = Array.from(balanceMap, ([address, balance]) => ({
      address,
      amount: balance.toString(),
    }));

    return JSON.stringify(holders);
  }

  async getHoldersByTicker(ticker: string): Promise<
    {
      address: string;
      amount: string;
    }[]
  > {
    const token = await this.tokenModel.find({ ticker }).exec();
    if (token.length === 0) {
      throw new NotFoundException({ error: 'token not found' });
    }

    const utxos = await this.utxoModel.find({ ticker }).exec();

    return utxos.reduce((acc, cur) => {
      const index = acc.findIndex((item) => item.address === cur.address);
      if (index === -1) {
        acc.push({
          address: cur.address,
          amount: cur.amount,
        });
      } else {
        acc[index].amount = (
          BigInt(acc[index].amount) + BigInt(cur.amount)
        ).toString();
      }
      return acc;
    }, [] as { address: string; amount: string }[]);
  }
}
