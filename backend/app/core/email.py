import smtplib
import asyncio
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def _generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of given length."""
    return "".join(random.choices(string.digits, k=length))


def _send_email_sync(to_email: str, subject: str, html_body: str):
    """Send an email synchronously using SMTP (runs in a thread)."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"AI Era Academy <{settings.SMTP_USER or settings.EMAIL_FROM}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER or settings.EMAIL_FROM, to_email, msg.as_string())


async def send_otp_email(to_email: str, otp: str, purpose: str = "register") -> None:
    """Send the OTP email asynchronously."""
    action = "verify your email address" if purpose == "register" else "sign in securely"
    subject = "Your AI Era Academy Verification Code"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f0f13; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">AI Era Academy</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Your Verification Code</p>
        </div>
        <div style="padding: 40px 32px; color: #e2e8f0; background: #0f0f13;">
            <p style="margin: 0 0 16px; font-size: 16px;">Hi there 👋</p>
            <p style="margin: 0 0 32px; font-size: 15px; color: #94a3b8;">
                Use the code below to {action}. It expires in <strong style="color: #fff;">10 minutes</strong>.
            </p>
            <div style="background: #1e1e2e; border: 2px solid #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #818cf8; font-family: monospace;">
                    {otp}
                </span>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 0;">
                If you didn't request this code, you can safely ignore this email.
            </p>
        </div>
    </div>
    """
    # Run the blocking SMTP call in a thread pool
    await asyncio.to_thread(_send_email_sync, to_email, subject, html_body)


def generate_otp() -> str:
    return _generate_otp()
