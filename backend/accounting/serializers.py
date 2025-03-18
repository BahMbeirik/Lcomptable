from rest_framework import serializers
from .models import Account, Deposit, Loan, Transaction ,JournalEntry

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'transaction_type', 'date', 'amount', 'description', 'account', 'account_name']

class LoanSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = Loan
        fields = '__all__'
        extra_kwargs = {
            'start_date': {'required': False},
            'end_date': {'required': False}
        }

class DepositSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = Deposit
        fields = '__all__'
        extra_kwargs = {
            'deposit_date': {'required': False},
            'maturity_date': {'required': False}
        }



class JournalEntrySerializer(serializers.ModelSerializer):
    debit_account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all())  # Use PK for saving
    credit_account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all())  # Use PK for saving

    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'description', 'debit_account', 'debit_amount', 'credit_account', 'credit_amount']

    def to_representation(self, instance):
        """
        Override to_representation to return string names of the accounts for read requests.
        """
        representation = super().to_representation(instance)
        representation['debit_account'] = str(instance.debit_account)  # Show account name as string
        representation['credit_account'] = str(instance.credit_account)  # Show account name as string
        return representation


class CSVJournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ['date', 'description', 'debit_account', 'credit_account', 'debit_amount', 'credit_amount']
    
    def validate(self, data):
        """
        التحقق من صحة البيانات قبل الحفظ
        """
        if data['debit_amount'] != data['credit_amount']:
            raise serializers.ValidationError("Debit and Credit amounts must be equal.")
        
        if data['debit_account'].balance < data['debit_amount']:
            raise serializers.ValidationError(f"Insufficient balance in debit account {data['debit_account']}.")

        return data