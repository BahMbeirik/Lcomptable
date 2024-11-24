from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail
from django.dispatch import receiver

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    email_plaintext_message = f"Use this link to reset your password: http://localhost:3000/reset-password-confirm?token={reset_password_token.key}"

    send_mail(
        # عنوان الرسالة
        "Password Reset for {title}".format(title="Accounting"),
        # محتوى الرسالة
        email_plaintext_message,
        # المرسل
        "noreply@accounting.com",
        # المستقبل
        [reset_password_token.user.email]
    )
