import 'package:flutter/material.dart';
import 'package:next_compta/pages/accounts.dart';
import 'package:next_compta/pages/currentconverter.dart';
import 'package:next_compta/pages/deposit.dart';
import 'package:next_compta/pages/interestcalculator.dart';
import 'package:next_compta/pages/journal.dart';
import 'package:next_compta/pages/loan.dart';
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/pages/raport.dart';
import 'package:next_compta/pages/transaction.dart';
import 'package:next_compta/pages/transactionRaport.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:shared_preferences/shared_preferences.dart';


Drawer appDrawer(BuildContext context) {
  void _logout() async {
    final prefs = await SharedPreferences.getInstance();
    prefs.remove('token'); // Clear token from secure storage
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const Login()),
    );
  }

  
  return Drawer(
    backgroundColor: appbarBlue,
    child: Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          children: [
            UserAccountsDrawerHeader(
              decoration: BoxDecoration(
                image: DecorationImage(
                    image: AssetImage("assets/images/bg.jpeg"),
                    fit: BoxFit.cover),
              ),
              currentAccountPicture: CircleAvatar(
                  radius: 55,
                  backgroundImage: AssetImage("assets/images/logo.png")),
              accountName: Text("Bahah M'beirik",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  )),
              accountEmail: Text("Bah008@gmail.com",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  )),
            ),
            _buildListTile(
                context, "Accounts", Icons.account_balance, Accounts()),
            _buildListTile(
                context, "Transactions", Icons.compare_arrows, Transaction()),
            _buildListTile(context, "Journal", Icons.book_online, Journal()),
            _buildListTile(context, "Loan", Icons.money, Loan()),
            _buildListTile(context, "Deposit", Icons.money, Deposit()),
            _buildListTile(context, "Transaction Report",
                Icons.file_present_outlined, TransactionReport()),
            _buildListTile(context, "Financial Report",
                Icons.file_present_sharp, FinancialReport()),
            _buildListTile(context, "Currency Converter",
                Icons.currency_exchange, CurrencyConverter()),
            _buildListTile(context, "Interest Calculator",
                Icons.interests_outlined, InterestCalculator()),
            ListTile(
              title: Text("Logout",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  )),
              leading: Icon(Icons.exit_to_app, color: Colors.white),
              onTap: () {
                _logout();
              },
            ),
          ],
        ),
        Container(
          margin: EdgeInsets.only(bottom: 12),
          child: Text("Developed by Bahah M'beirik © 2024",
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              )),
        ),
      ],
    ),
  );
  
}

ListTile _buildListTile(BuildContext context, String title, IconData icon, Widget screen) {
  return ListTile(
    title: Text(title,
        style: TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        )),
    leading: Icon(icon, color: Colors.white),
    onTap: () {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => screen,
        ),
      );
    },
  );
}


  
