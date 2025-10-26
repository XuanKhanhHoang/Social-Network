import {
  Model,
  FilterQuery,
  ClientSession,
  Document,
  UpdateQuery,
  UpdateWriteOpResult,
  ProjectionType,
  QueryOptions,
  AnyBulkWriteOperation,
  MongooseBulkWriteResult,
} from 'mongoose';

export interface BaseQueryOptions<T> extends QueryOptions<T> {
  projection?: ProjectionType<T>;
  session?: ClientSession;
}

export abstract class BaseRepository<T extends Document> {
  protected constructor(protected readonly model: Model<T>) {}

  async find(
    filter: FilterQuery<T>,
    options?: BaseQueryOptions<T>,
  ): Promise<T[]> {
    const { projection, session, ...restOptions } = options || {};
    const query = this.model.find(filter, projection, restOptions);
    if (session) {
      query.session(session);
    }
    return query.exec();
  }

  async findLeaned<TResult>(
    filter: FilterQuery<T>,
    options?: BaseQueryOptions<T>,
  ): Promise<TResult[]> {
    const { projection, session, ...restOptions } = options || {};
    const query = this.model.find(filter, projection, restOptions);
    if (session) {
      query.session(session);
    }
    return query.lean().exec() as Promise<TResult[]>;
  }
  async checkIdExist(
    id: string,
    options?: BaseQueryOptions<T>,
  ): Promise<T | null> {
    const { projection, session, ...restOptions } = options || {};
    const query = this.model.findById(id, projection, restOptions);
    if (session) {
      query.session(session);
    }
    return query.exec();
  }
  async findById(id: string, options?: BaseQueryOptions<T>): Promise<T | null> {
    const { projection, session, ...restOptions } = options || {};
    const query = this.model.findById(id, projection, restOptions);
    if (session) {
      query.session(session);
    }
    return query.exec();
  }

  async findLeanedById<TResult>(
    id: string,
    options?: BaseQueryOptions<T>,
  ): Promise<TResult | null> {
    const { projection, session, ...restOptions } = options || {};
    const query = this.model.findById(id, projection, restOptions);
    if (session) {
      query.session(session);
    }
    return query.lean().exec() as Promise<TResult | null>;
  }
  async findOne(
    filter: FilterQuery<T>,
    options?: BaseQueryOptions<T>,
  ): Promise<T | null> {
    const { projection, session, ...restOptions } = options || {};
    const query = this.model.findOne(filter, projection, restOptions);
    if (session) {
      query.session(session);
    }
    return query.exec();
  }

  async findOneLean<TResult>(
    filter: FilterQuery<T>,
    options?: BaseQueryOptions<T>,
  ): Promise<TResult | null> {
    const { projection, session, ...restOptions } = options || {};
    const query = this.model.findOne(filter, projection, restOptions);
    if (session) {
      query.session(session);
    }
    return query.lean().exec() as Promise<TResult | null>;
  }
  async updateById(
    id: string,
    updateData: UpdateQuery<T>,
    session?: ClientSession,
  ): Promise<UpdateWriteOpResult> {
    return this.model
      .updateOne({ _id: id } as FilterQuery<T>, updateData, { session })
      .exec();
  }

  async updateByIdAndGet(
    id: string,
    updateData: UpdateQuery<T>,
    session?: ClientSession,
  ): Promise<T | null> {
    const options: { new: boolean; session?: ClientSession } = {
      new: true,
    };
    if (session) {
      options.session = session;
    }
    return this.model.findByIdAndUpdate(id, updateData, options).exec();
  }

  async bulkWrite(
    ops: AnyBulkWriteOperation<T>[],
    session?: ClientSession,
  ): Promise<MongooseBulkWriteResult> {
    return this.model.bulkWrite(ops, { session });
  }

  async save(document: T, session?: ClientSession): Promise<T> {
    return document.save({ session });
  }
}
