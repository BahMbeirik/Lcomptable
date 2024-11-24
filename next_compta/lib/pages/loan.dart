// ignore_for_file: prefer_const_constructors, use_build_context_synchronously, prefer_const_literals_to_create_immutables

import 'package:flutter/material.dart';
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/shared/drawer.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class Loan extends StatefulWidget {
  const Loan({super.key});

  @override
  State<Loan> createState() => _LoanState();
}

class _LoanState extends State<Loan> {
  List<Map<String, dynamic>> loans = [];
  List<Map<String, dynamic>> filteredLoans = [];
  bool loading = true;
  String searchText = '';

    @override
  void initState() {
    super.initState();
    fetchLoans();
  }

  Future<void> fetchLoans() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      if (token == null) {
        print('Token is not available');
        return;
      }

      final response = await http.get(
        Uri.parse('http://192.168.1.155:8000/api/loans/'),
        headers: {
          'Authorization': 'Token $token',
        },
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        setState(() {
          loans = List<Map<String, dynamic>>.from(data);
          filteredLoans = loans;
          loading = false;
        });
      } else {
        print('Failed to load loans: ${response.statusCode} - ${response.reasonPhrase}');
      }
    } catch (error) {
      print('Error fetching data: $error');
    }
  }

    void handleSearch(String value) {
    setState(() {
      searchText = value;
      filteredLoans = loans.where((loan) {
        return loan['amount'].toString().contains(value) ||
            loan['interest_rate'].toLowerCase().contains(value.toLowerCase()) ||
            loan['start_date'].toLowerCase().contains(value.toLowerCase()) ||
            loan['account_name'].toLowerCase().contains(value.toLowerCase()) ||
            loan['end_date'].toLowerCase().contains(value.toLowerCase());
      }).toList();
    });
  }

  Future<void> deleteLoan(int loanId) async {
    final prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('token');
    
    if (token == null) {
      print('Token is not available');
      return;
    }
    
    final response = await http.delete(
      Uri.parse('http://192.168.1.155:8000/api/loans/$loanId/'),
      headers: {
        'Authorization': 'Token $token',
      },
    );
    
    if (response.statusCode == 204) {
      setState(() {
        loans.removeWhere((loan) => loan['id'] == loanId);
        filteredLoans = loans;
      });
    } else {
      print('Failed to delete loans: ${response.statusCode} - ${response.reasonPhrase}');
    }
  }

  void editLoan(int loanId) {
    // قم بإعادة توجيه المستخدم إلى صفحة تعديل المعاملة
    Navigator.pushNamed(context, '/editLoan', arguments: loanId);
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text("Loans", style: TextStyle(color: Colors.white)),
      ),
      drawer: appDrawer(context),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Text("The loans",
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                SizedBox(width: 10),
                IconButton(
                  icon: Icon(Icons.add, color: Colors.blueAccent, size: 40),
                  onPressed: () {
                    Navigator.pushNamed(context, '/addLoan');
                  },
                ),
              ],
            ),
            SizedBox(height: 10),
            TextField(
              decoration: InputDecoration(
                labelText: 'Search Transactions',
                border: OutlineInputBorder(),
              ),
              onChanged: handleSearch,
            ),
            SizedBox(height: 15),
            Expanded(
              child: loading && loans.isEmpty
                  ? Center(child: CircularProgressIndicator())
                  : SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: SingleChildScrollView(
                        child: DataTable(
                          columns: [
                            DataColumn(
                              label: Text('Account',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Amount',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Interest Rate',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Start Date',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('End Date',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Actions',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          ],
                          rows: filteredLoans.map((loan) {
                            return DataRow(cells: [
                              DataCell(Text(loan['account_name'])),
                              DataCell(Text(loan['amount'].toString())),
                              DataCell(Text(loan['interest_rate'])),
                              DataCell(Text(loan['start_date'])),
                              DataCell(Text(loan['end_date'])),
                              
                              DataCell(
                                Row(
                                  children: [
                                    IconButton(
                                      icon: Icon(Icons.edit ,color: Colors.blueAccent,),
                                      onPressed: () => editLoan(loan['id']),
                                    ),
                                    IconButton(
                                      icon: Icon(Icons.delete ,color: Colors.redAccent,),
                                      onPressed: () => deleteLoan(loan['id']),
                                    ),
                                  ],
                                ),
                              ),
                            ]);
                          }).toList(),
                        ),
                      ),
                    ),
            ),
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
}