import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { GetUserByUsername } from '@/lib/db';
import bcrypt from 'bcrypt';

const Handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        const User = await GetUserByUsername(credentials.username);
        if (!User) return null;
        
        const PasswordMatch = await bcrypt.compare(credentials.password, User.password);
        if (!PasswordMatch) return null;
        
        return {
          id: User.id.toString(),
          name: User.username
        };
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  }
});

export { Handler as GET, Handler as POST }; 