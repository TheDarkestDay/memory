import { inferAsyncReturnType } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

export const createContext = async ({ req, res }: CreateFastifyContextOptions) => {
  const playerId = req.cookies?.playerId;

  return { 
    playerId,
    setCookie(name: string, value: any) {
      res.setCookie(name, value, {
        httpOnly: true,
        secure: true,
        domain: 'thedarkestday-memory.com',
        path: '/'
      });
    }
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;