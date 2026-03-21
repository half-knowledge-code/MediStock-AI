import smtplib
from email.mime.text import MIMEText

def send_alert_mail(value):

    sender = "yourgmail@gmail.com"
    password = "your_app_password"
    receiver = "admin@gmail.com"

    subject = "⚠️ Medical Alert"
    body = f"Warning! Sensor value dropped below threshold.\nCurrent Value: {value}"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = receiver

    server = smtplib.SMTP("smtp.gmail.com",587)
    server.starttls()
    server.login(sender,password)

    server.sendmail(sender,receiver,msg.as_string())
    server.quit()