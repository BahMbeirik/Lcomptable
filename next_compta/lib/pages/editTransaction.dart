import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/shared/colors.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class EditTransaction extends StatefulWidget {
  final int transactionId;

  const EditTransaction({Key? key, required this.transactionId}) : super(key: key);

  @override
  State<EditTransaction> createState() => _EditTransactionState();
}

class _EditTransactionState extends State<EditTransaction> {
  final _formKey = GlobalKey<FormState>();
  String transactionType = '';
  String date = '';
  String amount = '';
  String description = '';
  int accountId = 0; // حفظ معرف الحساب هنا
  bool loading = true;
  List<Map<String, dynamic>> accounts = []; // قائمة الحسابات

  @override
  void initState() {
    super.initState();
    fetchTransactionDetails();
    fetchAccounts(); // جلب الحسابات
  }

  Future<void> fetchTransactionDetails() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://192.168.1.155:8000/api/transactions/${widget.transactionId}/'),
        headers: {
          'Authorization': 'Token $token',
        },
      );

      if (response.statusCode == 200) {
        final transaction = jsonDecode(response.body);
        setState(() {
          transactionType = transaction['transaction_type'];
          date = transaction['date'];
          amount = transaction['amount'].toString();
          description = transaction['description'];
          accountId = transaction['account']; // استخدم معرف الحساب
          loading = false;
        });
      } else {
        print('Failed to load transaction: ${response.statusCode} - ${response.reasonPhrase}');
      }
    } catch (error) {
      print('Error fetching transaction details: $error');
    }
  }

  Future<void> fetchAccounts() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://192.168.1.155:8000/api/accounts/'), 
        headers: {
          'Authorization': 'Token $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          accounts = List<Map<String, dynamic>>.from(data);
        });
      } else {
        print('Failed to load accounts: ${response.statusCode} - ${response.reasonPhrase}');
      }
    } catch (error) {
      print('Error fetching accounts: $error');
    }
  }

  Future<void> updateTransaction() async {
    if (_formKey.currentState?.validate() ?? false) {
      _formKey.currentState!.save();
      
      try {
        final prefs = await SharedPreferences.getInstance();
        final String? token = prefs.getString('token');

        final response = await http.put(
          Uri.parse('http://192.168.1.155:8000/api/transactions/${widget.transactionId}/'),
          headers: {
            'Authorization': 'Token $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({
            'transaction_type': transactionType,
            'date': date,
            'amount': double.parse(amount),
            'description': description,
            'account': accountId, // استخدم المعرف هنا
          }),
        );

        if (response.statusCode == 200) {
          Navigator.pop(context, true); // العودة مع تحديث
        } else {
          print('Failed to update transaction: ${response.statusCode} - ${response.reasonPhrase}');
          print('Response body: ${response.body}');
        }
        
      } catch (error) {
        print('Error updating transaction: $error');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text("Edit Transaction", style: TextStyle(color: Colors.white)),
      ),
      body: loading
          ? Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(20.0),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    TextFormField(
                      initialValue: transactionType,
                      decoration: InputDecoration(labelText: 'Transaction Type'),
                      onSaved: (value) => transactionType = value ?? '',
                      validator: (value) => value!.isEmpty ? 'Please enter a type' : null,
                    ),
                    TextFormField(
                      initialValue: date,
                      decoration: InputDecoration(labelText: 'Date'),
                      onSaved: (value) => date = value ?? '',
                      validator: (value) => value!.isEmpty ? 'Please enter a date' : null,
                    ),
                    TextFormField(
                      initialValue: amount,
                      decoration: InputDecoration(labelText: 'Amount'),
                      keyboardType: TextInputType.number,
                      onSaved: (value) => amount = value ?? '',
                      validator: (value) => value!.isEmpty ? 'Please enter an amount' : null,
                    ),
                    TextFormField(
                      initialValue: description,
                      decoration: InputDecoration(labelText: 'Description'),
                      onSaved: (value) => description = value ?? '',
                      validator: (value) => value!.isEmpty ? 'Please enter a description' : null,
                    ),
                    DropdownButtonFormField<int>(
                      value: accountId,
                      decoration: InputDecoration(labelText: 'Select Account'),
                      items: accounts.map((account) {
                        return DropdownMenuItem<int>(
                          value: account['id'], // استخدم معرف الحساب
                          child: Text(account['name']), // تأكد من وجود حقل الاسم
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          accountId = value ?? 0; // حفظ معرف الحساب
                        });
                      },
                      validator: (value) => value == null ? 'Please select an account' : null,
                    ),
                    SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: updateTransaction,
                      child: Text("Update Transaction"),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
