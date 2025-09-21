import { z } from 'zod';

export function zodEndpointValidation(schema: z.ZodType, testData: any) {
  return schema.safeParse(testData);
}
