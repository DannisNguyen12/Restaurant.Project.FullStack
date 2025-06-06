import * as bcrypt from "bcryptjs";
import * as dotenv from 'dotenv';

export async function encryptPassword(password: string): Promise<string> {
  dotenv.config();

  try {
    const saltRoundsEnv = process.env.BCRYPT_COST_FACTOR;
    if (!saltRoundsEnv) {
      throw new Error('BCRYPT_COST_FACTOR must be set in environment variables');
    }
    const saltRounds = parseInt(saltRoundsEnv);

    if (isNaN(saltRounds)) {
      throw new Error('BCRYPT_COST_FACTOR is not a valid number');
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error encrypting password:', error);
    throw new Error('Failed to encrypt password');
  }
}