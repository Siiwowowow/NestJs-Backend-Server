import { Injectable } from '@nestjs/common';
import { IPaginatedResult, IPaginationOptions, PaginationMeta } from '../../common/interfaces';

@Injectable()
export class PaginationService {
  async paginate<T>(
    modelDelegate: {
      findMany: (args: any) => Promise<T[]>;
      count: (args: any) => Promise<number>;
    },
    args: { where?: any; include?: any; select?: any; orderBy?: any } = {},
    options: IPaginationOptions = {},
  ): Promise<IPaginatedResult<T>> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const [totalItems, data] = await Promise.all([
      modelDelegate.count({ where: args.where }),
      modelDelegate.findMany({
        ...args,
        skip,
        take: limit,
        orderBy: args.orderBy || (options.sortBy ? { [options.sortBy]: options.sortOrder || 'desc' } : { createdAt: 'desc' }),
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    const meta: PaginationMeta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      data,
      meta,
    };
  }

  formatMeta(page: number, limit: number, totalItems: number): PaginationMeta {
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
