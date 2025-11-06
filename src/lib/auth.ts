import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './prisma';
import { sendEmail } from './email';

export const roleHierarchy = {
  SUPERADMIN: 2,
  AFILIADO: 1
} as const;

export const credentialsSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  password: z.string().min(6, { message: 'La contraseña es obligatoria' })
});

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Correo', type: 'email', placeholder: 'tu@correo.com' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { affiliate: true }
        });

        if (!user) return null;
        if (user.role === 'AFILIADO' && !user.affiliate?.isActive) {
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role
        };
      }
    }),
    EmailProvider({
      id: 'magic-link',
      name: 'Magic Link',
      from: process.env.RESEND_FROM ?? 'no-reply@invitado.mx',
      server: process.env.SMTP_URL || undefined,
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendEmail({
          to: identifier,
          subject: 'Acceso mágico a Invitado Afiliados',
          html: `<p>Haz clic para ingresar:</p><p><a href=\"${url}\">${url}</a></p>`
        });
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};
