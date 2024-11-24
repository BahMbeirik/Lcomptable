// ignore_for_file: prefer_const_constructors, use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/pages/loan.dart';
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:intl/intl.dart';


class Addloan extends StatefulWidget {
  const Addloan({super.key});

  @override
  State<Addloan> createState() => _AddloanState();
}

class _AddloanState extends State<Addloan> {
  final TextEditingController _interestController = TextEditingController();
  final TextEditingController _startdateController = TextEditingController();
  final TextEditingController _enddateController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  bool _isLoading = false;

  List<Map<String, dynamic>> accounts = [];
  int? selectedAccount;
  @override
  void initState() {
    super.initState();
    _fetchAccounts();
  }

  Future<void> _fetchAccounts() async {
    final token = await _getToken();
    
    if (token.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No authentication token found')),
      );
      return;
    }

    final response = await http.get(
      Uri.parse('http://192.168.1.155:8000/api/accounts/'),
      headers: {
        'Authorization': 'Token $token',
      },
    );

    if (response.statusCode == 200) {
      List<dynamic> data = jsonDecode(response.body);
      setState(() {
        accounts = data.map<Map<String, dynamic>>((account) {
          return {
            'id': account['id'],
            'name': account['name'],
          };
        }).toList();
      });
    }else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch accounts')),
      );
    }
  }

  Future<void> _addLoan() async {
    final token = await _getToken();
    
    if (token.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No authentication token found')),
      );
      return;
    }

    if (selectedAccount == null || _amountController.text.isEmpty || _interestController.text.isEmpty || _amountController.text.isEmpty || _startdateController.text.isEmpty || _enddateController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please fill in all required fields')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final response = await http.post(
      Uri.parse('http://192.168.1.155:8000/api/loans/'),
      headers: {
        'Authorization': 'Token $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'account': selectedAccount,
        'interest_rate': _interestController.text,
        'start_date': _startdateController.text,
        'end_date': _enddateController.text,
        'amount': _amountController.text,
      }),
    );

    print('Response status: ${response.statusCode}');
    print('Response body: ${response.body}');

    setState(() {
      _isLoading = false;
    });

    if (response.statusCode == 201) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Loan added successfully!')),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => Loan()),
      );
    } else if (response.statusCode == 401) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unauthorized: Please log in again.')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to add Loan')),
      );
    }
  }


  Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') ?? '';
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text(
          "Add Loan",
          style: TextStyle(color: Colors.white),
        ),
      ),
    
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(30.0),
          child: SingleChildScrollView(
            child: Container(
              padding: EdgeInsets.all(16.0),
              width: 350,
              height: 500,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: BTNBlue, width: 3),
              ),
              child: SingleChildScrollView(
                child: Column(
                  children: <Widget>[
                    Text("Add new Loan", style: TextStyle(fontSize: 20)),
                    SizedBox(height: 20),
                    DropdownButtonFormField<int>(
                      decoration: InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: 'Select Account',
                      ),
                      value: selectedAccount,
                      onChanged: (int? newValue) {
                        setState(() {
                          selectedAccount = newValue;
                        });
                      },
                      items: accounts.map<DropdownMenuItem<int>>((Map<String, dynamic> account) {
                        return DropdownMenuItem<int>(
                          value: account['id'], // معرف الحساب كـ int
                          child: Text(account['name']), // اسم الحساب كـ String
                        );
                      }).toList(),
                    ),
                
                    SizedBox(height: 20),
                    TextFormField(
                      controller: _interestController,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: 'Enter Interest Rate %',
                      ),
                    ),
                    SizedBox(height: 20),
                    TextField(
                        controller: _startdateController,
                        readOnly: true,
                        decoration: const InputDecoration(hintText: "Select start date"),
                        onTap: () => onTapFunctionStart(context: context),
                    ),
                    SizedBox(height: 20),
                    TextField(
                        controller: _enddateController,
                        readOnly: true,
                        decoration: const InputDecoration(hintText: "Select end date"),
                        onTap: () => onTapFunctionEnd(context: context),
                    ),
                    SizedBox(height: 20),
                    TextFormField(
                      controller: _amountController,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: 'Enter transaction amount',
                      ),
                    ),
                    SizedBox(height: 30),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _addLoan,
                      style: ElevatedButton.styleFrom(
                        foregroundColor: Colors.white,
                        backgroundColor: BTNBlue,
                      ),
                      child: _isLoading
                          ? CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            )
                          : Text('Add Loan'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  onTapFunctionStart({required BuildContext context}) async {
    DateTime? pickedDate = await showDatePicker(
      context: context,
      lastDate: DateTime.now(),
      firstDate: DateTime(2015),
      initialDate: DateTime.now(),
    );
    if (pickedDate == null) return;
    _startdateController.text = DateFormat('yyyy-MM-dd').format(pickedDate);
  }

  onTapFunctionEnd({required BuildContext context}) async {
    DateTime? pickedDate = await showDatePicker(
      context: context,
      lastDate: DateTime(2099),
      firstDate: DateTime(2015),
      initialDate: DateTime.now(),
    );
    if (pickedDate == null) return;
    _enddateController.text = DateFormat('yyyy-MM-dd').format(pickedDate);
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