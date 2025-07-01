document.addEventListener("DOMContentLoaded", () => {
  let appointments = [];

  const container = document.getElementById("appointmentsContainer");
  const upcomingBtn = document.getElementById("showUpcomingBtn");
  const historyBtn = document.getElementById("showHistoryBtn");

  const doctorInput = document.getElementById("doctorName");
  const doctorIdField = document.getElementById("doctorId");
  const specialtyInput = document.getElementById("specialty");
  const doctorSuggestions = document.getElementById("doctorSuggestions");

  const appointmentDateInput = document.getElementById("appointmentDate");
  const today = new Date().toISOString().split("T")[0];
  appointmentDateInput.min = today;

  function fetchAppointments() {
    secureFetch("/api/appointments/", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(data => {
        appointments = data;
        renderAppointments(false);
        upcomingBtn.classList.add("active");
        historyBtn.classList.remove("active");
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
        <h3>${app.doctor_name || "Unknown"}</h3>
        <p><strong>Date:</strong> ${app.appointment_date}</p>
        <p><strong>Time:</strong> ${app.appointment_time}</p>
        <p><strong>Status:</strong> ${app.status}</p>
        <button class="view-btn">View</button>
        ${app.status !== "cancelled" ? `<button class="cancel-btn">Cancel</button>` : ""}
      `;

      // Cancel appointment
      const cancelBtn = card.querySelector(".cancel-btn");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          if (confirm("Are you sure you want to cancel this appointment?")) {
            secureFetch(`/api/appointments/${app.id}/cancel/`, {
              method: "POST",
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
              }
            })
              .then(res => {
                if (!res.ok) throw new Error("Cancel failed");
                return res.json();
              })
              .then(() => {
                Notifier.success("Appointment cancelled.");
                fetchAppointments();
              })
              .catch(() => Notifier.error("Failed to cancel appointment."));
          }
        });
      }

      // View appointment
      const viewBtn = card.querySelector(".view-btn");
      viewBtn.addEventListener("click", () => {
        showAppointmentDetails(app);
      });

      container.appendChild(card);
    });
  }

  function showAppointmentDetails(app) {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h3>Appointment Details</h3>
        <p><strong>Doctor:</strong> ${app.doctor_name}</p>
        <p><strong>Specialty:</strong> ${app.specialty || "N/A"}</p>
        <p><strong>Date:</strong> ${app.appointment_date}</p>
        <p><strong>Time:</strong> ${app.appointment_time}</p>
        <p><strong>Status:</strong> ${app.status}</p>
        <p><strong>Reason:</strong> ${app.reason || "N/A"}</p>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".close");
    closeBtn.addEventListener("click", () => document.body.removeChild(modal));
    modal.addEventListener("click", e => {
      if (e.target === modal) document.body.removeChild(modal);
    });

    modal.style.display = "block";
  }

  function setupDoctorSuggestions() {
    doctorInput.addEventListener("input", () => {
      const query = doctorInput.value.trim();
      if (query.length < 2) {
        doctorSuggestions.innerHTML = "";
        doctorSuggestions.style.display = "none";
        return;
      }

      secureFetch(`/api/doctors/search/?search=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      })
        .then(res => res.json())
        .then(data => {
          const doctors = data.results || [];
          doctorSuggestions.innerHTML = "";

          if (doctors.length === 0) {
            doctorSuggestions.style.display = "none";
            return;
          }

          doctors.forEach(doc => {
            const fullName = `${doc.first_name} ${doc.last_name}`.trim();
            const li = document.createElement("li");
            li.textContent = fullName;
            li.dataset.id = doc.id;
            li.dataset.specialization = doc.specialization;

            li.addEventListener("click", () => {
              doctorInput.value = fullName;
              doctorIdField.value = doc.id;
              specialtyInput.value = doc.specialization || "";
              doctorSuggestions.innerHTML = "";
              doctorSuggestions.style.display = "none";
            });

            doctorSuggestions.appendChild(li);
          });

          doctorSuggestions.style.display = "block";
        })
        .catch(err => {
          console.error("Doctor search failed:", err);
        });
    });

    // Hide suggestions if user clicks elsewhere
    document.addEventListener("click", e => {
      if (!doctorSuggestions.contains(e.target) && e.target !== doctorInput) {
        doctorSuggestions.innerHTML = "";
        doctorSuggestions.style.display = "none";
      }
    });
  }

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

  document.getElementById("addAppointmentBtn").addEventListener("click", () => {
    document.getElementById("appointmentModal").style.display = "block";
  });

  document.getElementById("modalClose").addEventListener("click", () => {
    document.getElementById("appointmentModal").style.display = "none";
  });

  document.getElementById("newAppointmentForm").addEventListener("submit", e => {
    e.preventDefault();

    const doctorId = doctorIdField.value;
    const patientId = JSON.parse(localStorage.getItem("user"))?.id;
    const date = appointmentDateInput.value;
    const time = document.getElementById("appointmentTime").value;

    if (!doctorId || !patientId) {
      Notifier.error("Please select a valid doctor and ensure you're logged in.");
      return;
    }

    const body = {
      doctor: doctorId,
      patient: patientId,
      appointment_date: date,
      appointment_time: time,
      reason: ""
    };

    secureFetch("/api/appointments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify(body)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to create");
        return res.json();
      })
      .then(() => {
        Notifier.success("Appointment added.");
        document.getElementById("appointmentModal").style.display = "none";
        e.target.reset();
        fetchAppointments();
      })
      .catch(() => Notifier.error("Failed to add appointment."));
  });

  document.getElementById("sidebarToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
  });

  // Initial load
  fetchAppointments();
  setupDoctorSuggestions();
});
