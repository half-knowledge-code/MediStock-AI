from mail_service import send_alert_mail

THRESHOLD = 50

def check_value(value):

    if value is None:
        return

    if value < THRESHOLD:
        send_alert_mail(value)