const { cloudinary } = require("../cloudConfig.js");
const Listing = require("../models/listing.js");

module.exports.index = async (request, response) => {
    let listings = await Listing.find();

    response.render("./listings/index.ejs", { listings });
};

module.exports.renderNewForm = (request, response) => {
    response.render("./listings/new.ejs");
};

module.exports.createListing = async (request, response) => {
    let url = request.file.path;
    let filename = request.file.filename;
    let listing = request.body.listing;

    const newListing = new Listing(listing);

    newListing.image = { url, filename };
    newListing.owner = request.user._id;
    await newListing.save();

    request.flash("success", "New listing added!");
    response.redirect("/listings");
};

module.exports.showListing = async (request, response) => {
    let { id } = request.params;

    let listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        request.flash("error", "Listing not found!");
        return response.redirect("/listings");
    }

    response.render("./listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (request, response) => {
    let { id } = request.params;

    const listing = await Listing.findById(id);

    let imageUrl = listing.image.url;
    imageUrl = imageUrl.replace("/upload", "/upload/h_200,w_250");

    if (!listing) {
        request.flash("error", "Listing not found!");
        return response.redirect("/listings");
    }

    response.render("./listings/edit.ejs", { listing, imageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    // Update listing (exclude owner from req.body)
    const updatedListing = await Listing.findByIdAndUpdate(
        id,
        req.body.listing,
        {
            runValidators: true,
            new: true
        }
    );


    if (typeof req.file !== "undefined") {

        //delete old image from cloud
        await cloudinary.uploader.destroy(updatedListing.image.filename);

        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = { url, filename };
        await updatedListing.save();
    }

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (request, response) => {
    let { id } = request.params;

    let deletedListing = await Listing.findByIdAndDelete(id);

    //delete image from cloud
    await cloudinary.uploader.destroy(deletedListing.image.filename);

    console.log("Deleted listing :", deletedListing);
    request.flash("success", "Listing deleted!");
    response.redirect("/listings");
};