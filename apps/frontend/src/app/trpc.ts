import { createReactQueryHooks } from '@trpc/react';
import { AppRouter } from '@memory/shared';

export const trpc = createReactQueryHooks<AppRouter>();