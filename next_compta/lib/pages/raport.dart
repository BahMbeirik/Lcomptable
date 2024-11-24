import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:next_compta/shared/drawer.dart';
import 'package:pdf/pdf.dart';
import 'dart:convert';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FinancialReport extends StatefulWidget {
  @override
  _FinancialReportState createState() => _FinancialReportState();
}

class _FinancialReportState extends State<FinancialReport> {
  Map<String, dynamic>? report;
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchReport();
  }

  Future<void> fetchReport() async {
  try {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('token');  // جلب الـ Token المخزن
    final response = await http.get(
      Uri.parse('http://192.168.1.155:8000/api/financial-report/'),
      headers: {
        'Authorization': 'Token $token',  // إرسال التوكن في الهيدر
        'Content-Type': 'application/json',
      },
    );

    print('Status Code: ${response.statusCode}');
    print('Response Body: ${response.body}');

    if (response.statusCode == 200) {
      setState(() {
        report = json.decode(response.body);
        loading = false;
      });
    } else {
      setState(() {
        error = 'Error fetching financial report. Status code: ${response.statusCode}';
        loading = false;
      });
    }
  } catch (err) {
    setState(() {
      error = 'Error: $err';
      loading = false;
    });
  }
}
  Future<void> _exportToPDF() async {
  final pdf = pw.Document();
  pdf.addPage(
    pw.Page(
      build: (context) {
        return pw.Column(
          children: [
            pw.Text('Financial Report', style: pw.TextStyle(fontSize: 24)),
            pw.SizedBox(height: 20),

            // الحسابات
            pw.Text('Accounts', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
            pw.ListView.builder(
              itemCount: report?['total_balances_by_type'].length ?? 0,
              itemBuilder: (context, index) {
                final balance = report?['total_balances_by_type'][index];
                return pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(balance['account_type']),
                    pw.Text('Total Balance: ${balance['total_balance']} MRU'),
                  ],
                );
              },
            ),
            pw.SizedBox(height: 20),
            pw.Text('Total Balance of All Accounts: ${report?['total_balances']} MRU'),

            // المعاملات
            pw.SizedBox(height: 20),
            pw.Text('Transactions', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Total Credit'),
                pw.Text('${report?['transactions']['total_credit']} MRU'),
              ],
            ),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Total Debit'),
                pw.Text('${report?['transactions']['total_debit']} MRU'),
              ],
            ),

            // القروض
            pw.SizedBox(height: 20),
            pw.Text('Loans', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Total Loan Amount'),
                pw.Text('${report?['loans']['total_loan_amount']} MRU'),
              ],
            ),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Total Interest'),
                pw.Text('${report?['loans']['total_interest']} MRU'),
              ],
            ),

            // الودائع
            pw.SizedBox(height: 20),
            pw.Text('Deposits', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Total Deposits Amount'),
                pw.Text('${report?['deposits']['total_deposit_amount']} MRU'),
              ],
            ),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Total Interest'),
                pw.Text('${report?['deposits']['total_interestDeposit']} MRU'),
              ],
            ),
          ],
        );
      },
    ),
  );

  await Printing.layoutPdf(
    onLayout: (PdfPageFormat format) async => pdf.save(),
  );
}

  @override
  Widget build(BuildContext context) {
    if (loading) return Center(child: CircularProgressIndicator());
    if (error != null) return Center(child: Text(error!));

    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text('Financial Report', style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: Icon(Icons.picture_as_pdf),
            onPressed: _exportToPDF,
          )
        ],
      ),
      drawer: appDrawer(context),
     body: SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            Text('Financial Report', style: TextStyle(fontSize: 24)),
            SizedBox(height: 20),
            // الحسابات
            Text('Accounts', style: TextStyle(fontWeight: FontWeight.bold)),
            ListView.builder(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              itemCount: report?['total_balances_by_type'].length ?? 0,
              itemBuilder: (context, index) {
                final balance = report?['total_balances_by_type'][index];
                return ListTile(
                  title: Text(balance['account_type']),
                  trailing: Text('Total Balance: ${balance['total_balance']} MRU'),
                );
              },
            ),
            SizedBox(height: 20),
            Text('Total Balance of All Accounts: ${report?['total_balances']} MRU'),

            // المعاملات
            SizedBox(height: 20),
            Text('Transactions', style: TextStyle(fontWeight: FontWeight.bold)),
            ListTile(
              title: Text('Total Credit'),
              trailing: Text('${report?['transactions']['total_credit']} MRU'),
            ),
            ListTile(
              title: Text('Total Debit'),
              trailing: Text('${report?['transactions']['total_debit']} MRU'),
            ),

            // القروض
            SizedBox(height: 20),
            Text('Loans', style: TextStyle(fontWeight: FontWeight.bold)),
            ListTile(
              title: Text('Total Loan Amount'),
              trailing: Text('${report?['loans']['total_loan_amount']} MRU'),
            ),
            ListTile(
              title: Text('Total Interest'),
              trailing: Text('${report?['loans']['total_interest']} MRU'),
            ),

            // الودائع
            SizedBox(height: 20),
            Text('Deposits', style: TextStyle(fontWeight: FontWeight.bold)),
            ListTile(
              title: Text('Total Deposits Amount'),
              trailing: Text('${report?['deposits']['total_deposit_amount']} MRU'),
            ),
            ListTile(
              title: Text('Total Interest'),
              trailing: Text('${report?['deposits']['total_interestDeposit']} MRU'),
            ),
          ],
        ),
      ),
    ),
  );
  }

  void _logout() async {
    final prefs = await SharedPreferences.getInstance();
    prefs.remove('token'); // Clear token from secure storage
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const Login()),
    );
  }
}
