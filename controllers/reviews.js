const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (request, response) => {
    let listing = await Listing.findById(request.params.id);
    let newReview = new Review(request.body.review);
    newReview.author = request.user._id;

    listing.reviews.push(newReview);

    await newReview.save();


    let res = await listing.save();

    request.flash("success", "Review added!");
    response.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (request, response) => {
    let { id, reviewId } = request.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    request.flash("success", "Review deleted!");
    response.redirect(`/listings/${id}`);
};