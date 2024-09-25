import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token } from 'src/schemas/token';
import { Utxo } from 'src/schemas/utxo';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger: Logger;
  private fid: number;

  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    @InjectModel(Utxo.name) private utxoModel: Model<Utxo>,
  ) {
    this.logger = new Logger(IndexerService.name);
  }

  async onModuleInit() {
    const records = await this.tokenModel.countDocuments().exec();
    if (records === 1) this.fid = 0;
    else this.fid = records;
  }

  async getAll() {
    return await this.tokenModel.find().exec();
  }

  async updateRemaining(ticker: string, remaining: string) {
    try {
      const token = await this.tokenModel.findOne({ ticker }).exec();
      if (token) {
        token.remaining = remaining;
        await token.save();
      } else {
        this.logger.error(`Token ${ticker} not found`);
      }
    } catch (e) {
      this.logger.error(`Error occurred during update of token ${ticker}`);
      this.logger.error(e);
    }
  }

  async saveToken(tokenData: any) {
    try {
      const existingToken = await this.tokenModel
        .findOne({ ticker: tokenData.ticker })
        .exec();

      if (existingToken) {
        await this.updateRemaining(tokenData.ticker, tokenData.remaining);
        await existingToken.save();
      } else {
        tokenData.fid = this.fid;
        const newToken = new this.tokenModel(tokenData);
        await newToken.save();
        this.fid += 1;
      }
    } catch (e) {
      this.logger.error(
        `Error occurred during save or update of token ${tokenData.ticker}`,
      );
      this.logger.error(e);
    }
  }

  async addUtxo(data: any, block: number) {
    try {
      const token = await this.tokenModel.findOne({ ticker: data.tick }).exec();
      if (token) {
        const utxo: Utxo = {
          address: data.addr,
          txId: data.txid,
          vout: data.vout,
          amount: data.amt,
          decimals: token.decimals,
          ticker: data.tick,
          block: block,
        };
        const newUtxo = new this.utxoModel(utxo);
        await newUtxo.save();
      } else {
        this.logger.error(`Token ${data.tick}:${data.id} not found`);
      }
    } catch (e) {
      this.logger.error(`Error occurred when saving new utxo ${data.txid}`);
      this.logger.error(e);
    }
  }

  async deleteUtxo(txId: string, vout: number) {
    try {
      const utxo = await this.utxoModel.findOneAndDelete({ txId, vout }).exec();
      if (!utxo) {
        this.logger.error(`UTXO with txId ${txId} and vout ${vout} not found.`);
      }
    } catch (e) {
      this.logger.error(
        `Error occurred when deleting UTXO with txId ${txId} and vout ${vout}.`,
      );
      this.logger.error(e);
    }
  }

  async removeAllRecordsByBlock(block: number) {
    try {
      await this.tokenModel.deleteMany({ block }).exec();
      await this.utxoModel.deleteMany({ block }).exec();
      this.fid = await this.tokenModel.countDocuments().exec();
    } catch (e) {
      this.logger.error(
        `Error occurred when removing tokens for block ${block}`,
      );
      this.logger.error(e);
    }
  }
}
