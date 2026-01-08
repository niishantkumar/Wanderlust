const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js")

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

const initDB = async () => {
    await Listing.deleteMany();

    await Listing.insertMany(initData.data);

    console.log("data initialized");
}

initDB();