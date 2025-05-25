const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const genl_routes = require("./router/general.js").general;
const customer_routes = require("./router/auth_users.js").authenticated;

const app = express();


app.use(express.json());

app.use(session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

app.use("/customer", customer_routes);

const authMiddleware = async (req, res, next) => {
  try {
    if (req.session && req.session.authorization) {
      const token = req.session.authorization?.accessToken;
      const secret = process.env.JWT_SECRET || "default_secret";
      req.user = jwt.verify(token, secret);
      return next();
    } else {
      return res.status(403).json({ message: "Benutzer nicht angemeldet" });
    }
  } catch (err) {
    console.error("Fehler bei der Token-Validierung:", err);
    return res.status(403).json({ message: "Benutzer nicht authentifiziert" });
  }
};
app.use("/customer/auth/*", authMiddleware);

app.use("/", genl_routes);

const PORT = 5050;
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});
