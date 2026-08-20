import DataLoader from 'dataloader';
import { PrismaService } from '../../database/prisma.service';
import { User } from '../../../generated/prisma';

export function createUserLoader(prisma: PrismaService) {
  return new DataLoader<string, User | null>(async (userIds: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: [...userIds],
        },
      },
    });

    const userMap = new Map<string, User>();
    users.forEach((user) => userMap.set(user.id, user));

    return userIds.map((id) => userMap.get(id) || null);
  });
}

export interface IDataLoaders {
  userLoader: ReturnType<typeof createUserLoader>;
}

export function createDataLoaders(prisma: PrismaService): IDataLoaders {
  return {
    userLoader: createUserLoader(prisma),
  };
}
