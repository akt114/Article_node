const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const config = require("./config/database");

mongoose.connect(config.database);
let db = mongoose.connection;

//check connection
db.once("open", function() {
  console.log("connected to MongoDb");
});

//check for db errors
db.on("error", function(err) {
  console.log(err);
});

//Init App
const app = express();

//bring in models
let Article = require("./models/article");

//load view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
//Set public folder
app.use(express.static(path.join(__dirname, "public")));
//express session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);
//express message middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//express validator middleware
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

// Passport Config
require("./config/passport")(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

//home route
app.get("/", function(req, res) {
  // res.send("Hello World");
  // let articles = [
  //   {
  //     id: 1,
  //     title: "Article 1",
  //     author: "Amit Tiwary",
  //     body: "This is article 1"
  //   },
  //   {
  //     id: 2,
  //     title: "Article 2",
  //     author: "MS Dhoni",
  //     body: "This is article 2"
  //   },
  //   {
  //     id: 3,
  //     title: "Article 3",
  //     author: "Virat Kohli",
  //     body: "This is article 3"
  //   }
  // ];
  Article.find({}, function(err, articles) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        // title: "Hello World"
        title: "Articles",
        articles: articles
      });
    }
  });
});

// //get single article
// app.get("/article/:id", function(req, res) {
//   Article.findById(req.params.id, function(err, article) {
//     res.render("article", {
//       article: article
//     });
//   });
// });

// //add route
// app.get("/articles/add", function(req, res) {
//   res.render("add_article", {
//     title: "Add Articles"
//   });
// });

// //add Submit POST route
// app.post("/articles/add", function(req, res) {
//   req.checkBody("title", "Title is required").notEmpty();
//   req.checkBody("author", "Author is required").notEmpty();
//   req.checkBody("body", "Body is required").notEmpty();

//   //Get errors
//   let errors = req.validationErrors();

//   if (errors) {
//     res.render("add_article", {
//       title: "Add Article",
//       errors: errors
//     });
//   } else {
//     let article = new Article();
//     article.title = req.body.title;
//     article.author = req.body.author;
//     article.body = req.body.body;

//     article.save(function(err) {
//       if (err) {
//         console.log(err);
//         return;
//       } else {
//         req.flash("success", "Article Added");
//         res.redirect("/");
//       }
//     });
//   }
// });
// //load edit form
// app.get("/article/edit/:id", function(req, res) {
//   Article.findById(req.params.id, function(err, article) {
//     res.render("edit_article", {
//       title: "Edit Article",
//       article: article
//     });
//   });
// });
// //UPDATE Submit POST route
// app.post("/articles/edit/:id", function(req, res) {
//   let article = {};
//   article.title = req.body.title;
//   article.author = req.body.author;
//   article.body = req.body.body;

//   let query = { _id: req.params.id };
//   Article.update(query, article, function(err) {
//     if (err) {
//       console.log(err);
//       return;
//     } else {
//       req.flash("success", "Article Updated");
//       res.redirect("/");
//     }
//   });
// });

// //deleting article
// app.delete("/article/:id", function(req, res) {
//   let query = { _id: res.params.id };

//   Article.remove(query, function(err) {
//     if (err) {
//       console.log(err);
//     }
//     res.send("Success");
//   });
// });

//route files
let articles = require("./routes/articles");
let users = require("./routes/users");
app.use("/articles", articles);
app.use("/users", users);

app.listen(3000, function() {
  console.log("server started on port 3000");
});
