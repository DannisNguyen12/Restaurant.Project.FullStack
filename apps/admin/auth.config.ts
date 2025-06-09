import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from "../../packages/database/src/index";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Email and Password',
            credentials: {
                email: { 
                    label: "Email", 
                    type: "email",
                    placeholder: "Enter your email"
                },
                password: { 
                    label: "Password", 
                    type: "password",
                    placeholder: "Enter your password"
                }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                    });

                    if (!user || !user.password) {
                        throw new Error('Invalid email or password');
                    }

                    const isValid = await compare(credentials.password, user.password);
                    if (!isValid) {
                        throw new Error('Invalid email or password');
                    }

                    return { 
                        id: user.id.toString(), 
                        email: user.email, 
                        name: user.name || '',
                        role: user.role || 'USER'
                    };
                } catch (error) {
                    console.error('Error during credentials authorization:', error);
                    throw new Error('Authentication failed');
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || 'USER';
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/signin',
        error: '/signin',
    },
    session: {
        strategy: "jwt",
    },
};
