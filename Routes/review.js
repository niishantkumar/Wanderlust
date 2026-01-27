const express = require("express");
const router = express.Router({ mergeParams: true });


const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { ReviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedin, isAuthor } = require("../middlewares.js");

const reviewController = require("../controllers/reviews.js");


const validateReview = (request, response, next) => {
    let { error } = ReviewSchema.validate(request.body);

    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}


//POST Route
router.post("/",
    isLoggedin,
    validateReview,
    wrapAsync(reviewController.createReview)
);

//delete route
router.delete("/:reviewId",
    isLoggedin,
    isAuthor,
    wrapAsync(reviewController.deleteReview)
);


module.exports = router;