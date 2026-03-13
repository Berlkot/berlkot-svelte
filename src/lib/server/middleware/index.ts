import { handle as protector, handleError as protectorErrorHandler } from './protector';
import { handle as auth } from './auth';
import { handle as logger, handleError as loggerErrorHandler } from './logger';

export const handleOrder = [auth, protector, logger];
export const handleErrorOrder = [protectorErrorHandler, loggerErrorHandler];
