import 'package:flutter/material.dart';
import 'package:next_compta/pages/AddJournal.dart';
import 'package:next_compta/pages/accounts.dart';
import 'package:next_compta/pages/addAccount.dart';
import 'package:next_compta/pages/addDeposit.dart';
import 'package:next_compta/pages/addLoan.dart';
import 'package:next_compta/pages/addTransaction.dart';
import 'package:next_compta/pages/editDeposit.dart';
import 'package:next_compta/pages/editLoan.dart';
import 'package:next_compta/pages/editTransaction.dart';
import 'package:next_compta/pages/login.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Next Compta',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.light(useMaterial3: true),
      initialRoute: '/',
      routes: {
        '/': (context) => FutureBuilder<bool>(
              future: _checkLoginStatus(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.data == true) {
                  return const Accounts();
                } else {
                  return const Login();
                }
              },
            ),
        '/login': (context) => const Login(),
        '/accounts': (context) => const Accounts(),
        '/addAccount': (context) => const Addaccount(),
        '/addTransaction': (context) => const Addtransaction(),
        '/editTransaction': (context) => EditTransaction(transactionId: ModalRoute.of(context)!.settings.arguments as int),
        '/addLoan': (context) => const Addloan(),
        '/editLoan': (context) => Editloan(loanId: ModalRoute.of(context)!.settings.arguments as int),
        '/addDeposit': (context) => const Adddeposit(),
        '/editDeposit': (context) => Editdeposit(depositId: ModalRoute.of(context)!.settings.arguments as int),
        '/addJournal': (context) => const Addjournal(),
      },
    );
  }

  Future<bool> _checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    return token != null;
  }
}
