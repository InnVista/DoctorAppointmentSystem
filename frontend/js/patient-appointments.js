document.addEventListener("DOMContentLoaded", () => {
  let appointments = [];

  const container = document.getElementById("appointmentsContainer");
  const upcomingBtn = document.getElementById("showUpcomingBtn");
  const historyBtn = document.getElementById("showHistoryBtn");
  const doctorInput = document.getElementById("doctorName");
  const specialtyInput = document.getElementById("specialty");

  // Load appointments on page load
  function fetchAppointments() {
    secureFetch("/api/appointments/", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(data => {
        appointments = data;
        renderAppointments(false); // Default: show upcoming
      })
      .catch(() => {
        container.innerHTML = "<p>Error loading appointments.</p>";
      });
  }

  function isUpcoming(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appDate = new Date(dateStr);
    return appDate >= today;
  }

  function renderAppointments(showHistory = false) {
    container.innerHTML = "";

    const filtered = appointments.filter(app =>
      showHistory ? !isUpcoming(app.appointment_date) : isUpcoming(app.appointment_date)
    );

    if (filtered.length === 0) {
      container.innerHTML = `<p>No ${showHistory ? "past" : "upcoming"} appointments.</p>`;
      return;
    }

    filtered.forEach(app => {
      const card = document.createElement("div");
      card.classList.add("appointment-card");

      if (app.status === "completed") card.classList.add("completed");
      else if (app.status === "cancelled") card.classList.add("cancelled");

      card.innerHTML = `
        <h3>${app.doctor_name || "Unknown"} (${app.specialty || "N/A"})</h3>
        <p><strong>Date:</strong> ${app.appointment_date}</p>
        <p><strong>Time:</strong> ${app.appointment_time}</p>
        <p><strong>Status:</strong> ${app.status}</p>
      `;

      container.appendChild(card);
    });
  }

  // Doctor search suggestions
  function loadDoctors() {
    secureFetch("/api/doctors/search", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(doctors => {
        const list = document.getElementById("doctorList");
        doctors.forEach(doc => {
          const option = document.createElement("option");
          option.value = doc.name;
          option.dataset.specialty = doc.specialty;
          list.appendChild(option);
        });

        doctorInput.addEventListener("input", () => {
          const selected = [...list.options].find(opt => opt.value === doctorInput.value);
          specialtyInput.value = selected?.dataset.specialty || "";
        });
      });
  }

  // View toggle buttons
  upcomingBtn.addEventListener("click", () => {
    renderAppointments(false);
    upcomingBtn.classList.add("active");
    historyBtn.classList.remove("active");
  });

  historyBtn.addEventListener("click", () => {
    renderAppointments(true);
    historyBtn.classList.add("active");
    upcomingBtn.classList.remove("active");
  });

  // Add appointment modal
  document.getElementById("addAppointmentBtn").addEventListener("click", () => {
    document.getElementById("appointmentModal").style.display = "block";
  });

  document.getElementById("modalClose").addEventListener("click", () => {
    document.getElementById("appointmentModal").style.display = "none";
  });

  document.getElementById("newAppointmentForm").addEventListener("submit", e => {
    e.preventDefault();

    const doctor = doctorInput.value;
    const specialty = specialtyInput.value;
    const date = document.getElementById("appointmentDate").value;
    const time = document.getElementById("appointmentTime").value;

    if (!doctor || !specialty) return alert("Select a valid doctor.");

    const body = {
      doctor_name: doctor,
      specialty,
      appointment_date: date,
      appointment_time: time
    };

    secureFetch("/api/appointments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(() => {
        alert("Appointment added.");
        document.getElementById("appointmentModal").style.display = "none";
        e.target.reset();
        fetchAppointments();
      })
      .catch(() => alert("Failed to add appointment."));
  });

  // Sidebar toggle
  document.getElementById("sidebarToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
  });

  // Load initial data
  fetchAppointments();
  loadDoctors();
});
