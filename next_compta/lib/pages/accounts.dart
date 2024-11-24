// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables, use_build_context_synchronously, avoid_print

import 'package:flutter/material.dart';
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/shared/drawer.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class Accounts extends StatefulWidget {
  const Accounts({super.key});

  @override
  State<Accounts> createState() => _AccountsState();
}

class _AccountsState extends State<Accounts> {
  List<Map<String, dynamic>> accounts = [];
  List<Map<String, dynamic>> filteredAccounts = [];
  bool loading = true;
  String searchText = '';

  @override
  void initState() {
    super.initState();
    fetchAccounts(); // جلب الحسابات عند تحميل الصفحة
  }

  // دالة لجلب البيانات من API
  Future<void> fetchAccounts() async {
    
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      if (token == null) {
        print('Token is not available');
        return;
      }

      final response = await http.get(
        Uri.parse(
            'http://192.168.1.155:8000/api/accounts/'),
        headers: {
          'Authorization': 'Token $token',
        },
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body); // تحويل JSON إلى List
        setState(() {
          accounts = List<Map<String, dynamic>>.from(data);
          filteredAccounts = accounts; // في البداية عرض جميع الحسابات
          loading = false;
        });
      } else {
        print(
            'Failed to load accounts: ${response.statusCode} - ${response.reasonPhrase}');
      }
    } catch (error) {
      print('Error fetching data: $error');
    }
  }

  void handleSearch(String value) {
    setState(() {
      searchText = value;
      // تصفية الحسابات بناءً على النص المدخل
      filteredAccounts = accounts.where((account) {
        return account['account_number'].toLowerCase().contains(value.toLowerCase()) ||
            account['name'].toLowerCase().contains(value.toLowerCase()) ||
            account['account_type']
                .toLowerCase()
                .contains(value.toLowerCase()) ||
            account['balance'].toString().contains(value);
      }).toList();
    });
  }



  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text("Accounts", style: TextStyle(color: Colors.white)),
      ),
      drawer:appDrawer(context),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Text("The accounts",
                    style:
                        TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                SizedBox(width: 10),
                IconButton(
                  icon: Icon(Icons.add, color: Colors.blueAccent, size: 40),
                  onPressed: () {
                    Navigator.pushNamed(context, '/addAccount');
                  },
                ),
              ],
            ),
            SizedBox(height: 10),
            TextField(
              decoration: InputDecoration(
                labelText: 'Search Accounts',
                border: OutlineInputBorder(),
              ),
              onChanged: handleSearch,
            ),
            SizedBox(height: 15),
            Expanded(
              child: loading && accounts.isEmpty
                  ? Center(child: CircularProgressIndicator())
                  : SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: SingleChildScrollView(
                        child: DataTable(
                          columns: [
                            DataColumn(
                              label: Text('Account Number',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Account Name',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Account Type',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Balance',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          ],
                          rows: filteredAccounts.map((account) {
                            return DataRow(cells: [
                              DataCell(Text(account['account_number'])),
                              DataCell(Text(account['name'])),
                              DataCell(Text(account['account_type'])),
                              DataCell(Text(account['balance'].toString())),
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
    prefs.remove('token'); // Clear token from secure storage
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const Login()),
    );
  }
}
