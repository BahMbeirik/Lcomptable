// ignore_for_file: prefer_const_constructors, use_build_context_synchronously, prefer_const_literals_to_create_immutables

import 'package:flutter/material.dart';
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/shared/drawer.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class Transaction extends StatefulWidget {
  const Transaction({super.key});

  @override
  State<Transaction> createState() => _TransactionState();
}

class _TransactionState extends State<Transaction> {
  List<Map<String, dynamic>> transactions = [];
  List<Map<String, dynamic>> filteredTransactions = [];
  bool loading = true;
  String searchText = '';

  @override
  void initState() {
    super.initState();
    fetchTransactions();
  }

  Future<void> fetchTransactions() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      if (token == null) {
        print('Token is not available');
        return;
      }

      final response = await http.get(
        Uri.parse('http://192.168.1.155:8000/api/transactions/'),
        headers: {
          'Authorization': 'Token $token',
        },
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        setState(() {
          transactions = List<Map<String, dynamic>>.from(data);
          filteredTransactions = transactions;
          loading = false;
        });
      } else {
        print('Failed to load transactions: ${response.statusCode} - ${response.reasonPhrase}');
      }
    } catch (error) {
      print('Error fetching data: $error');
    }
  }

  void handleSearch(String value) {
    setState(() {
      searchText = value;
      filteredTransactions = transactions.where((transaction) {
        return transaction['amount'].toString().contains(value) ||
            transaction['transaction_type'].toLowerCase().contains(value.toLowerCase()) ||
            transaction['description'].toLowerCase().contains(value.toLowerCase()) ||
            transaction['account_name'].toLowerCase().contains(value.toLowerCase()) ||
            transaction['date'].toLowerCase().contains(value.toLowerCase());
      }).toList();
    });
  }

  Future<void> deleteTransaction(int transactionId) async {
    final prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('token');
    
    if (token == null) {
      print('Token is not available');
      return;
    }
    
    final response = await http.delete(
      Uri.parse('http://192.168.1.155:8000/api/transactions/$transactionId/'),
      headers: {
        'Authorization': 'Token $token',
      },
    );
    
    if (response.statusCode == 204) {
      setState(() {
        transactions.removeWhere((transaction) => transaction['id'] == transactionId);
        filteredTransactions = transactions;
      });
    } else {
      print('Failed to delete transaction: ${response.statusCode} - ${response.reasonPhrase}');
    }
  }

  void editTransaction(int transactionId) {
    // قم بإعادة توجيه المستخدم إلى صفحة تعديل المعاملة
    Navigator.pushNamed(context, '/editTransaction', arguments: transactionId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text("Transactions", style: TextStyle(color: Colors.white)),
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
                Text("The transactions",
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                SizedBox(width: 10),
                IconButton(
                  icon: Icon(Icons.add, color: Colors.blueAccent, size: 40),
                  onPressed: () {
                    Navigator.pushNamed(context, '/addTransaction');
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
              child: loading && transactions.isEmpty
                  ? Center(child: CircularProgressIndicator())
                  : SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: SingleChildScrollView(
                        child: DataTable(
                          columns: [
                            DataColumn(
                              label: Text('Type',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Date',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Amount',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Description',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Account',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Actions',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          ],
                          rows: filteredTransactions.map((transaction) {
                            return DataRow(cells: [
                              DataCell(Text(transaction['transaction_type'])),
                              DataCell(Text(transaction['date'])),
                              DataCell(Text(transaction['amount'].toString())),
                              DataCell(Text(transaction['description'])),
                              DataCell(Text(transaction['account_name'])),
                              DataCell(
                                Row(
                                  children: [
                                    IconButton(
                                      icon: Icon(Icons.edit ,color: Colors.blueAccent,),
                                      onPressed: () => editTransaction(transaction['id']),
                                    ),
                                    IconButton(
                                      icon: Icon(Icons.delete ,color: Colors.redAccent,),
                                      onPressed: () => deleteTransaction(transaction['id']),
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
