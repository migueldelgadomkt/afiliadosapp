import { PrismaClient, InvitationStatus, OrderStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.order.deleteMany();
  await prisma.eventInvitation.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.affiliateProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.resource.deleteMany();

  const adminPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@invitado.mx',
      passwordHash: adminPassword,
      role: Role.SUPERADMIN
    }
  });

  const affiliatesData = [
    {
      email: 'andrea@partners.mx',
      displayName: 'Andrea Eventos',
      location: 'CDMX',
      serviceType: 'Planner de bodas',
      whatsapp: '+52 55 1234 5678',
      emailPublic: 'hola@andreaeventos.mx',
      photoUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39',
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com/andreaeventos' },
        { platform: 'web', url: 'https://andreaeventos.mx' }
      ]
    },
    {
      email: 'carlos@memories.mx',
      displayName: 'Memories Studio',
      location: 'Guadalajara',
      serviceType: 'Fotógrafo',
      whatsapp: '+52 33 9876 5432',
      emailPublic: 'ventas@memories.mx',
      photoUrl: 'https://images.unsplash.com/photo-1520854221050-0f4caff449fb',
      socialLinks: [{ platform: 'instagram', url: 'https://instagram.com/memoriesstudio' }]
    },
    {
      email: 'lupita@fiestasvip.mx',
      displayName: 'Fiestas VIP',
      location: 'Monterrey',
      serviceType: 'Salón de eventos',
      whatsapp: '+52 81 4444 5566',
      emailPublic: 'contacto@fiestasvip.mx',
      photoUrl: 'https://images.unsplash.com/photo-1512427691650-1e0c04d143e4',
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com/fiestasvip' },
        { platform: 'instagram', url: 'https://instagram.com/fiestasvip' }
      ]
    }
  ];

  const affiliateUsers = await Promise.all(
    affiliatesData.map(async (affiliate) => {
      const passwordHash = await bcrypt.hash('Invitado123!', 10);
      return prisma.user.create({
        data: {
          email: affiliate.email,
          passwordHash,
          role: Role.AFILIADO,
          affiliate: {
            create: {
              displayName: affiliate.displayName,
              location: affiliate.location,
              serviceType: affiliate.serviceType,
              whatsapp: affiliate.whatsapp,
              emailPublic: affiliate.emailPublic,
              photoUrl: affiliate.photoUrl,
              socialLinks: { create: affiliate.socialLinks }
            }
          }
        },
        include: { affiliate: true }
      });
    })
  );

  const invitations = await Promise.all(
    affiliateUsers.flatMap((user, userIndex) => {
      return Array.from({ length: 10 }).map((_, index) =>
        prisma.eventInvitation.create({
          data: {
            code: `INV-${userIndex + 1}-${index + 1}`,
            status: InvitationStatus.DISPONIBLE,
            affiliateId: user.affiliate?.id,
            expiresAt: index % 3 === 0 ? new Date(Date.now() + 1000 * 60 * 60 * 24 * (15 - index)) : null
          }
        })
      );
    })
  );

  await Promise.all(
    affiliateUsers.flatMap((user, userIndex) => {
      return Array.from({ length: 6 }).map((_, index) =>
        prisma.order.create({
          data: {
            affiliateId: user.affiliate!.id,
            status: [
              OrderStatus.DRAFT,
              OrderStatus.PENDIENTE,
              OrderStatus.APROBADO,
              OrderStatus.ENTREGADO,
              OrderStatus.CANCELADO,
              OrderStatus.PENDIENTE
            ][index % 6],
            customerName: `Cliente ${userIndex + 1}-${index + 1}`,
            customerPhone: '+52 55 0000 0000',
            customerEmail: `cliente${userIndex + 1}${index + 1}@correo.mx`,
            notes: index % 2 === 0 ? 'Cliente interesado en paquete premium' : null,
            eventInvitationId: invitations[userIndex * 10 + index]?.id
          }
        })
      );
    })
  );

  await prisma.resource.createMany({
    data: [
      {
        title: 'Kit de logos Invitado',
        description: 'Logotipos oficiales en PNG y SVG',
        url: 'https://res.cloudinary.com/demo/image/upload/v1699999999/kit-logos.zip'
      },
      {
        title: 'Guía de ventas',
        description: 'Mensajes sugeridos y secuencia comercial',
        url: 'https://res.cloudinary.com/demo/image/upload/v1699999999/guia-ventas.pdf'
      }
    ]
  });

  console.log({ admin: admin.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
