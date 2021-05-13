// Include dependency Express,Mongoose,
const express = require("express");
const mongo = require("mongoose");
const session = require("express-session");
const url = require("./setup/config").url;
const ip = "127.0.0.1";
const port = 3000;

let app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

const sess = {
    name: "User",
    resave: false,
    saveUninitialized: true,
    secret: "mysecret",
    cookie: {
        secure: false
    }
}

app.use(session(sess));



// Database Connection !

mongo.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(function () {
        console.log("Database successfully connected !");
    })
    .catch(function (err) {
        console.log("Something went wrong " + err);
    });

// Import User Table !
const User = require("./tables/User");


// 
function redirectLogin(request, response, next) {
    console.log(request.session);
    console.log("ID :", request.session.id);

    if (request.session && request.session.role === "Admin") {
        response.redirect("/dashboard");
    } else {
        if (!request.session.contact) {
            response.redirect("/login");
        } else {
            next();
        }
    }

}


function redirectHome(request, response, next) {

    if (request.session.contact || request.session.role === "Admin") {
        response.redirect("/");
    } else {
        next();
    }
}

function checkUser(request, response, next) {
    console.log(request.session);
    console.log(request.session.role);
    if (request.session.role === undefined || request.session.role === "User") {
        response.redirect("/")
    } else {
        next();
    }
}


// Generate Random Readings from 1-10 !
function generateReadings() {
    let reading = Math.random() * (10 + 1 - 1) + 1;

    return reading;
}

// const users = [];

// Paths 
app.get("/", function (request, response) {
    response.send(`<a href="/getData"><button>Take a Test</button></a>`);
})


app.get("/getData", redirectLogin, function (request, response) {

    User.findOne({
            contact: request.session.contact
        })
        .then(function (user) {

            // Update readings !
            let deviceReading = generateReadings();

            const readingObject = {
                reading: deviceReading,
                time: new Date().toString()
            }

            // Update query !
            User.updateOne({
                    // Identify person !
                    contact: user.contact
                }, {
                    $push: {
                        readings: readingObject
                    }
                }, {
                    $new: true
                })
                .then(function () {
                    console.log("Updated Successfully !");

                    response.send("Updated Successfully !");
                })
                .catch(function (err) {
                    console.log("Something went wrong !", err);
                });
        })
        .catch(function (err) {
            console.log("Something went wrong !", err);
        });
});

// Admin Page !
app.get("/dashboard", checkUser, function (request, response) {
    response.send("Welcome to dashboard !");
})

// "/register"
app.get("/register", redirectHome, function (request, response) {
    const html = `<h2>Register</h2>
                    <form action="/registerDetails" method="POST">
                    <input type="text" name="name" placeholder="Enter Name" autocomplete="off">
                    <input type="number" name="age" placeholder="Enter Age" autocomplete="off">
                    <select name="gender">
                    <option hidden>Choose Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Others</option>
                    </select>
                    <input type="text" name="number" placeholder="Contact (required)" autocomplete="off">
                    <input type="password" name="password" placeholder="Enter Password" autocomplete="off">
                    <button>Submit</button>
                    </form>`;

    response.send(html);
})


app.post("/registerDetails", function (request, response) {
    console.log(request.body);

    // // Store User Data !
    // const userObj = {
    //     name: request.body.name,
    //     age: request.body.age,
    //     gender: request.body.gender,
    //     number: request.body.number,
    //     password: request.body.password,
    //     timeStamp: new Date().toDateString()
    // }

    // // Check for existing user !

    // const index = users.findIndex((user) => user.number === request.body.number);

    // if (index < 0) {

    //     // Store user into array !
    //     users.push(userObj);

    //     console.log("Users : ", users);

    //     response.json(users);

    // } else {

    //     // Respond with error !
    //     response.send("Contact number already registered ! Please try again ");
    // }

    User.findOne({
            contact: request.body.number
        })
        .then(function (user) {

            // Check whether user exists !
            if (user) {

                response.json({
                    "emailerr": "User exists already !"
                })

            } else {

                // Store data into database !
                const userObj = {
                    name: request.body.name,
                    age: request.body.age,
                    gender: request.body.gender,
                    contact: request.body.number,
                    password: request.body.password,
                    readings: [],
                    timeStamp: new Date().toDateString()
                }


                new User(userObj).save()
                    .then(function (user) {
                        console.log("User registered successfully !");

                        // Create Session !
                        request.session.name = user.name;
                        request.session.contact = user.contact;
                        request.session.role = "User";

                        console.log("Created Session :", request.session);

                        response.send("Registered successfully !");
                    })
                    .catch(function (error) {
                        console.log("Something went wrong" + error);
                    });
            }

        })
        .catch(function (error) {
            console.log("Something went wrong" + error);
        });


});

app.get("/login", redirectHome, function (request, response) {
    const html = `<h2>Login</h2>
                    <form action="/loginDetails" method="POST">
                    <input type="text" name="number" placeholder="Contact (required)" autocomplete="off">
                    <input type="password" name="password" placeholder="Enter Password" autocomplete="off">
                    <button>Submit</button>
    </form>`;

    response.send(html);
});

app.post("/loginDetails", function (request, response) {
    console.log(request.body);

    // const index = users.findIndex((user) => user.number === request.body.number);

    // if (index < 0) {
    //     response.send("Contact Number is not registered with us ! Please Register");
    // } else {

    //     // Password matching !
    //     // request.body.password - password coming from form !
    //     // users[index].password - password stored in storage !
    //     if (request.body.password === users[index].password) {
    //         response.send("Successfully logged In !");
    //     } else {
    //         response.send("Password not matched !");
    //     }
    // }

    if (request.body.number === "111") {
        // Admin !
        // Create Session
        request.session.role = "Admin";

        console.log("Created Session :", request.session);

        response.send("Successfully logged in !")
    } else {

        // Normal Users !
        User.findOne({
                contact: request.body.number
            })
            .then(function (user) {
                // Check if user exists or not !

                if (user) {
                    // Match password
                    //request.body.password - password coming from form !
                    // user.password - database password


                    if (request.body.password === user.password) {
                        // Create Session !
                        request.session.name = user.name;
                        request.session.contact = user.contact;
                        request.session.role = "User";

                        console.log("Created Session :", request.session);

                        response.send("Successfully logged in !");
                    } else {
                        response.json({
                            "passworderror": "Password not matched !"
                        })
                    }

                } else {
                    response.send("This contact is not registered with us !");
                }
            })
            .catch(function (err) {
                console.log("Something went wrong !" + err);
            });

    }




});

// Logout !
app.get("/logout", redirectLogin, function (request, response) {
    request.session.destroy(function (err) {
        if (err) {
            response.redirect("/");
        } else {
            response.redirect("/login");
        }
    });
});

// Switch on the server !
app.listen(port, ip, function () {
    console.log("Server is running....");
})