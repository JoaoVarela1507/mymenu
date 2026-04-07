import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import os

def send_reset_email(email: str, reset_token: str) -> bool:
    """
    Send a password reset email with a secure reset link.
    Uses SMTP (Gmail recommended) to send HTML formatted emails.
    
    Args:
        email: Recipient email address
        reset_token: JWT reset token to include in reset link
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Get frontend URL from environment or use default
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        # Create email message
        message = MIMEMultipart()
        message["From"] = settings.smtp_user
        message["To"] = email
        message["Subject"] = "Password Reset Request - MyMenu"
        
        # Create HTML body with professional formatting
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 4px;">
                    <h2 style="color: #2c3e50;">Password Reset Request</h2>
                    
                    <p>Hello,</p>
                    
                    <p>We received a request to reset your password. If you made this request, click the button below to reset your password:</p>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
                    </p>
                    
                    <p>Or copy this link in your browser: <br/><code style="background-color: #f5f5f5; padding: 10px; display: block; word-break: break-all;">{reset_link}</code></p>
                    
                    <p style="color: #e74c3c;"><strong>⚠️ This link expires in 24 hours</strong></p>
                    
                    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #7f8c8d;">
                        If you did not request this password reset, please ignore this email or contact our support team.
                    </p>
                    
                    <p style="font-size: 12px; color: #7f8c8d;">
                        Best regards,<br/>
                        <strong>MyMenu Team</strong>
                    </p>
                </div>
            </body>
        </html>
        """
        
        message.attach(MIMEText(body, "html"))
        
        # Send email via SMTP
        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
        
        return True
    except Exception as e:
        print(f"Error sending password reset email to {email}: {str(e)}")
        return False
