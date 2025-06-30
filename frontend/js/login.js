document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("/api/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("accessToken", data.access);
            localStorage.setItem("refreshToken", data.refresh);
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("user", JSON.stringify(data.user));
            if (data.role === "admin") {
                window.location.href = "admin-dashboard.html";
            } else if (data.role === "doctor") {
                window.location.href = "doctor-dashboard.html";
            } else {
                window.location.href = "patient-dashboard.html";
            }
        } else {
            showFlashMessage(data.message || "Login failed. Check your credentials.");

        }
    });
});
