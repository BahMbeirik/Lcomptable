// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:next_compta/pages/login.dart';
import 'dart:convert';

import 'package:next_compta/shared/colors.dart';
import 'package:next_compta/shared/drawer.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CurrencyConverter extends StatefulWidget {
  @override
  _CurrencyConverterState createState() => _CurrencyConverterState();
}

class _CurrencyConverterState extends State<CurrencyConverter> {
  String fromCurrency = 'MRU';
  String toCurrency = 'USD';
  String amount = '';
  String? convertedAmount;

  final List<String> currencies = ['MRU', 'USD', 'EUR', 'GBP', 'SAR'];

  Future<void> handleConvert() async {
    final response = await http.get(
      Uri.parse('http://192.168.1.155:8000/api/convert/$fromCurrency/$toCurrency/$amount'),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      setState(() {
        convertedAmount = data['converted_amount'].toString();
      });
    } else {
      print('Error: ${response.statusCode}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appbarBlue,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text('Currency Converter', style: TextStyle(color: Colors.white)),
      ),
      drawer: appDrawer(context),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              'Convert',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 20),
            TextField(
              decoration: InputDecoration(labelText: 'Amount'),
              keyboardType: TextInputType.number,
              onChanged: (value) {
                setState(() {
                  amount = value;
                });
              },
            ),
            SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                DropdownButton<String>(
                  value: fromCurrency,
                  items: currencies.map((String currency) {
                    return DropdownMenuItem<String>(
                      value: currency,
                      child: Text(currency),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      fromCurrency = value!;
                    });
                  },
                ),
                Icon(Icons.currency_exchange_outlined, color: Colors.blueAccent),
              DropdownButton<String>(
              value: toCurrency,
              items: currencies.map((String currency) {
                return DropdownMenuItem<String>(
                  value: currency,
                  child: Text(currency),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  toCurrency = value!;
                });
              },
            ),
              ],
            ),
          
          
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: handleConvert,
              child: Text('Convert'),
            ),
              SizedBox(height: 20),
            if (convertedAmount != null)
              Text(
                'Converted Amount: $convertedAmount $toCurrency',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
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
