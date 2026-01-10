const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")

const { ListingSchema } = require("./schema.js")

const Listing = require("./models/listing.js");
const { wrap } = require("module");

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
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const validateListing = (request, response, next) => {
    let { error } = ListingSchema.validate(request.body);

    if (error) {
        throw new ExpressError(404, error);
    } else {
        next();
    }

}

//root route
app.get("/", (request, response) => {
    response.send("welcome to root route");
});

//to show all listings
app.get("/listings",
    wrapAsync(async (request, response) => {
        let listings = await Listing.find();

        response.render("./listings/index.ejs", { listings });
    })
);

//new route
app.get("/listings/new", (request, response) => {
    response.render("./listings/new.ejs");
});

app.post("/listings",
    validateListing,
    wrapAsync(async (request, response) => {
        let listing = request.body.listing;

        const newListing = new Listing(listing);

        await newListing.save();

        response.redirect("/listings");
    })
);

//to show a particular listing
app.get("/listings/:id",
    wrapAsync(async (request, response) => {
        let { id } = request.params;

        let listing = await Listing.findById(id);

        if (!listing) throw new ExpressError(404, "Listing not found");


        response.render("./listings/show.ejs", { listing });
    }
    ));

//edit route
app.get("/listings/:id/edit",
    wrapAsync(async (request, response) => {
        let { id } = request.params;

        const listing = await Listing.findById(id);

        response.render("./listings/edit.ejs", { listing });
    })
);

//Update route
app.put("/listings/:id",
    validateListing,
    wrapAsync(async (request, response) => {
        let { id } = request.params;

        const listing = request.body.listing;

        let newListing = await Listing.findByIdAndUpdate(id, listing, {
            runValidators: true,
            new: true
        });

        console.log(newListing);

        response.redirect(`/listings/${id}`);
    })
);

app.delete("/listings/:id",
    wrapAsync(async (request, response) => {
        let { id } = request.params;

        let deletedListing = await Listing.findByIdAndDelete(id);

        console.log(deletedListing);

        response.redirect("/listings");
    })
);

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