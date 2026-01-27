const User = require("../models/user.js");

module.exports.renderSignupForm = (request, response) => {
    response.render("users/signup")
};

module.exports.signup = async (request, response, next) => {

    try {
        let { username, email, password } = request.body;

        let newUser = new User({ email, username, });
        let registeredUser = await User.register(newUser, password);


        request.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            request.flash("success", "Welcome to Wanderlust");

            response.redirect("/listings");
        })

    } catch (err) {
        request.flash("error", err.message);
        response.redirect("/signup");
    }
};

module.exports.renderLoginForm = (request, response) => {
    response.render("users/login")
};

module.exports.login = async (request, response) => {
    let username = request.user.username;
    request.flash("success", `welcome ${username}`);

    const redirectUrl = response.locals.redirectUrl || "/listings";
    response.redirect(redirectUrl);

};

module.exports.logout = (request, response, next) => {
    request.logout((err) => {
        if (err) {
            return next(err);
        }
        request.flash("success", "You are logged out");
        response.redirect("/listings");
    });
};