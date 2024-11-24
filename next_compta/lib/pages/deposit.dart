// ignore_for_file: prefer_const_constructors, use_build_context_synchronously, prefer_const_literals_to_create_immutables

import 'package:flutter/material.dart';
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/shared/drawer.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class Deposit extends StatefulWidget {
  const Deposit({super.key});

  @override
  State<Deposit> createState() => _DepositState();
}

class _DepositState extends State<Deposit> {
  List<Map<String, dynamic>> deposits = [];
  List<Map<String, dynamic>> filteredDeposits = [];
  bool loading = true;
  String searchText = '';

    @override
  void initState() {
    super.initState();
    fetchDeposits();
  }

  Future<void> fetchDeposits() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      if (token == null) {
        print('Token is not available');
        return;
      }

      final response = await http.get(
        Uri.parse('http://192.168.1.155:8000/api/deposits/'),
        headers: {
          'Authorization': 'Token $token',
        },
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        setState(() {
          deposits = List<Map<String, dynamic>>.from(data);
          filteredDeposits = deposits;
          loading = false;
        });
      } else {
        print('Failed to load deposits: ${response.statusCode} - ${response.reasonPhrase}');
      }
    } catch (error) {
      print('Error fetching data: $error');
    }
  }

  void handleSearch(String value) {
    setState(() {
      searchText = value;
      filteredDeposits = deposits.where((deposit) {
        return deposit['amount'].toString().contains(value) ||
            deposit['interest_rate'].toLowerCase().contains(value.toLowerCase()) ||
            deposit['deposit_date'].toLowerCase().contains(value.toLowerCase()) ||
            deposit['account_name'].toLowerCase().contains(value.toLowerCase()) ||
            deposit['maturity_date'].toLowerCase().contains(value.toLowerCase());
      }).toList();
    });
  }

  Future<void> deleteDeposit(int depositId) async {
    final prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('token');
    
    if (token == null) {
      print('Token is not available');
      return;
    }
    
    final response = await http.delete(
      Uri.parse('http://192.168.1.155:8000/api/deposits/$depositId/'),
      headers: {
        'Authorization': 'Token $token',
      },
    );
    
    if (response.statusCode == 204) {
      setState(() {
        deposits.removeWhere((deposit) => deposit['id'] == depositId);
        filteredDeposits = deposits;
      });
    } else {
      print('Failed to delete deposits: ${response.statusCode} - ${response.reasonPhrase}');
    }
  }

  void editDeposit(int depositId) {
    // قم بإعادة توجيه المستخدم إلى صفحة تعديل المعاملة
    Navigator.pushNamed(context, '/editDeposit', arguments: depositId);
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text("Deposits", style: TextStyle(color: Colors.white)),
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
                Text("The deposits",
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                SizedBox(width: 10),
                IconButton(
                  icon: Icon(Icons.add, color: Colors.blueAccent, size: 40),
                  onPressed: () {
                    Navigator.pushNamed(context, '/addDeposit');
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
              child: loading && deposits.isEmpty
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
                              label: Text('Deposit Date',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Maturity Date',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Actions',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          ],
                          rows: filteredDeposits.map((deposit) {
                            return DataRow(cells: [
                              DataCell(Text(deposit['account_name'])),
                              DataCell(Text(deposit['amount'].toString())),
                              DataCell(Text(deposit['interest_rate'])),
                              DataCell(Text(deposit['deposit_date'])),
                              DataCell(Text(deposit['maturity_date'])),
                              
                              DataCell(
                                Row(
                                  children: [
                                    IconButton(
                                      icon: Icon(Icons.edit ,color: Colors.blueAccent,),
                                      onPressed: () => editDeposit(deposit['id']),
                                    ),
                                    IconButton(
                                      icon: Icon(Icons.delete ,color: Colors.redAccent,),
                                      onPressed: () => deleteDeposit(deposit['id']),
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