// Include dependency Express,Mongoose,
const express = require("express");
const mongo = require("mongoose");
const session = require("express-session");
const ejs = require("ejs");
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

app.set("view engine", "ejs");

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
        // response.redirect("/dashboard");
        response.json({
            redirect_url: "dashboard"
        })
    } else {
        if (!request.session.contact) {
            // response.redirect("/login");
            response.json({
                redirect_url: "login"
            })
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

app.use(express.static(__dirname + "/public"));

// Paths 
app.get("/", function (request, response) {
    let status;

    if (request.session.role) {
        status = true;
    } else {
        status = false;
    }
    response.render("test", {
        status: status
    });
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

                    // response.send("Updated Successfully !");
                    response.json({
                        "result": "success"
                    });
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
    // response.send("Welcome to dashboard !");
    const normal = [];
    const moderate = [];
    const extreme = [];
    const recent = [];

    // Collect all data !
    User.find()
        .then(function (users) {
            // console.log("Users : ", users);

            for (let i = 0; i < users.length; i++) {
                // console.log(`Person ${i+1} - ${users[i]}`);
                for (let j = 0; j < users[i].readings.length; j++) {

                    // Store users into array according to readings !
                    if (users[i].readings[j].reading > 0 && users[i].readings[j].reading < 5) {
                        const normalPerson = {
                            name: users[i].name,
                            age: users[i].age,
                            gender: users[i].gender,
                            contact: users[i].contact,
                            reading: users[i].readings[j].reading,
                            time: users[i].readings[j].time
                        }

                        // Push person 
                        normal.push(normalPerson);
                    } else {

                        if (users[i].readings[j].reading > 4 && users[i].readings[j].reading < 8) {
                            const moderatePerson = {
                                name: users[i].name,
                                age: users[i].age,
                                gender: users[i].gender,
                                contact: users[i].contact,
                                reading: users[i].readings[j].reading,
                                time: users[i].readings[j].time
                            }

                            // Push person 
                            moderate.push(moderatePerson);
                        } else {
                            const extremePerson = {
                                name: users[i].name,
                                age: users[i].age,
                                gender: users[i].gender,
                                contact: users[i].contact,
                                reading: users[i].readings[j].reading,
                                time: users[i].readings[j].time
                            }

                            // Push person 
                            extreme.push(extremePerson);
                        }
                    }

                    // console.log("Length :", extreme.length);

                }

            }

            // Recent readings!
            for (let i = extreme.length; i > extreme.length - 5; i--) {
                // console.log("Recent :", extreme[i]);
                // console.log(i);
                recent.push(extreme[i - 1]);

            }

            console.log("Normal Users :", normal);
            console.log("Normal Length :", normal.length);
            console.log("Moderate Users :", moderate);
            console.log("Moderate Length :", moderate.length);
            console.log("Extreme Users :", extreme);
            console.log("Extreme Length :", extreme.length);
            console.log("Recent :", recent);
            console.log("Recent Length :", recent.length);

            // Response
            response.render("dashboard", {
                normal: normal,
                moderate: moderate,
                extreme: extreme,
                recent: recent
            });
        })
        .catch(function (err) {
            console.log("Something went wrong !", err);
        });
})

// "/register"
app.get("/register", redirectHome, function (request, response) {
    // const html = `<h2>Register</h2>
    //                 <form action="/registerDetails" method="POST">
    //                 <input type="text" name="name" placeholder="Enter Name" autocomplete="off">
    //                 <input type="number" name="age" placeholder="Enter Age" autocomplete="off">
    //                 <select name="gender">
    //                 <option hidden>Choose Gender</option>
    //                 <option>Male</option>
    //                 <option>Female</option>
    //                 <option>Others</option>
    //                 </select>
    //                 <input type="text" name="number" placeholder="Contact (required)" autocomplete="off">
    //                 <input type="password" name="password" placeholder="Enter Password" autocomplete="off">
    //                 <button>Submit</button>
    //                 </form>`;

    // response.send(html);

    response.render("register");
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
            contact: request.body.contact
        })
        .then(function (user) {

            // Check whether user exists !
            if (user) {

                response.json({
                    result: "fail : user"
                });

            } else {

                // Store data into database !
                const userObj = {
                    name: request.body.name,
                    age: request.body.age,
                    gender: request.body.gender,
                    contact: request.body.contact,
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

                        response.json({
                            result: "success"
                        });
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
    // const html = `<h2>Login</h2>
    //                 <form action="/loginDetails" method="POST">
    //                 <input type="text" name="number" placeholder="Contact (required)" autocomplete="off">
    //                 <input type="password" name="password" placeholder="Enter Password" autocomplete="off">
    //                 <button>Submit</button>
    // </form>`;

    // response.send(html);
    response.render("login");
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

    if (request.body.contact === "111") {
        // Admin !
        // Create Session
        request.session.role = "Admin";

        console.log("Created Session :", request.session);

        response.json({
            result: "success",
            role: "Admin"
        });
    } else {

        // Normal Users !
        User.findOne({
                contact: request.body.contact
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

                        response.json({
                            result: "success",
                            role: "User"
                        });

                    } else {

                        response.json({
                            result: "fail : pass"
                        });
                    }

                } else {

                    response.json({
                        result: "fail : user"
                    });
                }
            })
            .catch(function (err) {
                console.log("Something went wrong !" + err);
            });

    }




});

// Logout !
app.get("/logout", function (request, response) {
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