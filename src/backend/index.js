require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://lrklhdizqhzzuqntsdnn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2xoZGl6cWh6enVxbnRzZG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0ODI3MTUsImV4cCI6MjAzMTA1ODcxNX0.KZNvqVyxzqePjb9OTlQUIKwf5922oCLXSHDc_YqA87M')


const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



app.post('/register', async (req, res) => {
  console.log("PORT:", PORT);
  try {
    const { email, password, first_name, last_name } = req.body;
    
    console.log('email', email);
    console.log('password', password);
    console.log('first_name', first_name);
    console.log('last_name', last_name);

    const hashedPassword = await bcrypt.hash(password, 8);  // Ensure this line is executed

    const {data, error} = await supabase
            .from('profiles')
            .insert({ email, password, first_name, last_name})
            .throwOnError()

    // Assuming you have a user handling logic:
    console.log(supabase)
    res.status(201).send('User registered');
  } catch (error) {
    console.error(error);  // Log the actual error to see what's happening
    res.status(500).send('Error registering user');
  }
});