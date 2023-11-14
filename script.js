document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    // Retrieve user data from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if the entered username and password match any stored user
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
        alert("Login successful");
        
        // Redirect to another page upon successful login
        window.location.href = "option.html"; // Replace "welcome.html" with the desired page URL
    } else {
        alert("Invalid credentials. Please try again.");
    }
});


document.getElementById("signup-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    // Retrieve user data from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if the username is already taken
    const isUsernameTaken = users.some((u) => u.username === username);

    if (isUsernameTaken) {
        alert("Username is already taken. Please choose another.");
    } else {
        // Add the new user to the list of users
        users.push({ username, password });

        // Store the updated user list in localStorage
        localStorage.setItem("users", JSON.stringify(users));
        
        alert("Signup successful. You can now log in.");
        
        location.reload()
        // You can redirect to the login page or perform other actions here
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const viewPasswordButton = document.getElementById("view-password");
    const loginPasswordInput = document.getElementById("login-password");

    viewPasswordButton.addEventListener("click", function () {
        if (loginPasswordInput.type === "password") {
            loginPasswordInput.type = "text";
        } else {
            loginPasswordInput.type = "password";
        }
    });
});
const viewPasswordButton = document.getElementById("view-password");

viewPasswordButton.addEventListener("click", function () {
    const visibilityIcon = viewPasswordButton.querySelector(".material-icons:first-child");
    const visibilityOffIcon = viewPasswordButton.querySelector(".material-icons:last-child");

    if (visibilityIcon.style.display === "none") {
        visibilityIcon.style.display = "inline-block";
        visibilityOffIcon.style.display = "none";
    } else {
        visibilityIcon.style.display = "none";
        visibilityOffIcon.style.display = "inline-block";
    }
});