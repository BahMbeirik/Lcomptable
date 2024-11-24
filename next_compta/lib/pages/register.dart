// Register widget similar to Login with post request to /register/ endpoint
// ignore_for_file: unused_import

import 'package:flutter/material.dart';
import 'package:next_compta/pages/login.dart';
import 'package:next_compta/shared/colors.dart';
import 'package:next_compta/shared/constants.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class Register extends StatefulWidget {
  const Register({super.key});

  @override
  _RegisterState createState() => _RegisterState();
}

class _RegisterState extends State<Register> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _password2Controller = TextEditingController();

  Future<void> _register() async {
    final response = await http.post(
      Uri.parse('http://192.168.1.155:8000/api/auth/register/'),
      body: {
        'username': _usernameController.text,
        'email': _emailController.text,
        'password': _passwordController.text,
        'password2': _password2Controller.text,
      },
    );

    if (response.statusCode == 201) {
      // Registration successful, navigate to login
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const Login()),
      );
    } else {
      // Handle error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registration failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(33.0),
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 64),
                  TextField(
                    controller: _usernameController,
                    keyboardType: TextInputType.text,
                    decoration: decorationTextField.copyWith(
                      hintText: 'Enter Your UserName:',
                    ),
                  ),
                  const SizedBox(height: 33),
                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: decorationTextField.copyWith(
                      hintText: 'Enter Your Email:',
                    ),
                  ),
                  const SizedBox(height: 33),
                  TextField(
                    controller: _passwordController,
                    keyboardType: TextInputType.text,
                    obscureText: true,
                    decoration: decorationTextField.copyWith(
                      hintText: 'Enter Your Password:',
                    ),
                  ),
                  const SizedBox(height: 33),
                  TextField(
                    controller: _password2Controller,
                    keyboardType: TextInputType.text,
                    obscureText: true,
                    decoration: decorationTextField.copyWith(
                      hintText: 'Confirm Your Password:',
                    ),
                  ),
                  const SizedBox(height: 33),
                  ElevatedButton(
                    onPressed: _register,
                    child: Text(
                      "Sign up",
                      style: TextStyle(color: Colors.white, fontSize: 19),
                    ),
                    style: ButtonStyle(
                      backgroundColor: MaterialStateProperty.all(BTNBlue),
                      padding: MaterialStateProperty.all(EdgeInsets.all(12)),
                      shape: MaterialStateProperty.all(
                        RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 33),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text("Already have an account? ", style: TextStyle(fontSize: 16)),
                      TextButton(
                        onPressed: () {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (context) => const Login()),
                          );
                        },
                        child: Text('Sign in', style: TextStyle(color: Colors.black, fontSize: 20)),
                      )
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
