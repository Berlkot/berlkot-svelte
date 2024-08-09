// i admit, im a lazy fuck who dont wanna to maintain
// own orm approach based on json metadata
// it just became too clunky
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default prisma
