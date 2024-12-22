import dotenv from 'dotenv';

dotenv.config();

const _config = {
    port : process.env.PORT || 6969
}

const config = Object.freeze(_config);

export { config };