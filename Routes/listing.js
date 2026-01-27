const express = require("express");
const router = express.Router();
const { isLoggedin, isOwner } = require("../middlewares.js")


const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { ListingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { use } = require("passport");
const { populate } = require("../models/user.js");
const listingController = require("../controllers/listings.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })


//to validate listing from server side
const validateListing = (request, response, next) => {
    let { error } = ListingSchema.validate(request.body);

    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }

};


router.route("/")
    .get(
        wrapAsync(listingController.index)
    )
    .post(
        isLoggedin,
        upload.single("listing[image]"),
        validateListing,

        wrapAsync(listingController.createListing)
    );

//new route
router.get("/new", isLoggedin, listingController.renderNewForm);

router.route("/:id")
    .get(
        wrapAsync(listingController.showListing))
    .put(

        isLoggedin,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedin,
        isOwner,
        wrapAsync(listingController.deleteListing)
    );


//edit route
router.get("/:id/edit",
    isLoggedin,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

module.exports = router;