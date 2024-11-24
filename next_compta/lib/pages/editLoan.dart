import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/shared/colors.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class Editloan extends StatefulWidget {
  final int loanId;

  const Editloan({Key? key, required this.loanId}) : super(key: key);

  @override
  State<Editloan> createState() => _EditloanState();
}

class _EditloanState extends State<Editloan> {
  final _formKey = GlobalKey<FormState>();
  String interest_rate = '';
  String start_date = '';
  String amount = '';
  String end_date = '';
  int accountId = 0; // حفظ معرف الحساب هنا
  bool loading = true;
  List<Map<String, dynamic>> accounts = []; // قائمة الحسابات

  @override
  void initState() {
    super.initState();
    fetchLoanDetails();
    fetchAccounts(); // جلب الحسابات
  }

  Future<void> fetchLoanDetails() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://192.168.1.155:8000/api/loans/${widget.loanId}/'),
        headers: {
          'Authorization': 'Token $token',
        },
      );

      if (response.statusCode == 200) {
        final loan = jsonDecode(response.body);
        setState(() {
          interest_rate = loan['interest_rate'];
          start_date = loan['start_date'];
          amount = loan['amount'].toString();
          end_date = loan['end_date'];
          accountId = loan['account']; // استخدم معرف الحساب
          loading = false;
        });
      } else {
        print('Failed to load loan: ${response.statusCode} - ${response.reasonPhrase}');
      }
    } catch (error) {
      print('Error fetching loan details: $error');
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

  Future<void> updateLoan() async {
    if (_formKey.currentState?.validate() ?? false) {
      _formKey.currentState!.save();
      
      try {
        final prefs = await SharedPreferences.getInstance();
        final String? token = prefs.getString('token');

        final response = await http.put(
          Uri.parse('http://192.168.1.155:8000/api/loans/${widget.loanId}/'),
          headers: {
            'Authorization': 'Token $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({
            'interest_rate': interest_rate,
            'start_date': start_date,
            'amount': double.parse(amount),
            'end_date': end_date,
            'account': accountId, // استخدم المعرف هنا
          }),
        );

        if (response.statusCode == 200) {
          Navigator.pop(context, true); // العودة مع تحديث
        } else {
          print('Failed to update loan: ${response.statusCode} - ${response.reasonPhrase}');
          print('Response body: ${response.body}');
        }
        
      } catch (error) {
        print('Error updating loan: $error');
      }
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text("Edit Loan", style: TextStyle(color: Colors.white)),
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
                      initialValue: interest_rate,
                      decoration: InputDecoration(labelText: 'Interest Rate'),
                      onSaved: (value) => interest_rate = value ?? '',
                      validator: (value) => value!.isEmpty ? 'Please enter a interest rate' : null,
                    ),
                    TextFormField(
                      initialValue: start_date,
                      decoration: InputDecoration(labelText: 'Start Date'),
                      onSaved: (value) => start_date = value ?? '',
                      validator: (value) => value!.isEmpty ? 'Please enter a start date' : null,
                    ),
                    TextFormField(
                      initialValue: amount,
                      decoration: InputDecoration(labelText: 'Amount'),
                      keyboardType: TextInputType.number,
                      onSaved: (value) => amount = value ?? '',
                      validator: (value) => value!.isEmpty ? 'Please enter an amount' : null,
                    ),
                    TextFormField(
                      initialValue: end_date,
                      decoration: InputDecoration(labelText: 'End date'),
                      onSaved: (value) => end_date = value ?? '',
                      validator: (value) => value!.isEmpty ? 'Please enter a end date' : null,
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
                      onPressed: updateLoan,
                      child: Text("Update Loan"),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}