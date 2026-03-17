import { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

interface UserSession extends Session {
    backendToken?: string;
    user: {
        id: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
    };
}

interface UserToken extends JWT {
    accessToken?: string;
    idToken?: string;
    provider?: string;
    userId?: string;
    backendToken?: string;
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, account, user }): Promise<UserToken> {
            const extendedUserToken = token as UserToken;

            if (account && user) {
                extendedUserToken.accessToken = account.access_token;
                extendedUserToken.idToken = account.id_token;
                extendedUserToken.provider = account.provider;
                extendedUserToken.userId = account.providerAccountId;

                if (account.id_token) {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                id_token: account.id_token,
                                email: user.email,
                                name: user.name,
                            }),
                        });
                        if (response.ok) {
                            const data = await response.json();
                            extendedUserToken.backendToken = data.token;
                        }
                    } catch (error) {
                        console.error("Failed to authenticate with backend:", error);
                    }
                }
            }
            return extendedUserToken;
        },

        async session({ session, token }): Promise<UserSession> {
            const extendedSession = session as UserSession;
            const extendedToken = token as UserToken;

            extendedSession.backendToken = extendedToken.backendToken;
            extendedSession.user = {
                id: extendedToken.userId || "",
                email: extendedToken.email,
                name: extendedToken.name,
                image: extendedToken.picture,
            };

            return extendedSession;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
};
