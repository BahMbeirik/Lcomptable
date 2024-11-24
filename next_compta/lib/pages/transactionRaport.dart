import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:next_compta/shared/drawer.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';

class TransactionReport extends StatefulWidget {
  @override
  _TransactionReportState createState() => _TransactionReportState();
}

class _TransactionReportState extends State<TransactionReport> {
  List<Map<String, dynamic>> credits = [];
  List<Map<String, dynamic>> debits = [];
  double totalCredit = 0;
  double totalDebit = 0;
  String startDate = '';
  String endDate = '';
  bool filtered = false;

  Future<void> fetchTransactions() async {
  try {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('token');  // جلب الـ Token المخزن

    final queryParams = {
      if (startDate.isNotEmpty) 'start_date': startDate,
      if (endDate.isNotEmpty) 'end_date': endDate,
    };

    final uri = Uri.http('192.168.1.155:8000', '/api/transaction-report/', queryParams);

    final response = await http.get(
      uri,
      headers: {
        'Authorization': 'Token $token',  // إضافة التوكن في رأس الطلب
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      setState(() {
        credits = List<Map<String, dynamic>>.from(data['credits'] ?? []);
        debits = List<Map<String, dynamic>>.from(data['debits'] ?? []);
        totalCredit = data['total_credit']?.toDouble() ?? 0;
        totalDebit = data['total_debit']?.toDouble() ?? 0;
        filtered = true;
      });
    } else if (response.statusCode == 401) {
      print('Unauthorized: Invalid or expired token');
      // يمكنك إعادة توجيه المستخدم لتسجيل الدخول مجددًا
    } else {
      print('Error fetching transactions: ${response.statusCode}');
    }
  } catch (e) {
    print('Error fetching transactions: $e');
  }
}

  @override
  void initState() {
    super.initState();
    fetchTransactions(); // استدعاء البيانات عند تحميل الصفحة
  }

  Future<void> selectDate(BuildContext context, bool isStartDate) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2101),
    );

    if (picked != null) {
      setState(() {
        final formattedDate =
            "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
        if (isStartDate) {
          startDate = formattedDate;
        } else {
          endDate = formattedDate;
        }
        fetchTransactions(); // تحديث البيانات عند تحديد تاريخ جديد
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text('Transaction Report', style: TextStyle(color: Colors.white)),
      ),

      drawer: appDrawer(context),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Expanded(
                  child: TextFormField(
                    decoration: InputDecoration(labelText: 'Start Date'),
                    readOnly: true,
                    onTap: () => selectDate(context, true),
                    controller: TextEditingController(text: startDate),
                  ),
                ),
                SizedBox(width: 10),
                Expanded(
                  child: TextFormField(
                    decoration: InputDecoration(labelText: 'End Date'),
                    readOnly: true,
                    onTap: () => selectDate(context, false),
                    controller: TextEditingController(text: endDate),
                  ),
                ),
              ],
            ),
            SizedBox(height: 20),
            Expanded(
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      children: [
                        Text('Credits', style: TextStyle(fontWeight: FontWeight.bold)),
                        Expanded(
                          child: credits.isNotEmpty
                              ? SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: DataTable(
                                    columns: [
                                      DataColumn(label: Text('Account')),
                                      DataColumn(label: Text('Amount')),
                                      DataColumn(label: Text('Date')),
                                    ],
                                    rows: credits.map((credit) {
                                      return DataRow(cells: [
                                        DataCell(Text(credit['account'] ?? 'N/A')),
                                        DataCell(Text(credit['amount'].toString())),
                                        DataCell(Text(_formatDate(credit['date']))),
                                      ]);
                                    }).toList(),
                                  ),
                              )
                              : Text('No credit transactions found.'),
                        ),
                        Text('TOTAL: $totalCredit'),
                      ],
                    ),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      children: [
                        Text('Debits', style: TextStyle(fontWeight: FontWeight.bold)),
                        Expanded(
                          child: debits.isNotEmpty
                              ? SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: DataTable(
                                    columns: [
                                      DataColumn(label: Text('Account')),
                                      DataColumn(label: Text('Amount')),
                                      DataColumn(label: Text('Date')),
                                    ],
                                    rows: debits.map((debit) {
                                      return DataRow(cells: [
                                        DataCell(Text(debit['account'] ?? 'N/A')),
                                        DataCell(Text(debit['amount'].toString())),
                                        DataCell(Text(_formatDate(debit['date']))),
                                      ]);
                                    }).toList(),
                                  ),
                              )
                              : Text('No debit transactions found.'),
                        ),
                        Text('TOTAL: $totalDebit'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            if (filtered && credits.isEmpty && debits.isEmpty)
              Text('No transactions found between the selected dates.', style: TextStyle(color: Colors.red)),
          ],
        ),
      ),
    );
  }

    void _logout() async {
    final prefs = await SharedPreferences.getInstance();
    prefs.remove('token');
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const Login()),
    );
  }

  String _formatDate(String? dateString) {
  if (dateString == null || dateString.isEmpty) {
    return 'N/A';
  }
  try {
    // تحويل النص إلى كائن DateTime
    DateTime parsedDate = DateTime.parse(dateString);
    
    // تنسيق التاريخ إلى صيغة بسيطة yyyy-MM-dd
    return DateFormat('yyyy-MM-dd').format(parsedDate);
  } catch (e) {
    return 'Invalid date';  // في حالة كان التاريخ غير صالح
  }
}

}
