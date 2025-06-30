document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;

    try {
      const res = await fetch("/api/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        showFlashMessage(data.message || "Success!", "success");
      } else {
        showFlashMessage(data.message || "An error occurred.", "error");
      }
    } catch (err) {
      showFlashMessage("Network error. Please try again later.", "error");
    }
  });
});

function showFlashMessage(message, type = "error") {
  const flash = document.getElementById("flash-message");
  flash.textContent = message;
  flash.className = type === "success" ? "success" : "error";
  flash.style.display = "block";

  setTimeout(() => {
    flash.style.display = "none";
  }, 4000);
}
