import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/shared/colors.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class Editdeposit extends StatefulWidget {
  final int depositId;
  const Editdeposit({Key? key, required this.depositId}) : super(key: key);

  @override
  State<Editdeposit> createState() => _EditdepositState();
}

class _EditdepositState extends State<Editdeposit> {
  final _formKey = GlobalKey<FormState>();
  String interest_rate = '';
  String deposit_date = '';
  String amount = '';
  String maturity_date = '';
  int accountId = 0; // حفظ معرف الحساب هنا
  bool loading = true;
  List<Map<String, dynamic>> accounts = []; // قائمة الحسابات

  @override
  void initState() {
    super.initState();
    fetchDepositDetails();
    fetchAccounts(); // جلب الحسابات
  }

  Future<void> fetchDepositDetails() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('http://192.168.1.155:8000/api/deposits/${widget.depositId}/'),
        headers: {
          'Authorization': 'Token $token',
        },
      );

      if (response.statusCode == 200) {
        final deposit = jsonDecode(response.body);
        setState(() {
          interest_rate = deposit['interest_rate'];
          deposit_date = deposit['deposit_date'];
          amount = deposit['amount'].toString();
          maturity_date = deposit['maturity_date'];
          accountId = deposit['account']; // استخدم معرف الحساب
          loading = false;
        });
      } else {
        print('Failed to load deposit: ${response.statusCode} - ${response.reasonPhrase}');
      }
    } catch (error) {
      print('Error fetching deposit details: $error');
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

  Future<void> updateDeposit() async {
    if (_formKey.currentState?.validate() ?? false) {
      _formKey.currentState!.save();
      
      try {
        final prefs = await SharedPreferences.getInstance();
        final String? token = prefs.getString('token');

        final response = await http.put(
          Uri.parse('http://192.168.1.155:8000/api/deposits/${widget.depositId}/'),
          headers: {
            'Authorization': 'Token $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({
            'interest_rate': interest_rate,
            'deposit_date': deposit_date,
            'amount': double.parse(amount),
            'maturity_date': maturity_date,
            'account': accountId, // استخدم المعرف هنا
          }),
        );

        if (response.statusCode == 200) {
          Navigator.pop(context, true); // العودة مع تحديث
        } else {
          print('Failed to update deposit: ${response.statusCode} - ${response.reasonPhrase}');
          print('Response body: ${response.body}');
        }
        
      } catch (error) {
        print('Error updating deposit: $error');
      }
    }
  }




  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text("Edit Deposit", style: TextStyle(color: Colors.white)),
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
                      initialValue: deposit_date,
                      decoration: InputDecoration(labelText: 'Deposit Date'),
                      onSaved: (value) => deposit_date = value ?? '',
                      validator: (value) => value!.isEmpty ? 'Please enter a deposit date' : null,
                    ),
                    TextFormField(
                      initialValue: amount,
                      decoration: InputDecoration(labelText: 'Amount'),
                      keyboardType: TextInputType.number,
                      onSaved: (value) => amount = value ?? '',
                      validator: (value) => value!.isEmpty ? 'Please enter an amount' : null,
                    ),
                    TextFormField(
                      initialValue: maturity_date,
                      decoration: InputDecoration(labelText: 'Maturity date'),
                      onSaved: (value) => maturity_date = value ?? '',
                      validator: (value) => value!.isEmpty ? 'Please enter a maturity date' : null,
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
                      onPressed: updateDeposit,
                      child: Text("Update Deposit"),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}