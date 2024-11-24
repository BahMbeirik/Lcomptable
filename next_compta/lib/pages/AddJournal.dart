// ignore_for_file: prefer_const_constructors, use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:next_compta/pages/journal.dart';
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';


class Addjournal extends StatefulWidget {
  const Addjournal({super.key});

  @override
  State<Addjournal> createState() => _AddjournalState();
}

class _AddjournalState extends State<Addjournal> {
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _amountDebitController = TextEditingController();
  final TextEditingController _amountCreditController = TextEditingController();
  final TextEditingController _dateController = TextEditingController();
  bool _isLoading = false;

  List<Map<String, dynamic>> accounts = [];
  int? selectedDebitAccount;
  int? selectedCreditAccount;

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

  Future<void> _addJournal() async {
    final token = await _getToken();
    
    if (token.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No authentication token found')),
      );
      return;
    }

    if (_dateController.text.isEmpty ||selectedDebitAccount == null || selectedCreditAccount == null || _amountDebitController.text.isEmpty || _descriptionController.text.isEmpty || _amountCreditController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please fill in all required fields')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final response = await http.post(
      Uri.parse('http://192.168.1.155:8000/api/journal-entries/'),
      headers: {
        'Authorization': 'Token $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'date' :_dateController.text ,
        'debit_account': selectedDebitAccount,
        'credit_account': selectedCreditAccount,
        'description': _descriptionController.text,
        'debit_amount': _amountDebitController.text,
        'credit_amount': _amountCreditController.text,
      }),
    );

    print('Response status: ${response.statusCode}');
    print('Response body: ${response.body}');

    setState(() {
      _isLoading = false;
    });

    if (response.statusCode == 201) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Journal added successfully!')),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => Journal()),
      );
    } else if (response.statusCode == 401) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unauthorized: Please log in again.')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to add Journal')),
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
          "Add Journal",
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
                border: Border(
                  left: BorderSide(
                    color: BTNBlue,
                    width: 3,
                  ),
                  top: BorderSide(
                    color: BTNBlue,
                    width: 3,
                  ),
                ),
              ),
              child: SingleChildScrollView(
                child: Column(
                  children: <Widget>[
                    Text("Add new Journal", style: TextStyle(fontSize: 20)),
                    SizedBox(height: 20),
                    TextField(
                          controller: _dateController,
                          readOnly: true,
                          decoration: const InputDecoration(hintText: "Select date"),
                          onTap: () => onTapFunction(context: context),
                      ),
                      SizedBox(height: 20),
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: 'Enter journal description',
                      ),
                    ),
                    SizedBox(height: 20),
                    DropdownButtonFormField<int>(
                      decoration: InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: 'Select Debit Account',
                      ),
                      value: selectedDebitAccount,
                      onChanged: (int? newValue) {
                        setState(() {
                          selectedDebitAccount = newValue;
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
                      controller: _amountDebitController,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: 'Enter debit amount',
                      ),
                    ),
                    SizedBox(height: 20),
                    DropdownButtonFormField<int>(
                      decoration: InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: 'Select Credit Account',
                      ),
                      value: selectedCreditAccount,
                      onChanged: (int? newValue) {
                        setState(() {
                          selectedCreditAccount = newValue;
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
                      controller: _amountCreditController,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: 'Enter credit amount',
                      ),
                    ),
                    SizedBox(height: 30),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _addJournal,
                      style: ElevatedButton.styleFrom(
                        foregroundColor: Colors.white,
                        backgroundColor: BTNBlue,
                      ),
                      child: _isLoading
                          ? CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            )
                          : Text('Add Journal'),
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

  onTapFunction({required BuildContext context}) async {
    DateTime? pickedDate = await showDatePicker(
      context: context,
      lastDate: DateTime.now(),
      firstDate: DateTime(2015),
      initialDate: DateTime.now(),
    );
    if (pickedDate == null) return;
    _dateController.text = DateFormat('yyyy-MM-dd').format(pickedDate);
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