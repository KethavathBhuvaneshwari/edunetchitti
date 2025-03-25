// Grab elements from the DOM
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const transactionForm = document.getElementById('transaction-form');
const responseMessage = document.getElementById('response-message');
const errorMessageDisplay = document.getElementById('error-message');

// Register Form Submission
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (response.ok) {
      responseMessage.textContent = 'Registration Successful!';
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  } catch (error) {
    errorMessageDisplay.textContent = error.message;
  }
});

// Login Form Submission
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('authToken', data.token); // Store JWT
      responseMessage.textContent = 'Login successful! You can now make transactions.';
      loginForm.style.display = 'none';
      transactionForm.style.display = 'block';
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    errorMessageDisplay.textContent = error.message;
  }
});

// Transaction Form Submission
transactionForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const receiverEmail = document.getElementById('receiver-email').value;
  const amount = document.getElementById('amount').value;
  const description = document.getElementById('description').value;
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch('/api/transactions/transfer', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ receiverEmail, amount, description })
    });
    const data = await response.json();
    if (response.ok) {
      responseMessage.textContent = 'Transaction Successful!';
    } else {
      throw new Error(data.message || 'Transaction failed');
    }
  } catch (error) {
    errorMessageDisplay.textContent = error.message;
  }
});