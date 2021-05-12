// Include dependency Express,
const express = require("express");
const ip = "127.0.0.1";
const port = 3000;

let app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

const users = [];

// Paths 
app.get("/", function (request, response) {
    response.send("Welcome to my website !");
})

// "/register"
app.get("/register", function (request, response) {
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

    // Store User Data !
    const userObj = {
        name: request.body.name,
        age: request.body.age,
        gender: request.body.gender,
        number: request.body.number,
        password: request.body.password,
        timeStamp: new Date().toDateString()
    }

    // Check for existing user !

    const index = users.findIndex((user) => user.number === request.body.number);

    if (index < 0) {

        // Store user into array !
        users.push(userObj);

        console.log("Users : ", users);

        response.json(users);

    } else {

        // Respond with error !
        response.send("Contact number already registered ! Please try again ");
    }


});

app.get("/login", function (request, response) {
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

    const index = users.findIndex((user) => user.number === request.body.number);

    if (index < 0) {
        response.send("Contact Number is not registered with us ! Please Register");
    } else {

        // Password matching !
        // request.body.password - password coming from form !
        // users[index].password - password stored in storage !
        if (request.body.password === users[index].password) {
            response.send("Successfully logged In !");
        } else {
            response.send("Password not matched !");
        }
    }
});

// Switch on the server !
app.listen(port, ip, function () {
    console.log("Server is running....");
})