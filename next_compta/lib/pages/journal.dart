// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables, use_build_context_synchronously, avoid_print

import 'package:flutter/material.dart';
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/shared/drawer.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';


class Journal extends StatefulWidget {
  const Journal({super.key});

  @override
  State<Journal> createState() => _JournalState();
}

class _JournalState extends State<Journal> {
  List<Map<String, dynamic>> journals = [];
  List<Map<String, dynamic>> filteredJournals = [];
  bool loading = true;
  String searchText = '';

  @override
  void initState() {
    super.initState();
    fetchJournals(); 
  }

  // دالة لجلب البيانات من API
  Future<void> fetchJournals() async {
    
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      if (token == null) {
        print('Token is not available');
        return;
      }

      final response = await http.get(
        Uri.parse(
            'http://192.168.1.155:8000/api/journal-entries/'),
        headers: {
          'Authorization': 'Token $token',
        },
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body); // تحويل JSON إلى List
        setState(() {
          journals = List<Map<String, dynamic>>.from(data);
          filteredJournals = journals; 
          loading = false;
        });
      } else {
        print(
            'Failed to load journals: ${response.statusCode} - ${response.reasonPhrase}');
      }
    } catch (error) {
      print('Error fetching data: $error');
    }
  }

  void handleSearch(String value) {
    setState(() {
      searchText = value;
      // تصفية القيد بناءً على النص المدخل
      filteredJournals = journals.where((journal) {
        return 
            journal['debit_account'].toLowerCase().contains(value.toLowerCase()) ||
            journal['date'].toLowerCase().contains(value.toLowerCase()) ||
            journal['credit_account'].toLowerCase().contains(value.toLowerCase()) ||
            journal['description'].toLowerCase().contains(value.toLowerCase()) ||
            journal['debit_amount'].toString().contains(value) ||
            journal['credit_amount'].toString().contains(value);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text("Journals", style: TextStyle(color: Colors.white)),
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
                Text("The journal",
                    style:
                        TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                SizedBox(width: 10),
                IconButton(
                  icon: Icon(Icons.add, color: Colors.blueAccent, size: 40),
                  onPressed: () {
                    Navigator.pushNamed(context, '/addJournal');
                  },
                ),
              ],
            ),
            SizedBox(height: 10),
            TextField(
              decoration: InputDecoration(
                labelText: 'Search Journal',
                border: OutlineInputBorder(),
              ),
              onChanged: handleSearch,
            ),
            SizedBox(height: 15),
            Expanded(
              child: loading && journals.isEmpty
                  ? Center(child: CircularProgressIndicator())
                  : SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: SingleChildScrollView(
                        child: DataTable(
                          columns: [
                            DataColumn(
                              label: Text('Date',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Description',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Debit Account',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Debit Amount',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Credit Account',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            DataColumn(
                              label: Text('Credit Amount',
                                  style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          ],
                          rows: filteredJournals.map((account) {
                            return DataRow(cells: [
                              DataCell(Text(account['date'])),
                              DataCell(Text(account['description'])),
                              DataCell(Text(account['debit_account'])),
                              DataCell(Text(account['debit_amount'].toString())),
                              DataCell(Text(account['credit_account'])),
                              DataCell(Text(account['credit_amount'].toString())),
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
