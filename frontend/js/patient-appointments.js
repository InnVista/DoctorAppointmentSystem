document.addEventListener("DOMContentLoaded", () => {
    const appointments = [
      {
        doctor: "Dr. Emily Smith",
        specialty: "Cardiologist",
        date: "2025-05-10",
        time: "10:30",
        status: "Scheduled"
      },
      {
        doctor: "Dr. Raj Patel",
        specialty: "Dermatologist",
        date: "2025-04-20",
        time: "14:00",
        status: "Completed"
      },
      {
        doctor: "Dr. Aisha Khan",
        specialty: "Neurologist",
        date: "2025-04-15",
        time: "11:00",
        status: "Cancelled"
      }
    ];
  
    const container = document.getElementById("appointmentsContainer");
  
    function renderAppointments() {
      container.innerHTML = "";
      appointments.forEach((app, index) => {
        const card = document.createElement("div");
        card.classList.add("appointment-card");
  
        if (app.status === "Completed") {
          card.classList.add("completed");
        } else if (app.status === "Cancelled") {
          card.classList.add("cancelled");
        }
  
        card.innerHTML = `
          <h3>${app.doctor} (${app.specialty})</h3>
          <p><strong>Date:</strong> ${app.date}</p>
          <p><strong>Time:</strong> ${app.time}</p>
          <p><strong>Status:</strong> ${app.status}</p>
          ${app.status === "Scheduled" ? `
            <button class="cancel-btn" data-index="${index}">Cancel</button>
            <button class="reschedule-btn" data-index="${index}">Reschedule</button>
          ` : ""}
        `;
  
        container.appendChild(card);
      });
    }
  
    // Open modal
    document.getElementById("addAppointmentBtn").addEventListener("click", () => {
      document.getElementById("appointmentModal").style.display = "block";
    });
  
    // Close modal
    document.getElementById("modalClose").addEventListener("click", () => {
      document.getElementById("appointmentModal").style.display = "none";
    });
  
    // Add new appointment
    document.getElementById("newAppointmentForm").addEventListener("submit", (e) => {
      e.preventDefault();
  
      const newAppointment = {
        doctor: document.getElementById("doctorName").value,
        specialty: document.getElementById("specialty").value,
        date: document.getElementById("appointmentDate").value,
        time: document.getElementById("appointmentTime").value,
        status: "Scheduled"
      };
  
      appointments.push(newAppointment);
      renderAppointments();
      e.target.reset();
      document.getElementById("appointmentModal").style.display = "none";
    });
  
    // Cancel and Reschedule
    container.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      if (e.target.classList.contains("cancel-btn")) {
        appointments[index].status = "Cancelled";
        renderAppointments();
      } else if (e.target.classList.contains("reschedule-btn")) {
        const newDate = prompt("Enter new date (YYYY-MM-DD):", appointments[index].date);
        const newTime = prompt("Enter new time (HH:MM):", appointments[index].time);
        if (newDate && newTime) {
          appointments[index].date = newDate;
          appointments[index].time = newTime;
          appointments[index].status = "Scheduled";
          renderAppointments();
        }
      }
    });
  
    renderAppointments();
  });
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });  