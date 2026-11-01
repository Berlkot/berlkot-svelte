import { handle as protector } from './protector';
import { handle as auth } from './auth';
import { handle as logger, handleError as loggerErrorHandler } from './logger';
// import { handle as locale } from './locale';

export const handleOrder = [auth, /* locale, */ protector, logger];
export const handleErrorOrder = [loggerErrorHandler];
