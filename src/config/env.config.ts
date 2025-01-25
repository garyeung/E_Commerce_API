import { config } from 'dotenv';
import { cleanEnv, num, port, str } from 'envalid';
config();

function validateEnv(){
    return cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ['development', 'production', 'test'],
        }),
        DB_HOST: str(),
        DB_PORT: port({
            default: 5432,
        }),
        DB_NAME: str(),
        DB_USER: str(),
        DB_PASSWORD: str(),
        PORT: port({default: 3000}),
        SALT_ROUNDS: num(),
        SECRET: str(),
        STRIPE_SECRET_KEY: str(),
        WEBHOOK_SECRET: str(),
        ADMIN_EMAIL: str(),
        ADMIN_PW: str()
    })
}

export const env = validateEnv();