let allAppointments = [];
let currentTab = 'today';
let appointmentToCancel = null;
let appointmentToReschedule = null;

function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
}

function fetchAppointments() {
  secureFetch("/api/appointments/", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then((data) => {
      allAppointments = data;
      switchTab(currentTab);
    })
    .catch((err) => {
      console.error("Error fetching appointments", err);
      document.getElementById('appointmentsBody').innerHTML =
        `<tr><td colspan="5" style="text-align:center; color:red;">Could not load appointments. Please try again later.</td></tr>`;
    });
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.tab-button[data-tab="${tab}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  const todayDate = new Date().toISOString().split("T")[0];
  let filtered = [];

  if (tab === 'today') {
    filtered = allAppointments.filter(app => app.appointment_date === todayDate);
  } else if (tab === 'upcoming') {
    filtered = allAppointments.filter(app => app.appointment_date > todayDate && app.status !== "cancelled");
  } else if (tab === 'history') {
    filtered = allAppointments.filter(app => app.status === "completed" || app.status === "cancelled"||app.appointment_date<todayDate);
  }

  renderAppointments(filtered);
}

function renderAppointments(data) {
  const appointmentsBody = document.getElementById('appointmentsBody');
  if (data.length === 0) {
    appointmentsBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No appointments available.</td></tr>`;
    return;
  }

  appointmentsBody.innerHTML = data.map(appointment => `
    <tr>
      <td>${appointment.patient_name || "Unknown"}</td>
      <td>${appointment.appointment_date}</td>
      <td>${appointment.appointment_time}</td>
      <td><span class="status">${appointment.status}</span></td>
      <td>
        <button class="action-btn view-btn" data-id="${appointment.id}">View</button>
        ${appointment.status !== "completed" && appointment.status !== "cancelled" ? `
          <button class="action-btn reschedule-btn" data-id="${appointment.id}">Reschedule</button>
          <button class="action-btn cancel-btn" data-id="${appointment.id}">Cancel</button>
        ` : ''}
      </td>
    </tr>
  `).join('');
}

function setupTabListeners() {
  document.getElementById('todayTab').addEventListener('click', () => switchTab('today'));
  document.getElementById('upcomingTab').addEventListener('click', () => switchTab('upcoming'));
  document.getElementById('historyTab').addEventListener('click', () => switchTab('history'));
}
function viewAppointment(id) {
  const appointment = allAppointments.find(app => app.id === id);
  localStorage.setItem('selectedAppointment', JSON.stringify(appointment));
  localStorage.setItem('appointmentTab', currentTab);
  window.location.href = `appointment-view.html?id=${id}`;
}

function openCancel(id) {
  appointmentToCancel = id;
  openModal('cancelModal');
}

function openReschedule(id) {
  appointmentToReschedule = id;
  openModal('rescheduleModal');
}

function setupModalHandlers() {
  document.getElementById('appointmentsBody').addEventListener('click', (e) => {
    const target = e.target;
    if (target.tagName !== 'BUTTON' || !target.dataset.id) return;
    const appointmentId = parseInt(target.dataset.id);
    if (target.classList.contains('view-btn')) viewAppointment(appointmentId);
    else if (target.classList.contains('reschedule-btn')) openReschedule(appointmentId);
    else if (target.classList.contains('cancel-btn')) openCancel(appointmentId);
  });

  document.getElementById('confirmCancelBtn').addEventListener('click', () => {
    if (appointmentToCancel !== null) {
      secureFetch(`/api/appointments/${appointmentToCancel}/cancel/`, {
        method: "POST",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      })
        .then(res => res.json())
        .then(() => {
          fetchAppointments();
          closeModal('cancelModal');
          appointmentToCancel = null;
        });
    }
  });

  document.getElementById('closeModalBtn').addEventListener('click', () => {
    appointmentToCancel = null;
    closeModal('cancelModal');
  });

  document.getElementById('confirmRescheduleBtn').addEventListener('click', () => {
    const newDate = document.getElementById('newDate').value;
    const newTime = document.getElementById('newTime').value;
    const alertBox = document.getElementById('rescheduleAlert');

    if (newDate && newTime) {
      alertBox.style.display = 'none';
      secureFetch(`/api/appointments/${appointmentToReschedule}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          appointment_date: newDate,
          appointment_time: newTime,
          status: "scheduled"
        }),
      })
        .then(res => res.json())
        .then(() => {
          fetchAppointments();
          closeModal('rescheduleModal');
          appointmentToReschedule = null;
        });
    } else {
      alertBox.style.display = 'block';
      alertBox.textContent = 'Please select both date and time.';
    }
  });

  document.getElementById('closeRescheduleModalBtn').addEventListener('click', () => {
    appointmentToReschedule = null;
    closeModal('rescheduleModal');
  });

  document.getElementById('newAppointmentBtn').addEventListener('click', () => {
    openModal('newAppointmentModal');
  });

  function closeNewAppointmentModal() {
    closeModal('newAppointmentModal');
    document.getElementById('appointmentForm').reset();
    document.getElementById('formError').style.display = 'none';
  }

  document.getElementById('closeAppointmentModal').addEventListener('click', closeNewAppointmentModal);
  document.getElementById('closeAppointmentModalBtn').addEventListener('click', closeNewAppointmentModal);

  document.getElementById('appointmentForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('patientName').value.trim();
    const patientId = document.getElementById('patientId').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const notes = document.getElementById('notes').value;
    const errorBox = document.getElementById('formError');
    const doctor = JSON.parse(localStorage.getItem("user"))?.id;

    if (!name || !date || !time || !phone || !doctor || !patientId) {
      errorBox.innerText = "Please fill in all required fields correctly.";
      errorBox.style.display = 'block';
      return;
    }

    const payload = {
      patient: patientId,
      doctor,
      phone,
      appointment_date: date,
      appointment_time: time,
      reason: notes
    };

    secureFetch("/api/appointments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) return Notifier.error(res).then(err => Promise.reject(err));
        return res.json();
      })
      .then(() => {
        Notifier.success(`Appointment booked successfully for ${name} on ${date} at ${time}.`);
        closeNewAppointmentModal();
        fetchAppointments();
      })
      .catch(err => {
        console.error(err);
        errorBox.innerText = "Failed to create appointment. Please check your input.";
        errorBox.style.display = 'block';
      });
  });

  // Autocomplete
  const patientInput = document.getElementById('patientName');
  const suggestionsList = document.getElementById('patientSuggestions');

  patientInput.addEventListener('input', () => {
    const query = patientInput.value.trim();
    if (query.length < 2) {
      suggestionsList.innerHTML = '';
      return;
    }

    secureFetch(`/api/patients/?search=${query}`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
      .then(res => res.json())
      .then(data => {
        const results = data.results;
        if (!Array.isArray(results)) {
          console.error("Expected results array, got:", results);
          return;
        }

        suggestionsList.innerHTML = '';
        results.forEach(patient => {
          const li = document.createElement('li');
          li.textContent = `${patient.first_name} ${patient.last_name}`.trim();
          li.addEventListener('click', () => {
            patientInput.value = `${patient.first_name} ${patient.last_name}`.trim();
            document.getElementById('patientId').value = patient.id;
            suggestionsList.innerHTML = '';
          });
          suggestionsList.appendChild(li);
        });
      })
      .catch(err => console.error('Patient search failed:', err));
  });

  document.addEventListener('click', (e) => {
    if (!patientInput.contains(e.target) && !suggestionsList.contains(e.target)) {
      suggestionsList.innerHTML = '';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  setupTabListeners();
  setupModalHandlers();
  fetchAppointments();
});
