import {rateLimit} from 'express-rate-limit'

const rateLimiter = rateLimit({
    windowMs: 60*1000, // 1 minute
    limit: 60,     // limit each IP to 20 requests per 'window'
    standardHeaders: true
})

export default rateLimiter;