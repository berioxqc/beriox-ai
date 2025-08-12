import nodemailer from 'nodemailer';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Vérifier si l'email est configuré
export function isEmailConfigured(): boolean {
  return !!(process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD);
}

// Envoyer un email de confirmation de compte
export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string
): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn('Email not configured, skipping verification email');
    return false;
  }

  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

  const mailOptions = {
    from: `"Beriox AI" <${process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: 'Confirmez votre compte Beriox AI',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Beriox AI</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${name || &apos;utilisateur&apos;} !</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Merci de vous être inscrit sur Beriox AI. Pour activer votre compte et commencer à utiliser nos agents IA, 
            veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block; 
                      font-weight: bold;">
              Confirmer mon compte
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
          </p>
          
          <p style="color: #667eea; word-break: break-all; margin-bottom: 20px;">
            ${verificationUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Ce lien expirera dans 24 heures pour des raisons de sécurité.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            Si vous n&apos;avez pas créé de compte sur Beriox AI, vous pouvez ignorer cet email.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 14px;">
            © 2024 Beriox AI. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// Envoyer un email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name?: string
): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn('Email not configured, skipping password reset email');
    return false;
  }

  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Beriox AI" <${process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe Beriox AI',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Beriox AI</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${name || &apos;utilisateur&apos;} !</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Beriox AI. 
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block; 
                      font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
          </p>
          
          <p style="color: #667eea; word-break: break-all; margin-bottom: 20px;">
            ${resetUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Ce lien expirera dans 1 heure pour des raisons de sécurité.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Si vous n&apos;avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            Pour des raisons de sécurité, ce lien ne peut être utilisé qu&apos;une seule fois.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 14px;">
            © 2024 Beriox AI. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// Envoyer un email de bienvenue
export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn('Email not configured, skipping welcome email');
    return false;
  }

  const mailOptions = {
    from: `"Beriox AI" <${process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: 'Bienvenue sur Beriox AI ! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Beriox AI</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Bienvenue ${name || &apos;utilisateur&apos;} ! 🎉</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Félicitations ! Votre compte Beriox AI a été confirmé avec succès. 
            Vous êtes maintenant prêt à découvrir le pouvoir de l&apos;intelligence artificielle.
          </p>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🚀 Commencez dès maintenant :</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Créez votre première mission avec nos agents IA</li>
              <li>Explorez nos fonctionnalités avancées</li>
              <li>Découvrez nos plans premium</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/missions" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block; 
                      font-weight: bold;">
              Créer ma première mission
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Si vous avez des questions ou besoin d&apos;aide, n&apos;hésitez pas à nous contacter.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            Merci de faire confiance à Beriox AI pour vos besoins en intelligence artificielle.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 14px;">
            © 2024 Beriox AI. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}


