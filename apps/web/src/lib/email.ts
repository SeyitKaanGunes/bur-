import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'Burcum <noreply@burcum.site>';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verifyUrl = `${APP_URL}/dogrula?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Email Adresinizi Doğrulayın - Burcum',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0c29; color: #ffffff; padding: 40px 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px;">
              <h1 style="text-align: center; margin-bottom: 8px; background: linear-gradient(135deg, #a78bfa, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">✨ Burcum</h1>

              <h2 style="text-align: center; color: #ffffff; margin-bottom: 24px;">Hoş Geldin, ${name}!</h2>

              <p style="color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">
                Burcum'a kayıt olduğun için teşekkürler! Email adresini doğrulamak için aşağıdaki butona tıkla:
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600;">
                  Email Adresimi Doğrula
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 14px; margin-bottom: 16px;">
                Eğer buton çalışmıyorsa, bu linki tarayıcına yapıştır:
              </p>
              <p style="color: #6366f1; font-size: 12px; word-break: break-all;">
                ${verifyUrl}
              </p>

              <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 32px 0;">

              <p style="color: #6b7280; font-size: 12px; text-align: center;">
                Bu email'i sen talep etmediysen, görmezden gelebilirsin.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Email gönderilemedi');
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    // Development'ta hata fırlatma, sadece log'la
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Email would be sent to', email);
      console.log('Verification URL:', verifyUrl);
      return { id: 'dev-mode' };
    }
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${APP_URL}/sifre-sifirla?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Şifre Sıfırlama - Burcum',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0c29; color: #ffffff; padding: 40px 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px;">
              <h1 style="text-align: center; margin-bottom: 8px; background: linear-gradient(135deg, #a78bfa, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">✨ Burcum</h1>

              <h2 style="text-align: center; color: #ffffff; margin-bottom: 24px;">Şifre Sıfırlama</h2>

              <p style="color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">
                Merhaba ${name}, şifreni sıfırlamak için bir istek aldık. Şifreni sıfırlamak için aşağıdaki butona tıkla:
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600;">
                  Şifremi Sıfırla
                </a>
              </div>

              <p style="color: #f87171; font-size: 14px; margin-bottom: 16px;">
                ⚠️ Bu link 1 saat içinde geçerliliğini yitirecektir.
              </p>

              <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 32px 0;">

              <p style="color: #6b7280; font-size: 12px; text-align: center;">
                Bu isteği sen yapmadıysan, bu email'i görmezden gelebilirsin. Şifren değişmeyecektir.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Email gönderilemedi');
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Password reset email would be sent to', email);
      console.log('Reset URL:', resetUrl);
      return { id: 'dev-mode' };
    }
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string, zodiacSign: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Hoş Geldin ${name}! ✨ - Burcum`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0c29; color: #ffffff; padding: 40px 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px;">
              <h1 style="text-align: center; margin-bottom: 8px; background: linear-gradient(135deg, #a78bfa, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">✨ Burcum</h1>

              <h2 style="text-align: center; color: #ffffff; margin-bottom: 24px;">Hoş Geldin, ${name}!</h2>

              <p style="color: #d1d5db; line-height: 1.6; margin-bottom: 16px;">
                Burcum ailesine katıldığın için çok mutluyuz! Artık ${zodiacSign} burcu için kişiselleştirilmiş yorumlara erişebilirsin.
              </p>

              <p style="color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">
                Seni neler bekliyor:
              </p>

              <ul style="color: #d1d5db; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
                <li>📅 Günlük burç yorumları</li>
                <li>📆 Haftalık ve aylık öngörüler</li>
                <li>💕 Burç uyumluluk analizi</li>
                <li>🔮 Kişisel AI danışman (Premium)</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${APP_URL}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600;">
                  Günlük Yorumumu Gör
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 32px 0;">

              <p style="color: #6b7280; font-size: 12px; text-align: center;">
                Yıldızlar seninle olsun! ⭐
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Welcome email error:', error);
    }

    return data;
  } catch (error) {
    console.error('Welcome email error:', error);
    // Welcome email başarısız olursa kritik değil
    return null;
  }
}
