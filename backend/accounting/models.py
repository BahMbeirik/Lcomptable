from decimal import Decimal
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from datetime import date
from django.utils import timezone

from django.forms import ValidationError

# Create your models here.

class CustomUser(AbstractUser):

    groups = models.ManyToManyField(
        Group,
        related_name="customuser_set", 
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_set_permissions", 
        blank=True
    )

class Account(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('current account', 'Current Account'),
        ('payroll accounts', 'Payroll Accounts'),
        ('deposit accounts', 'Deposit Accounts'),
        ('savings accounts', 'Savings Accounts'),  
    ]

    CURRENCY_CHOICES = [
        ('MRU', 'Mauritanian Ouguiya'),
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
        ('SAR', 'Saudi Riyal'),
    ]

    account_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    balance = models.DecimalField(max_digits=20, decimal_places=2)
    account_type = models.CharField(max_length=50, choices=ACCOUNT_TYPE_CHOICES) 
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='MRU')

    def __str__(self):
        return self.name

class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('credit', 'Credit'),  
        ('debit', 'Debit')     
    ]

    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    description = models.TextField()
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    date = models.DateField(auto_now_add=True)  
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # تحديث رصيد الحساب بناءً على نوع المعاملة
        if self.pk is None:  # تحقق إذا كانت المعاملة جديدة
            if self.transaction_type == 'credit':
                self.account.balance += self.amount
            elif self.transaction_type == 'debit':
                if self.account.balance >= self.amount:
                    self.account.balance -= self.amount
                else:
                    raise ValueError("Insufficient balance for this transaction.")
            
            self.account.save()  # حفظ التعديلات على رصيد الحساب

        super(Transaction, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.transaction_type} {self.amount} for {self.account.name}"



class Loan(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()

    def calculate_interest(self):
        amount = Decimal(self.amount) if self.amount else Decimal(0)
        interest_rate = Decimal(self.interest_rate) if self.interest_rate else Decimal(0)
        start_date = self.start_date
        end_date = self.end_date

        if start_date and end_date:
            tenure_days = (end_date - start_date).days
        else:
            tenure_days = 0

        # Ensure all arithmetic is done using Decimal
        days_in_year = Decimal(365)
        interest = amount * (interest_rate / Decimal(100)) * (Decimal(tenure_days) / days_in_year)
        interest = round(interest ,2)
        return interest
    

class Deposit(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    deposit_date = models.DateField()
    maturity_date = models.DateField()

    def calculate_interestDeposit(self):
        amount = Decimal(self.amount) if self.amount else Decimal(0)
        interest_rate = Decimal(self.interest_rate) if self.interest_rate else Decimal(0)
        deposit_date = self.deposit_date
        maturity_date = self.maturity_date

        if deposit_date and maturity_date:
            tenure_days = (maturity_date - deposit_date).days
        else:
            tenure_days = 0

        # Ensure all arithmetic is done using Decimal
        days_in_year = Decimal(365)
        interest = amount * (interest_rate / Decimal(100)) * (Decimal(tenure_days) / days_in_year)
        interest = round(interest ,2)
        return interest


class JournalEntry(models.Model):
    date = models.DateField(default=timezone.now)  # Correct usage of timezone.now
    description = models.TextField()
    debit_account = models.ForeignKey('Account', on_delete=models.CASCADE, related_name='debits')
    credit_account = models.ForeignKey('Account', on_delete=models.CASCADE, related_name='credits')
    debit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    credit_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.date} - {self.description}"

    def clean(self):
        """
        Validate that the debit and credit amounts are equal for a balanced entry.
        """
        if self.debit_amount != self.credit_amount:
            raise ValidationError("Debit and Credit amounts must be equal.")

    def save(self, *args, **kwargs):
        """
        Override the save method to call clean before saving the model.
        """
        self.clean()

        # Ensure both debit and credit accounts are provided
        if not self.debit_account or not self.credit_account:
            raise ValidationError("Both debit and credit accounts must be specified.")

        # Ensure debit account has sufficient balance
        if self.debit_account.balance < self.debit_amount:
            raise ValidationError(f"Insufficient balance in debit account {self.debit_account}.")

        # Process debit and credit
        self.debit_account.balance -= self.debit_amount
        self.debit_account.save()

        self.credit_account.balance += self.credit_amount
        self.credit_account.save()

        super().save(*args, **kwargs)

