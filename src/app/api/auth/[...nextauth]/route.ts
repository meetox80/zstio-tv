import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { GetUserByUsername } from '@/lib/db';
import bcrypt from 'bcrypt';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        const _User = GetUserByUsername(credentials.username);
        if (!_User) return null;
        
        const _PasswordMatch = await bcrypt.compare(credentials.password, _User.password);
        if (!_PasswordMatch) return null;
        
        return {
          id: _User.id.toString(),
          name: _User.username
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

export { handler as GET, handler as POST }; 