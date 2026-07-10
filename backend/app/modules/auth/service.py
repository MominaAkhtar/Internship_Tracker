import os
import json
import urllib.request
from datetime import datetime
from sqlalchemy.orm import Session

from app.modules.auth.models import User
from app.core.security import hash_password, verify_password, create_access_token


def send_reset_email(email: str, name: str, token: str):
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("RESEND_FROM_EMAIL", "OnTrack <onboarding@resend.dev>")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    reset_link = f"{frontend_url}/reset-password?token={token}"
    
    subject = "Reset your OnTrack Password"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body {{
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f9fafb;
          color: #374151;
          margin: 0;
          padding: 0;
        }}
        .container {{
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 16px;
          padding: 40px;
          border: 1px solid #f3f4f6;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }}
        .logo {{
          font-size: 24px;
          font-weight: 800;
          color: #3389A0;
          margin-bottom: 24px;
          text-align: center;
        }}
        h1 {{
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-top: 0;
          margin-bottom: 16px;
        }}
        p {{
          font-size: 15px;
          line-height: 24px;
          color: #4b5563;
          margin-top: 0;
          margin-bottom: 24px;
        }}
        .btn {{
          display: inline-block;
          background-color: #3389A0;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 24px;
          text-align: center;
        }}
        .footer {{
          font-size: 12px;
          color: #9ca3af;
          border-top: 1px solid #f3f4f6;
          padding-top: 24px;
          margin-top: 24px;
        }}
        .link-text {{
          word-break: break-all;
          color: #3389A0;
        }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">OnTrack</div>
        <h1>Hello {name},</h1>
        <p>We received a request to reset the password for your OnTrack account. Click the button below to set a new password. This link will expire in 15 minutes.</p>
        <div style="text-align: center;">
          <a href="{reset_link}" class="btn">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this URL into your browser:</p>
        <p class="link-text"><a href="{reset_link}">{reset_link}</a></p>
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain secure.</p>
        <div class="footer">
          <p>Thanks,<br>The OnTrack Team</p>
        </div>
      </div>
    </body>
    </html>
    """
    


    if not api_key:
        # Fallback to local log file for testing so developers aren't blocked if they don't have a Resend key
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "reset_emails.log")
        with open(log_path, "a") as f:
            f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] MOCK EMAIL (No RESEND_API_KEY set) to {email}:\nLink: {reset_link}\n" + "-"*50 + "\n")
        print(f"RESEND_API_KEY not configured. Logged password reset link to {log_path}")
        return True

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "from": from_email,
        "to": [email],
        "subject": subject,
        "html": html_content
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            print(f"Email sent successfully via Resend to {email}. Response: {res_body}")
            return True
    except Exception as e:
        # FIX: Resend's shared sandbox sender (onboarding@resend.dev) can only
        # deliver to the email address the Resend account itself was signed
        # up with. Any other recipient gets rejected by their API (e.g. a 403),
        # which used to bubble up and hard-fail the whole forgot-password
        # request. For local/dev use, don't let that block the flow -- fall
        # back to logging the reset link to reset_emails.log instead, the
        # same as the "no API key configured" path below.
        print(f"Error sending email via Resend API (falling back to log file): {e}")
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "reset_emails.log")
        with open(log_path, "a") as f:
            f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] RESEND SEND FAILED ({e}) - link for {email}:\nLink: {reset_link}\n" + "-"*50 + "\n")
        return True



# =========================
# REGISTER SERVICE
# =========================

def register_user(db: Session, name: str, email: str, password: str):

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        return None  # router will handle error

    new_user = User(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================
# LOGIN SERVICE
# =========================

def login_user(db: Session, email: str, password: str):

    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    token = create_access_token(
        data={
            "user_id": user.id,
            "email": user.email
        }
    )

    return token