const jwt = require("jsonwebtoken");
import bd from "../bd/postgresql";

const secret_key = "banana";

export const register = async (req, res, next) => {
  if (req.body) {
    const { email, password } = req.body;
    if (email && password) {
      //verify if email already exists
      let rep = await bd.from("users").where("email", email);
      if (rep.length < 1) {
        let rep2 = await bd("users").insert({
          email: email,
          password: password
        });
        console.log(rep2);
        res.send(`${email} added to the database`);
      } else {
        res.send("This email already exists in the database");
      }
    } else {
      res.send({
        sucess: false,
        token: "You need to send an email and a password"
      });
    }
  }
};

//génération du token
export const authentification = async (req, res, next) => {
  if (req.body) {
    const { email, password } = req.body;
    if (email && password) {
      //verify if email and password matche
      let rep = await bd
        .from("users")
        .where("email", email)
        .where("password", password);
      if (rep.length > 0) {
        //if it matches
        var token = jwt.sign({ id: rep[0].id }, secret_key, {
          expiresIn: "59m"
        });
        res.send({ sucess: true, token: token });
      } else {
        res.send("Email and password doesn't match");
      }
      //ajouter dans la BD le token
      //TODO
    } else {
      res.send({
        sucess: false,
        token: "You need to send an email and a password"
      });
    }
  } else {
    res.send({ sucess: false, token: "No token for you" });
  }
  return null;
};

//est-ce qu'il est authentifier/token valide ?
export const authenticated = async token => {
  //verify token here
  try {
    var decoded = jwt.verify(token.split(" ")[1], secret_key);
    let rep = await bd.from("users").where("id", decoded.id);
    if (rep.length > 0) {
      return rep[0];
    } else {
      return { error: "incorrect informations in the token" };
    }
  } catch (err) {
    return { error: "invalidable token" };
  }
};
