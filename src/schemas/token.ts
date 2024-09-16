import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

@Schema({ timestamps: true })
export class Token {
  @Prop({ required: false })
  fid: number;

  @Prop({ required: false })
  beneficiaryAddress: string;

  @Prop({ required: true, index: true })
  ticker: string;

  @Prop({ required: true })
  decimals: number;

  @Prop({ required: true })
  maxSupply: string;

  @Prop({ required: true })
  limit: number;

  @Prop({
    required: true,
    default: function () {
      return this.maxSupply;
    },
  })
  remaining: string;

  @Prop({ required: true })
  txId: string;

  @Prop({ required: true, index: true })
  block: number;

  @Prop({ required: true })
  bvo: number;

  @Prop({ required: true })
  vo: number;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
