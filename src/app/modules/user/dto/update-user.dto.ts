import { z } from 'zod';
import { InputType, Field } from '@nestjs/graphql';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().optional(),
  image: z.string().url().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  image?: string;
}
