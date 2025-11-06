'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { sendEmail } from './email';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export const affiliateUpsertSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  displayName: z.string().min(3),
  location: z.string().optional(),
  serviceType: z.string().optional(),
  whatsapp: z.string().optional(),
  emailPublic: z.string().email().optional(),
  photoUrl: z.string().url().optional(),
  socialLinks: z
    .array(z.object({ platform: z.string(), url: z.string().url() }))
    .max(5)
    .optional(),
  isActive: z.boolean().optional()
});

export async function upsertAffiliate(input: z.infer<typeof affiliateUpsertSchema>) {
  const data = affiliateUpsertSchema.parse(input);

  const password = data.id ? undefined : Math.random().toString(36).slice(-8);
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

  const user = await prisma.$transaction(async (tx) => {
    if (data.id) {
      return tx.user.update({
        where: { id: data.id },
        data: {
          email: data.email,
          affiliate: {
            upsert: {
              update: {
                displayName: data.displayName,
                location: data.location,
                serviceType: data.serviceType,
                whatsapp: data.whatsapp,
                emailPublic: data.emailPublic,
                photoUrl: data.photoUrl,
                isActive: data.isActive ?? true,
                socialLinks: {
                  deleteMany: {},
                  create: data.socialLinks?.map((link) => ({ platform: link.platform, url: link.url })) ?? []
                }
              },
              create: {
                displayName: data.displayName,
                location: data.location,
                serviceType: data.serviceType,
                whatsapp: data.whatsapp,
                emailPublic: data.emailPublic,
                photoUrl: data.photoUrl,
                isActive: data.isActive ?? true,
                socialLinks: {
                  create: data.socialLinks?.map((link) => ({ platform: link.platform, url: link.url })) ?? []
                }
              }
            }
          }
        }
      });
    }

    return tx.user.create({
      data: {
        email: data.email,
        passwordHash: passwordHash!,
        role: 'AFILIADO',
        affiliate: {
          create: {
            displayName: data.displayName,
            location: data.location,
            serviceType: data.serviceType,
            whatsapp: data.whatsapp,
            emailPublic: data.emailPublic,
            photoUrl: data.photoUrl,
            isActive: true,
            socialLinks: {
              create: data.socialLinks?.map((link) => ({ platform: link.platform, url: link.url })) ?? []
            }
          }
        }
      }
    });
  });

  if (!data.id && password) {
    await sendEmail({
      to: user.email,
      subject: 'Tus credenciales de Invitado Afiliados',
      html: `<p>Hola ${user.affiliate?.displayName ?? ''},</p><p>Tu usuario es <strong>${user.email}</strong> y tu contraseña temporal es <strong>${password}</strong>.</p>`
    });
  }

  revalidatePath('/admin/afiliados');
  return user;
}
