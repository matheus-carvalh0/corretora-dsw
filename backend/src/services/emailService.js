const nodemailer = require('nodemailer');

// Cria o transporter reutilizável com Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true para 465, false para 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envia e-mail de recuperação de senha com o token.
 * @param {string} to - E-mail do destinatário
 * @param {string} name - Nome do usuário
 * @param {string} resetToken - Token de recuperação
 */
const sendResetPasswordEmail = async (to, name, resetToken) => {
  const fromName = process.env.SMTP_FROM_NAME || 'Corretora DSW';
  const from = `"${fromName}" <${process.env.SMTP_USER}>`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0B1420; border-radius: 12px; overflow: hidden; border: 1px solid #28384D;">
      <!-- Header -->
      <div style="background: linear-gradient(180deg, #121E2E 0%, #0B1420 100%); padding: 28px 32px 20px; border-bottom: 2px solid #C7A042;">
        <h1 style="margin: 0; font-size: 20px; color: #ECEAE1; font-weight: 600;">
          📈 <span style="color: #DDBD6A;">Corretora</span> DSW
        </h1>
      </div>

      <!-- Body -->
      <div style="padding: 28px 32px;">
        <p style="color: #AAB6C6; font-size: 15px; margin: 0 0 16px;">
          Olá <strong style="color: #ECEAE1;">${name}</strong>,
        </p>
        <p style="color: #AAB6C6; font-size: 15px; margin: 0 0 20px;">
          Recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo para concluir o processo:
        </p>

        <!-- Token -->
        <div style="background: #1A2A3D; border: 1px solid #28384D; border-left: 3px solid #C7A042; border-radius: 8px; padding: 16px 20px; margin: 0 0 20px; text-align: center;">
          <p style="color: #6E7E92; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">
            Código de recuperação
          </p>
          <p style="color: #DDBD6A; font-family: 'Courier New', monospace; font-size: 14px; font-weight: 700; margin: 0; word-break: break-all; line-height: 1.6;">
            ${resetToken}
          </p>
        </div>

        <p style="color: #6E7E92; font-size: 13px; margin: 0 0 8px;">
          ⏱ Este código expira em <strong style="color: #AAB6C6;">1 hora</strong>.
        </p>
        <p style="color: #6E7E92; font-size: 13px; margin: 0;">
          Se você não solicitou a redefinição de senha, ignore este e-mail.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #121E2E; padding: 16px 32px; border-top: 1px solid #28384D;">
        <p style="color: #6E7E92; font-size: 12px; margin: 0; text-align: center;">
          Corretora DSW — Simulador de Corretora de Ações
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject: 'Recuperação de Senha — Corretora DSW',
    html,
  });
};

/**
 * Verifica se a conexão SMTP está funcionando.
 */
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('Conexão SMTP verificada com sucesso.');
    return true;
  } catch (err) {
    console.warn('Aviso: Conexão SMTP não disponível.', err.message);
    return false;
  }
};

module.exports = { sendResetPasswordEmail, verifyConnection };
