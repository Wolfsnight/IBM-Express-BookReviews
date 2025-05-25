const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const registered_users = express.Router();

let users = {
	"cody": {
		"username": "Cody",
		"password": "12345678"
	}
};



//only registered users can log in
registered_users.post("/login", (req, res) => {
	const username = req.body?.username;
	const password = req.body?.password;
	if (!username || !password) {
		return res.status(400).json({ message: "Benutzername und Passwort erforderlich" });
	}

	const normalizedUsername = Object.keys(users).find(
	  key => key.toLowerCase() === username.toLowerCase()
	);
	const user = users[normalizedUsername];

	if (!user) {
	  return res.status(401).json({ message: "Benutzer nicht gefunden" });
	}

	if (user.password !== password) {
	  return res.status(401).json({ message: "Falsches Passwort" });
	}

	const accessToken = jwt.sign({username: user.username}, "access",
		{expiresIn: '1h'});
	req.session.authorization = {accessToken, username: user.username};

	return res.status(200).json({message: "Anmeldung erfolgreich"});
});

// Add a book review
registered_users.put("/auth/review/:isbn", (req, res) => {
	const isbn = req.params.isbn;
	const review = req.query.review;
	const username = req.session.authorization?.username;

	if (!username || !review) {
		return res.status(400).json(
			{message: "Bewertung und Benutzer erforderlich"});
	}

	if (!books[isbn]) {
		return res.status(404).json({message: "Buch nicht gefunden"});
	}

	books[isbn].reviews[username] = review;
	return res.status(200).json(
		{message: "Bewertung erfolgreich hinzugefügt/aktualisiert"});
});

registered_users.delete("/auth/review/:isbn", (req, res) => {
	const isbn = req.params.isbn;
	const username = req.session.authorization?.username;

	if (!username) {
		return res.status(400).json({message: "Benutzer nicht angemeldet"});
	}

	if (!books[isbn] || !books[isbn].reviews[username]) {
		return res.status(404).json({message: "Bewertung nicht gefunden"});
	}

	delete books[isbn].reviews[username];
	return res.status(200).json({message: "Bewertung erfolgreich gelöscht"});
});

module.exports.authenticated = registered_users;
module.exports.users = users;
