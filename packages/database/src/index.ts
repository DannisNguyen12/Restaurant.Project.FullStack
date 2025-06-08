import { PrismaClient } from './generated/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())