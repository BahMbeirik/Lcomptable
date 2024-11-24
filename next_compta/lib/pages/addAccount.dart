// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/pages/accounts.dart';
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/shared/colors.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class Addaccount extends StatefulWidget {
  const Addaccount({super.key});

  @override
  State<Addaccount> createState() => _AddaccountState();
}

class _AddaccountState extends State<Addaccount> {
  final TextEditingController _numberController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _typeController = TextEditingController();
  final TextEditingController _balanceController = TextEditingController();
  bool _isLoading = false;

  static const List<String> list = <String>[
    'current account',
    'payroll accounts',
    'deposit accounts',
    'savings accounts'
  ];
  String dropdownValue = list.first;

Future<void> _addAccount() async {
  final token = await _getToken();
  
  if (token.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('No authentication token found')),
    );
    return;
  }

  print('Token: $token'); // طباعة التوكن للتحقق من أنه صالح
  
  // إرسال الطلب الآن
  final response = await http.post(
    Uri.parse('http://192.168.1.155:8000/api/accounts/'),
    headers: {
      'Authorization': 'Token $token',
      'Content-Type': 'application/json',
    },
    body: json.encode({
      'account_number': _numberController.text,
      'name': _nameController.text,
      'account_type': _typeController.text,
      'balance': _balanceController.text,
    }),

  );

  if (_numberController.text.isEmpty || _typeController.text.isEmpty ||_nameController.text.isEmpty ||_balanceController.text.isEmpty) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('Please fill in all required fields')),
  );
  return;
}
  print('Response status: ${response.statusCode}');
  print('Response body: ${response.body}');
  if (response.statusCode == 201) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Account added successfully!')),
    );
    // إعادة التوجيه إلى صفحة الحسابات
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => Accounts()),
    );
  } else if (response.statusCode == 401) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Unauthorized: Please log in again.')),
    );
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to add Account')),
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
          "Add Account",
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
              height: 450,
              decoration: BoxDecoration(
                color: Color.fromARGB(255, 255, 255, 255),
                borderRadius: BorderRadius.circular(10),
                border: Border(
                  left: BorderSide(
                    color: BTNBlue,
                    width: 3,
                  ),
                  right: BorderSide(
                    color: BTNBlue,
                    width: 3,
                  ),
                ),
              ),
              child: SingleChildScrollView(
                child: Column(
                  children: <Widget>[
                    Text(
                      "Add new Account",
                      style: TextStyle(fontSize: 20),
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    TextFormField(
                      controller: _numberController,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: 'Enter account number',
                      ),
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: 'Enter account name',
                      ),
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    DropdownButtonFormField(
                      decoration: InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Select Type',
                    ),
                      value: dropdownValue,
                      onChanged: (String? newValue) {
                        setState(() {
                          dropdownValue = newValue!;
                          _typeController.text = dropdownValue;
                        });
                      },
                      items: list.map<DropdownMenuItem<String>>((String value) {
                        return DropdownMenuItem<String>(
                          value: value,
                          child: Text(value),
                        );
                      }).toList(),
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    TextFormField(
                      controller: _balanceController,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: 'Enter Account balance',
                      ),
                    ),
                    SizedBox(
                      height: 30,
                    ),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _addAccount,
                      style: ElevatedButton.styleFrom(
                        foregroundColor: Colors.white,
                        backgroundColor: BTNBlue,
                      ),
                      child: _isLoading
                          ? CircularProgressIndicator(
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            )
                          : Text('Add Account'),
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

  void _logout() async {
    final prefs = await SharedPreferences.getInstance();
    prefs.remove('token'); // Clear token from secure storage
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const Login()),
    );
  }
}
