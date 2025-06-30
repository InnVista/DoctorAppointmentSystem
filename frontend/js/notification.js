class Notifier {
  static show(message, type = "info", duration = 4000) {
    let container = document.getElementById("notification-container");

    if (!container) {
      container = document.createElement("div");
      container.id = "notification-container";
      document.body.appendChild(container);
    }

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerText = message;

    container.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => container.removeChild(notification), 500);
    }, duration);
  }

  static success(msg) {
    this.show(msg, "success");
  }

  static error(msg) {
    this.show(msg, "error");
  }

  static info(msg) {
    this.show(msg, "info");
  }

  static warning(msg) {
    this.show(msg, "warning");
  }

  static async error(response) {
    if (!response.ok) {
      const error = await response.json();
      console.log(error);
      console.log(response);

      if (typeof error === 'string') {
        throw new Error(error || "Failed to update doctor.");
      }

      const message = Object.entries(error)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
        .join('\n');
        this.show(message,"error")
    }
  }

}
