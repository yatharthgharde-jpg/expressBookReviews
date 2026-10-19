
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  users.push({ username, password });
  return res.status(200).json({ message: 'User successfully registered' });
});

// Get all books (base endpoint – used by ISBN/author/title via Axios)
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Get book by ISBN – async/await with Axios
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5050/');
    const book = response.data[req.params.isbn];
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
});

// Get books by author – async/await with Axios
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5050/');
    const author = req.params.author.toLowerCase();
    const result = Object.values(response.data).filter(
      book => book.author.toLowerCase() === author
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching books by author', error: error.message });
  }
});

// Get books by title – async/await with Axios
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5050/');
    const title = req.params.title.toLowerCase();
    const result = Object.values(response.data).filter(
      book => book.title.toLowerCase().includes(title)
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching books by title', error: error.message });
  }
});

// Get reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
