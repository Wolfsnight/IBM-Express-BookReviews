const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Benutzername und Passwort erforderlich" });
  }
  if (users[username]) {
    return res.status(409).json({ message: "Benutzername bereits vergeben" });
  }
  users[username] = { username, password };
  return res.status(200).json({ message: "Benutzer erfolgreich registriert" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Buch nicht gefunden" });
  }
 });

// Get book details based on the author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const filteredBooks = Object.values(books).filter(book =>
    book.author.toLowerCase() === author
  );
  return res.status(200).json(filteredBooks);
});

// Get all books based on the title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const filteredBooks = Object.values(books).filter(book =>
    book.title.toLowerCase() === title
  );
  return res.status(200).json(filteredBooks);
});

//  Get the book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Rezensionen nicht gefunden" });
  }
});

// Aufgabe 10: Bücherliste mit Async/Await (lokaler Callback statt Axios)
public_users.get('/async/books', async (req, res) => {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(books);
        }, 100); // Simuliert eine asynchrone Callback-Verzögerung
      });
    };

    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "Fehler beim Abrufen der Bücherliste" });
  }
});

// Aufgabe 11: Buchdetails nach ISBN mit Promise
public_users.get('/async/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  const findBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Buch nicht gefunden");
      }
    });
  };

  findBookByISBN(isbn)
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ message: error }));
});

// Aufgabe 12: Buchdetails nach Autor mit Async/Await (lokaler Callback statt Axios)
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();
    const getBooksByAuthor = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const filteredBooks = Object.values(books).filter(book =>
            book.author.toLowerCase() === author
          );
          resolve(filteredBooks);
        }, 100); // simuliert asynchronen Zugriff
      });
    };

    const results = await getBooksByAuthor();
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: "Fehler beim Abrufen der Bücher nach Autor" });
  }
});

// Aufgabe 13: Buchdetails nach Titel mit Promise (lokale Suche, kein Axios)
public_users.get('/async/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const findBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      const matches = Object.values(books).filter(book =>
        book.title.toLowerCase() === title
      );
      if (matches.length > 0) {
        resolve(matches);
      } else {
        reject("Titel nicht gefunden");
      }
    });
  };

  findBooksByTitle(title)
    .then(result => res.status(200).json(result))
    .catch(error => res.status(404).json({ message: error }));
});

module.exports.general = public_users;
