document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signup-form");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("/api/signup/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: email,
                email: email,
                password: password,
                first_name: name,
                role: "patient", // default role
            }),
        });

        const data = await response.json();

        if (response.ok) {
            Notifier.success("Signup successful!");
            window.location.href = "login.html";
        } else {
            Notifier.error("Signup failed:\n" + JSON.stringify(data));
        }
    });
});
