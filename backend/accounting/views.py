import datetime
from decimal import Decimal
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Account, Deposit, Loan, Transaction, JournalEntry
from .serializers import AccountSerializer, DepositSerializer, LoanSerializer, TransactionSerializer ,JournalEntrySerializer
import requests 
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import AllowAny
from rest_framework.serializers import Serializer, CharField, EmailField
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.db.models import Sum
from datetime import datetime
from django.utils import timezone
from rest_framework import generics
# Create your views here.

class LoginSerializer(Serializer):
    username = CharField(required=True)
    password = CharField(required=True)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                token, created = Token.objects.get_or_create(user=user)
                return Response({'token': token.key}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterSerializer(Serializer):
    username = CharField(required=True)
    password = CharField(required=True)
    email = EmailField(required=True)

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            password=make_password(validated_data['password'])
        )
        user.save()
        return user

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'status': 'User created'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]

class DepositViewSet(viewsets.ModelViewSet):
    queryset = Deposit.objects.all()
    serializer_class = DepositSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
def transaction_report(request):
    # جلب تواريخ البداية والنهاية من الـ query parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    # إعداد معاملات الائتمان والخصم الافتراضية
    credit_transactions = Transaction.objects.filter(transaction_type='credit')
    debit_transactions = Transaction.objects.filter(transaction_type='debit')

    # جلب معاملات JournalEntry للخصم والائتمان
    journal_entries_debit = JournalEntry.objects.all()
    journal_entries_credit = JournalEntry.objects.all()

    # إذا كانت التواريخ محددة، قم بفلترة المعاملات بناءً عليها
    if start_date and end_date:
        try:
            # تحويل التواريخ إلى صيغة صحيحة مع المنطقة الزمنية
            start_date = timezone.make_aware(datetime.strptime(start_date, '%Y-%m-%d'))
            end_date = timezone.make_aware(datetime.strptime(end_date, '%Y-%m-%d'))

            # فلترة معاملات الائتمان والخصم بناءً على التواريخ المحددة
            credit_transactions = credit_transactions.filter(created_at__range=(start_date, end_date))
            debit_transactions = debit_transactions.filter(created_at__range=(start_date, end_date))

            # فلترة معاملات JournalEntry بناءً على التواريخ المحددة
            journal_entries_debit = journal_entries_debit.filter(date__range=(start_date, end_date))
            journal_entries_credit = journal_entries_credit.filter(date__range=(start_date, end_date))

        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

    # حساب مجموع كل جانب للمعاملات العادية
    total_credit = sum([transaction.amount for transaction in credit_transactions])
    total_debit = sum([transaction.amount for transaction in debit_transactions])

    # إضافة المعاملات من JournalEntry
    total_credit += sum([entry.credit_amount for entry in journal_entries_credit])
    total_debit += sum([entry.debit_amount for entry in journal_entries_debit])

    # هيكلة التقرير
    report = {
        'credits': [
            {
                'account': transaction.account.name,
                'amount': transaction.amount,
                'date': transaction.created_at
            } for transaction in credit_transactions
        ] + [
            {
                'account': entry.credit_account.name,  # حساب الائتمان
                'amount': entry.credit_amount,
                'date': entry.date
            } for entry in journal_entries_credit
        ],
        'debits': [
            {
                'account': transaction.account.name,
                'amount': transaction.amount,
                'date': transaction.created_at
            } for transaction in debit_transactions
        ] + [
            {
                'account': entry.debit_account.name,  # حساب الخصم
                'amount': entry.debit_amount,
                'date': entry.date
            } for entry in journal_entries_debit
        ],
        'total_credit': total_credit,
        'total_debit': total_debit
    }

    # إذا كانت المعاملات فارغة في النطاق الزمني المحدد
    if not credit_transactions and not debit_transactions and not journal_entries_credit and not journal_entries_debit:
        return Response({"message": "No transactions found in the specified date range."})

    return Response(report)


@api_view(['GET'])
def financial_report(request):
    # Fetch data
    accounts = Account.objects.all()
    credit_transactions = Transaction.objects.filter(transaction_type='credit')
    debit_transactions = Transaction.objects.filter(transaction_type='debit')
    loans = Loan.objects.all()
    deposits = Deposit.objects.all()

    # Aggregates
    total_credit = credit_transactions.aggregate(Sum('amount'))['amount__sum'] or Decimal(0)
    total_debit = debit_transactions.aggregate(Sum('amount'))['amount__sum'] or Decimal(0)
    total_loan_amount = loans.aggregate(Sum('amount'))['amount__sum'] or Decimal(0)
    total_deposit_amount = deposits.aggregate(Sum('amount'))['amount__sum'] or Decimal(0)

    # Total interest calculation
    total_interest = sum([loan.calculate_interest() for loan in loans])

    # Total interest deposit calculation
    total_interestDeposit = sum([deposit.calculate_interestDeposit() for deposit in deposits])
    
    # Calculate total balance of all accounts
    total_balances = accounts.aggregate(Sum('balance'))['balance__sum'] or Decimal(0)

    # Calculate total balance by account type
    total_balances_by_type = accounts.values('account_type').annotate(
        total_balance=Sum('balance')
    )

    # Construct report
    report = {
        'accounts': [
            {
                'account_number': account.account_number,
                'name': account.name,
                'balance': float(account.balance),
                'account_type': account.account_type,
                'currency': account.currency
            } for account in accounts
        ],
        'total_balances': float(total_balances),  # Include total balance
        'total_balances_by_type': [
            {
                'account_type': balance['account_type'],
                'total_balance': float(balance['total_balance'])
            } for balance in total_balances_by_type
        ],
        'transactions': {
            'credits': [
                {
                    'account': transaction.account.name,
                    'amount': float(transaction.amount),
                    'date': transaction.created_at
                } for transaction in credit_transactions
            ],
            'debits': [
                {
                    'account': transaction.account.name,
                    'amount': float(transaction.amount),
                    'date': transaction.created_at
                } for transaction in debit_transactions
            ],
            'total_credit': float(total_credit),
            'total_debit': float(total_debit)
        },
        'loans': {
            'total_loan_amount': float(total_loan_amount),
            'total_interest': float(total_interest),
            'loans': [
                {
                    'account': loan.account.name,
                    'amount': float(loan.amount),
                    'interest_rate': float(loan.interest_rate),
                    'start_date': loan.start_date,
                    'end_date': loan.end_date,
                    'interest': float(loan.calculate_interest())
                } for loan in loans
            ]
        },
        'deposits': {
            'total_deposit_amount': float(total_deposit_amount),
            'total_interestDeposit': float(total_interestDeposit),
            'deposits': [
                {
                    'account': deposit.account.name,
                    'amount': float(deposit.amount),
                    'interest_rate': float(deposit.interest_rate),
                    'deposit_date': deposit.deposit_date,
                    'maturity_date': deposit.maturity_date,
                    'interest': float(deposit.calculate_interestDeposit())
                } for deposit in deposits
            ]
        }
    }

    return Response(report)


def get_exchange_rate(from_currency, to_currency):
    url = f"https://openexchangerates.org/api/latest.json?app_id=f0f88089ee28457e83b68cd25664f9aa"
    response = requests.get(url)
    data = response.json()
    rates = data.get('rates', {})
    return rates.get(to_currency) / rates.get(from_currency)

def convert_currency(request, from_currency, to_currency, amount):
    try:
        amount = float(amount)  # تحويل المبلغ إلى float
        rate = get_exchange_rate(from_currency, to_currency)
        converted_amount = round(amount * rate, 2)
        return JsonResponse({'converted_amount': converted_amount})
    except ValueError:
        return JsonResponse({'error': 'Invalid amount format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)



def calculate_loan_interest(request, loan_id):
    try:
        loan = Loan.objects.get(id=loan_id)
        amount = Decimal(loan.amount or 0)
        interest_rate = Decimal(loan.interest_rate or 0)
        if not (loan.start_date and loan.end_date):
            raise ValueError("Loan dates are not properly set")
        tenure_days = (loan.end_date - loan.start_date).days

        interest = amount * (interest_rate / Decimal(100)) * (Decimal(tenure_days) / Decimal(365))
        total_payable = amount + interest

        return JsonResponse({
            'principal': float(amount),
            'interest': float(interest),
            'total_payable': float(total_payable),
            'rate': float(interest_rate),
            'tenure': tenure_days // 30  # Convert days to months
        })
    except Loan.DoesNotExist:
        return JsonResponse({'error': 'Loan not found'}, status=404)
    except ValueError as ve:
        return JsonResponse({'error': str(ve)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def calculate_deposit_interest(request, deposit_id):
    try:
        deposit = Deposit.objects.get(id=deposit_id)
        amount = Decimal(deposit.amount or 0)
        interest_rate = Decimal(deposit.interest_rate or 0)
        if not (deposit.deposit_date and deposit.maturity_date):
            raise ValueError("Deposit dates are not properly set")
        tenure_days = (deposit.maturity_date - deposit.deposit_date).days

        interest = amount * (interest_rate / Decimal(100)) * (Decimal(tenure_days) / Decimal(365))
        total_payable = amount + interest

        return JsonResponse({
            'principal': float(amount),
            'interest': float(interest),
            'total_payable': float(total_payable),
            'rate': float(interest_rate),
            'tenure': tenure_days // 30  # Convert days to months
        })
    except Deposit.DoesNotExist:
        return JsonResponse({'error': 'Deposit not found'}, status=404)
    except ValueError as ve:
        return JsonResponse({'error': str(ve)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@api_view(['GET'])
def dashboard_data(request):
    # بيانات المعاملات
    credit_transactions = Transaction.objects.filter(transaction_type='credit')
    debit_transactions = Transaction.objects.filter(transaction_type='debit')

    # إجمالي الائتمان والخصم
    total_credit = credit_transactions.aggregate(Sum('amount'))['amount__sum'] or Decimal(0)
    total_debit = debit_transactions.aggregate(Sum('amount'))['amount__sum'] or Decimal(0)

    top_credit = credit_transactions.order_by('-amount')[:5]
    top_debit = debit_transactions.order_by('-amount')[:5]

    # حساب 3 أكبر قروض
    top_loans = Loan.objects.all().order_by('-amount')[:3]

    # حساب 3 أكبر ودائع
    top_deposits = Deposit.objects.all().order_by('-amount')[:3]

    # مجموع الأرصدة حسب نوع الحساب
    account_balances_by_type = Account.objects.values('account_type').annotate(total_balance=Sum('balance'))

    top_account = Account.objects.all().order_by('-balance')[:5]
    # إعداد البيانات للـ Dashboard
    data = {
        'transactions': {
            'total_credit': float(total_credit),
            'total_debit': float(total_debit)
        },
        'top_credit': [{
            'account' : transaction.account.name,
            'amount': float(transaction.amount),
            'date': transaction.date.strftime('%Y-%m-%d'),
            }
            for transaction in top_credit
        ],
        'top_debit' :[
            {
            'account' : transaction.account.name,
            'amount': float(transaction.amount),
            'date': transaction.date.strftime('%Y-%m-%d')
          }
          for transaction in top_debit
        ],
        'top_loans': [
            {
                'account': loan.account.name,
                'amount': float(loan.amount),
                'interest_rate': float(loan.interest_rate),
                'start_date': loan.start_date,
                'end_date': loan.end_date
            } for loan in top_loans
        ],
        'top_deposits': [
            {
                'account': deposit.account.name,
                'amount': float(deposit.amount),
                'interest_rate': float(deposit.interest_rate),
                'deposit_date': deposit.deposit_date,
                'maturity_date': deposit.maturity_date
            } for deposit in top_deposits
        ],
        'account_balances_by_type': [
            {
                'account_type': balance['account_type'],
                'total_balance': float(balance['total_balance'])
            } for balance in account_balances_by_type
        ],
        'top_account': [
            {
                'name': account.name,
                'balance': account.balance,
            } for account in top_account
        ]
    }

    return Response(data)

# عرض جميع القيود اليومية وإنشاء قيد جديد
class JournalEntryListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer

# تعديل أو حذف قيد محدد
class JournalEntryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer