const { request, response } = require("express");
const Listing = require("./models/listing.js")
const Review = require("./models/review.js")

module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //redirectUrl
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (request, response, next) => {
    const { id } = request.params;

    // Find listing
    const listing = await Listing.findById(id);

    if (!listing) {
        request.flash("error", "Listing not found!");
        return response.redirect("/listings");
    }

    // Ownership check
    if (!listing.owner.equals(request.user._id)) {
        request.flash("error", "You are not the owner of this listing");
        return response.redirect(`/listings/${id}`);
    }

    next();
}

module.exports.isAuthor = async (request, response, next) => {
    const { id, reviewId } = request.params;

    // Find review
    const review = await Review.findById(reviewId);

    if (!review) {
        request.flash("error", "Review not found!");
        return response.redirect("/listings");
    }

    // Ownership check
    if (!review.author.equals(request.user._id)) {
        request.flash("error", "You are not the author of this review");
        return response.redirect(`/listings/${id}`);
    }

    next();
}