
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// Login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username }, 'fingerprint_customer', {
    expiresIn: '1h'
  });

  req.session.authorization = { accessToken: token, username };
  return res.status(200).json({
    message: 'User successfully logged in',
    token
  });
});

// Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const username = req.session.authorization?.username;
  const isbn = req.params.isbn;
  // Accept review from body OR query string (Coursera tests use ?review=...)
  const review = req.body.review || req.query.review;

  if (!username) {
    return res.status(401).json({ message: 'Please log in first' });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!review || !review.trim()) {
    return res.status(400).json({ message: 'A review is required' });
  }

  books[isbn].reviews[username] = review.trim();

  return res.status(200).json({ message: 'Review added successfully' });
});

// Delete a book review (only the logged-in user can delete their own review)
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const username = req.session.authorization?.username;
  const isbn = req.params.isbn;

  if (!username) {
    return res.status(401).json({ message: 'Please log in first' });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: 'No review found for this user' });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({ message: 'Review deleted successfully' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
