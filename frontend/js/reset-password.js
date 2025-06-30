document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;

    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid");
    const token = params.get("token");

    try {
      const res = await fetch(`/api/reset-password/${uid}/${token}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      showFlashMessage(data.message, res.ok ? "success" : "error");
      setTimeout(() => {
      window.location.href = '../pages/login.html'; 
      }, 2000);

    } catch (err) {
      showFlashMessage("An error occurred. Try again later.", "error");
    }
  });
});

function showFlashMessage(message, type = "error") {
  const flash = document.getElementById("flash-message");
  flash.textContent = message;
  flash.className = `flash ${type}`;
  flash.style.display = "block";

  setTimeout(() => {
    flash.style.display = "none";
  }, 4000);
}
