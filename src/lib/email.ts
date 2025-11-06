import { Resend } from 'resend';
import nodemailer from 'nodemailer';

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'Invitado <no-reply@invitado.mx>',
      to,
      subject,
      html
    });
    return;
  }

  if (!process.env.SMTP_URL) {
    console.warn('No se envió correo: falta configuración de RESEND_API_KEY o SMTP_URL');
    return;
  }

  const transporter = nodemailer.createTransport(process.env.SMTP_URL);
  await transporter.sendMail({
    to,
    from: process.env.RESEND_FROM ?? 'Invitado <no-reply@invitado.mx>',
    subject,
    html
  });
}
