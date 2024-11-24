import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fl_chart/fl_chart.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:next_compta/shared/drawer.dart';
import 'package:shared_preferences/shared_preferences.dart';

class InterestCalculator extends StatefulWidget {
  @override
  _InterestCalculatorState createState() => _InterestCalculatorState();
}

class _InterestCalculatorState extends State<InterestCalculator> {
  List<dynamic> loans = [];
  List<dynamic> deposits = [];
  String selectedLoan = '';
  String selectedDeposit = '';
  double? interest, principal, rate, totalPayable;
  int? tenure;
  bool isLoanActive = true; 

  @override
  void initState() {
    super.initState();
    fetchLoans();
    fetchDeposits();
  }

  Future<void> fetchLoans() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null || token.isEmpty) {
      print('Error: No token found');
      return;
    }

    final response = await http.get(
      Uri.parse('http://192.168.1.155:8000/api/loans/'),
      headers: {
        'Authorization': 'Token $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      setState(() {
        loans = json.decode(response.body);
      });
    } else {
      print('Error fetching loans: ${response.statusCode}');
    }
  }

  Future<void> fetchDeposits() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null || token.isEmpty) {
      print('Error: No token found');
      return;
    }

    final response = await http.get(
      Uri.parse('http://192.168.1.155:8000/api/deposits/'),
      headers: {
        'Authorization': 'Token $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      setState(() {
        deposits = json.decode(response.body);
      });
    } else {
      print('Error fetching deposits: ${response.statusCode}');
    }
  }

  Future<void> handleCalculateLoan() async {
    if (selectedLoan.isNotEmpty) {
      final response = await http.get(
        Uri.parse(
            'http://192.168.1.155:8000/api/loans/$selectedLoan/calculate_interest'),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          interest = data['interest'];
          principal = data['principal'];
          rate = data['rate'];
          tenure = data['tenure'];
          totalPayable = data['total_payable'];
        });
      } else {
        print('Error calculating interest: ${response.statusCode}');
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Please select a loan to calculate interest.")),
      );
    }
  }

  Future<void> handleCalculateDeposit() async {
    if (selectedDeposit.isNotEmpty) {
      final response = await http.get(
        Uri.parse(
            'http://192.168.1.155:8000/api/deposits/$selectedDeposit/calculate_interestDeposit'),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          interest = data['interest'];
          principal = data['principal'];
          rate = data['rate'];
          tenure = data['tenure'];
          totalPayable = data['total_payable'];
        });
      } else {
        print('Error calculating interest: ${response.statusCode}');
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Please select a deposit to calculate interest.")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text('Interest Calculator', style: TextStyle(color: Colors.white)),
      ),
      drawer: appDrawer(context),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  onPressed: () => setState(() => isLoanActive = true),
                  child: Text('Load'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isLoanActive ? Colors.blue : Colors.grey,
                  ),
                ),
                ElevatedButton(
                  onPressed: () => setState(() => isLoanActive = false),
                  child: Text('Deposit'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: !isLoanActive ? Colors.blue : Colors.grey,
                  ),
                ),
              ],
            ),
            SizedBox(height: 20),
            DropdownButtonFormField(
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Select Account',
              ),
              value: isLoanActive
                  ? selectedLoan.isNotEmpty
                      ? selectedLoan
                      : null
                  : selectedDeposit.isNotEmpty
                      ? selectedDeposit
                      : null,
              items: (isLoanActive ? loans : deposits).map((item) {
                return DropdownMenuItem<String>(
                  value: item['id'].toString(),
                  child: Text(item['account_name'] ?? 'Unknown'),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  if (isLoanActive) {
                    selectedLoan = value!;
                  } else {
                    selectedDeposit = value!;
                  }
                });
              },
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: isLoanActive ? handleCalculateLoan : handleCalculateDeposit,
              child: Text('Calculate Interest'),
            ),
            SizedBox(height: 20),
            if (interest != null) ...[
              Text('Principal: ${principal?.toStringAsFixed(2)} MRU'),
              Text('Rate of Interest: ${rate?.toStringAsFixed(2)}%'),
              Text('Tenure: $tenure months'),
              Text('Total Payable: ${totalPayable?.toStringAsFixed(2)} MRU'),
              SizedBox(height: 20),
              Container(
                height: 250,
                child: PieChart(
                  PieChartData(
                    sections: [
                      PieChartSectionData(
                        color: Colors.green,
                        value: principal ?? 0,
                        title: 'Principal',
                      ),
                      PieChartSectionData(
                        color: Colors.blue,
                        value: interest ?? 0,
                        title: 'Interest',
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
