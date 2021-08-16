/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { prop } from '@typegoose/typegoose';

export default abstract class Entity {
  /**
   * the snowflake identifier
   */
  @prop()
  public _id!: string;

  /**
   * find or create a document
   * @param _id - the ID to query by
   */
  public static async ensure(this: ReturnModelType<any>, _id: string): Promise<DocumentType<any>> {
    const document = await this.findById(_id);
    return document ?? new this({ _id });
  }
}
