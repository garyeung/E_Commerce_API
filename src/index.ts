import 'reflect-metadata';
import express from 'express';
import { env } from './config/env.config';
import initializeRootRouter from './routers/root.router';
import errorHandler from './middlewares/errorHandler';
import path from 'path';
import rateLimiter from './middlewares/rateLimitHandler';

const server = express();

server.use(express.json());
server.use(express.static(path.join(__dirname, '..', 'public')));

async function main() {
    try {
        const rootRouter = await initializeRootRouter();
        server.use(rateLimiter,rootRouter);
        server.use(errorHandler);

        server.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`);
        });
    } catch (e) {
        console.error('Failed to run server', e);
        process.exit(1);
    }
}
//main();

export async function serverforTest() {
    const rootRouter = await initializeRootRouter();
    server.use(rateLimiter,rootRouter);
    server.use(errorHandler);


    return server;
}