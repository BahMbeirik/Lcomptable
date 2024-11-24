# Generated by Django 5.1.1 on 2024-10-08 16:39

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0003_transaction_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='account',
            name='account_type',
            field=models.CharField(choices=[('current account', 'Current Account'), ('payroll accounts', 'Payroll Accounts'), ('deposit accounts', 'Deposit Accounts'), ('savings accounts', 'Savings Accounts')], max_length=50),
        ),
        migrations.CreateModel(
            name='JournalEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('description', models.TextField()),
                ('debit_amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('credit_amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('credit_account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='credits', to='accounting.account')),
                ('debit_account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='debits', to='accounting.account')),
            ],
        ),
    ]