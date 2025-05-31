// Entry point for the database package
import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

export { prisma };
export default prisma;
