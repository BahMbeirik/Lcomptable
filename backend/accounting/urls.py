from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, DepositViewSet, JournalEntryDetail, JournalEntryListCreate, LoanViewSet, RegisterView, TransactionViewSet ,LoginView, calculate_deposit_interest, calculate_loan_interest, convert_currency, dashboard_data, financial_report, import_csv, transaction_report

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'loans', LoanViewSet)
router.register(r'deposits', DepositViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('transaction-report/', transaction_report, name='transaction_report'),
    path('financial-report/', financial_report, name='financial_report'),
    path('loans/<int:loan_id>/calculate_interest/', calculate_loan_interest, name='calculate_interest'),
    path('deposits/<int:deposit_id>/calculate_interestDeposit/', calculate_deposit_interest, name='calculate_interestDeposit'),
    path('convert/<str:from_currency>/<str:to_currency>/<str:amount>/', convert_currency, name='convert_currency'),
    path('dashboard-data/', dashboard_data, name='dashboard_data'),
    path('password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('journal-entries/', JournalEntryListCreate.as_view(), name='journal-entry-list-create'),
    path('journal-entries/<int:pk>/', JournalEntryDetail.as_view(), name='journal-entry-detail'),

    path('import-csv/', import_csv, name='import-csv'),
    
]