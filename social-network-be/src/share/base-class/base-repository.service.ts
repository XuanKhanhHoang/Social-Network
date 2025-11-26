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

  async findManyByIds<TResult = T>(
    ids: string[],
    options?: BaseQueryOptions<T>,
  ): Promise<TResult[]> {
    const { projection, session, ...restOptions } = options || {};
    const query = this.model.find(
      { _id: { $in: ids } } as FilterQuery<T>,
      projection,
      restOptions,
    );
    if (session) {
      query.session(session);
    }
    return query.exec() as Promise<TResult[]>;
  }

  async findManyLeanedByIds<TResult = T>(
    ids: string[],
    options?: BaseQueryOptions<T>,
  ): Promise<TResult[]> {
    const { projection, session, ...restOptions } = options || {};
    const query = this.model.find(
      { _id: { $in: ids } } as FilterQuery<T>,
      projection,
      restOptions,
    );
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

  async findById<TResult extends Partial<T> = T>(
    id: string,
    options?: BaseQueryOptions<T>,
  ): Promise<TResult | null> {
    const { projection, session, ...restOptions } = options || {};
    const query = this.model.findById(id, projection, restOptions);
    if (session) {
      query.session(session);
    }
    return query.exec() as any;
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

  async updateByIdAndGet<P extends keyof T = keyof T>(
    id: string,
    updateData: UpdateQuery<T>,
    options?: BaseQueryOptions<T>,
  ): Promise<T | Pick<T, P> | null> {
    return this.model
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
        ...options,
      })
      .exec() as Promise<T | Pick<T, P> | null>;
  }

  async updateMany(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    session?: ClientSession,
  ): Promise<UpdateWriteOpResult> {
    return this.model.updateMany(filter, updateData, { session }).exec();
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
