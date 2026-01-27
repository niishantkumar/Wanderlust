if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const { MongoStore } = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");


const listingRouter = require("./Routes/listing.js");
const reviewRouter = require("./Routes/review.js");
const userRouter = require("./Routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 60 * 60,
})

store.on("error", () => {
    console.log(error);
})

const sessionOptions = {
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());


// requires the model with Passport-Local Mongoose plugged in
const User = require('./models/user.js');
const { error } = require('console');

app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.user = req.user;
    next();
});


app.engine('ejs', engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//for static files
app.use(express.static(path.join(__dirname, "/public")));

//for body
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));


main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}


//root route
app.get("/", (request, response) => {
    response.redirect("/listings");
});

//for listings
app.use("/listings", listingRouter);

//for reviews
app.use("/listings/:id/reviews", reviewRouter);

//for users
app.use("/", userRouter);


//for any undeclared route
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});


app.use((err, request, response, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    response.status(statusCode).send(message);
})

app.listen("8080", () => {
    console.log("listning at port 8080");
});