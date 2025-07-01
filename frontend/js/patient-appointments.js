document.addEventListener("DOMContentLoaded", () => {
  let appointments = [];
  let currentPage = 1;
  const pageSize = 5;

  const container = document.getElementById("appointmentsContainer");
  const upcomingBtn = document.getElementById("showUpcomingBtn");
  const historyBtn = document.getElementById("showHistoryBtn");
  const pageIndicator = document.getElementById("pageIndicator");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");

  const doctorInput = document.getElementById("doctorName");
  const doctorIdField = document.getElementById("doctorId");
  const specialtyInput = document.getElementById("specialty");
  const doctorSuggestions = document.getElementById("doctorSuggestions");
  const appointmentDateInput = document.getElementById("appointmentDate");

  let showHistory = false;
  const today = new Date().toISOString().split("T")[0];
  appointmentDateInput.min = today;

  function isUpcoming(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) >= today;
  }

  function renderAppointments() {
    container.innerHTML = "";
    const filtered = appointments.filter(app =>
      showHistory ? !isUpcoming(app.appointment_date) : isUpcoming(app.appointment_date)
    );

    const totalPages = Math.ceil(filtered.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    if (filtered.length === 0) {
      container.innerHTML = `<p>No ${showHistory ? "past" : "upcoming"} appointments.</p>`;
      pageIndicator.textContent = "Page 0 of 0";
      prevPageBtn.disabled = true;
      nextPageBtn.disabled = true;
      return;
    }

    paginated.forEach(app => {
      const card = document.createElement("div");
      card.classList.add("appointment-card");
      if (app.status === "completed") card.classList.add("completed");
      if (app.status === "cancelled") card.classList.add("cancelled");

      card.innerHTML = `
        <h3>${app.doctor_name || "Unknown"}</h3>
        <p><strong>Date:</strong> ${app.appointment_date}</p>
        <p><strong>Time:</strong> ${app.appointment_time}</p>
        <p><strong>Status:</strong> ${app.status}</p>
        <button class="view-btn">View</button>
        ${app.status !== "cancelled" ? `<button class="cancel-btn">Cancel</button>` : ""}
      `;

      const viewBtn = card.querySelector(".view-btn");
      viewBtn.addEventListener("click", () => showAppointmentDetails(app));

      const cancelBtn = card.querySelector(".cancel-btn");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          if (confirm("Cancel this appointment?")) {
            secureFetch(`/api/appointments/${app.id}/cancel/`, {
              method: "POST",
              headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            })
              .then(res => {
                if (!res.ok) throw new Error("Cancel failed");
                return res.json();
              })
              .then(() => {
                Notifier.success("Appointment cancelled.");
                fetchAppointments();
              })
              .catch(() => Notifier.error("Failed to cancel."));
          }
        });
      }

      container.appendChild(card);
    });

    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  }

  function fetchAppointments() {
    secureFetch("/api/appointments/", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
      .then(res => res.json())
      .then(data => {
        appointments = data;
        currentPage = 1;
        renderAppointments();
        toggleTabButtons();
      })
      .catch(() => {
        container.innerHTML = "<p>Error loading appointments.</p>";
      });
  }

  function toggleTabButtons() {
    upcomingBtn.classList.toggle("active", !showHistory);
    historyBtn.classList.toggle("active", showHistory);
  }

  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderAppointments();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(appointments.filter(app =>
      showHistory ? !isUpcoming(app.appointment_date) : isUpcoming(app.appointment_date)
    ).length / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      renderAppointments();
    }
  });

  upcomingBtn.addEventListener("click", () => {
    showHistory = false;
    currentPage = 1;
    renderAppointments();
    toggleTabButtons();
  });

  historyBtn.addEventListener("click", () => {
    showHistory = true;
    currentPage = 1;
    renderAppointments();
    toggleTabButtons();
  });

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
    modal.querySelector(".close").addEventListener("click", () => document.body.removeChild(modal));
    modal.addEventListener("click", e => {
      if (e.target === modal) document.body.removeChild(modal);
    });
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
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      })
        .then(res => res.json())
        .then(data => {
          doctorSuggestions.innerHTML = "";
          const doctors = data.results || [];
          if (doctors.length === 0) {
            doctorSuggestions.style.display = "none";
            return;
          }

          doctors.forEach(doc => {
            const fullName = `${doc.first_name} ${doc.last_name}`;
            const li = document.createElement("li");
            li.textContent = fullName;
            li.dataset.id = doc.id;
            li.dataset.specialization = doc.specialization;
            li.addEventListener("click", () => {
              doctorInput.value = fullName;
              doctorIdField.value = doc.id;
              specialtyInput.value = doc.specialization;
              doctorSuggestions.innerHTML = "";
              doctorSuggestions.style.display = "none";
            });
            doctorSuggestions.appendChild(li);
          });
          doctorSuggestions.style.display = "block";
        });
    });

    document.addEventListener("click", e => {
      if (!doctorSuggestions.contains(e.target) && e.target !== doctorInput) {
        doctorSuggestions.innerHTML = "";
        doctorSuggestions.style.display = "none";
      }
    });
  }

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
      Notifier.error("Please select a doctor and ensure you're logged in.");
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
        sessionStorage.setItem("redirectedAfterBooking", "true");
        window.location.href = "patient-appointments.html";
      })
      .catch(() => Notifier.error("Failed to book appointment."));
  });

  const urlParams = new URLSearchParams(window.location.search);
  const redirected = sessionStorage.getItem("redirectedAfterBooking");
  sessionStorage.removeItem("redirectedAfterBooking");

  if (!redirected && urlParams.has("doctorId")) {
    doctorIdField.value = urlParams.get("doctorId");
    doctorInput.value = decodeURIComponent(urlParams.get("doctorName") || "");
    specialtyInput.value = decodeURIComponent(urlParams.get("specialty") || "");
    document.getElementById("appointmentModal").style.display = "block";
  }

  document.getElementById("sidebarToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
  });

  // Initialize
  fetchAppointments();
  setupDoctorSuggestions();
});
