document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
  
    const form = document.getElementById("appointmentForm");
    const messageDiv = document.getElementById("formMessage");
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const patientName = document.getElementById("patientName").value.trim();
      const appointmentDate = document.getElementById("appointmentDate").value;
      const appointmentTime = document.getElementById("appointmentTime").value;
      const reason = document.getElementById("reason").value.trim();
  
      if (patientName && appointmentDate && appointmentTime && reason) {
        // Here you could send the data to a server or store locally
        messageDiv.textContent = "Appointment booked successfully!";
        messageDiv.style.color = "green";
        messageDiv.style.display = "block";
        form.reset();
      } else {
        messageDiv.textContent = "Please fill in all fields.";
        messageDiv.style.color = "red";
        messageDiv.style.display = "block";
      }
    });
  }


);
  