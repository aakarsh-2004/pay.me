import db from '../../../../../packages/db/index'
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt'

interface tokenType {
    name: string,
    email?: string,
    picture?: string,
    sub: string,
    iat: number,
    exp: number,
    jti: string
}

interface sessionType {
    user: {
        id: string,
        name: string,
        email: string,
        image?: string
    },
    expires: string
}

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                phone: { label: "Phone number", type: "text", placeholder: '91xxxxxxxx' },
                password: { label: "Password", type: "password", placeholder: 'password...' }
            },
            async authorize(credentials: any) {
                const hashedPassword = await bcrypt.hash(credentials.password, 10);
                const existingUser = await db.user.findFirst({
                    where: {
                        number: credentials.phone
                    }
                });

                if(existingUser) {
                    const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
                    if(passwordValidation) {
                        return {
                            id: existingUser.id,
                            name: existingUser.name,
                            email: existingUser.email
                        }
                    }
                    return null;
                }

                try {
                    const user = await db.user.create({
                        data: {
                            number: credentials.phone,
                            password: hashedPassword
                        }
                    })

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.number
                    }
                } catch (error) {
                    console.log("error while creating user " + error);
                }
                return null;
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        })
    ],
    secret: process.env.NEXTAUTH_SECRET || 'secret',
    callbacks: {
        async session({ token, session }: {
            token: tokenType,
            session: sessionType
        }) {
            session.user.id = token.sub;

            return session;
        }
    }
}