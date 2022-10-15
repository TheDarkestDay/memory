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
        domain: process.env.NX_SET_COOKIE_DOMAIN,
        path: '/'
      });
    }
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;