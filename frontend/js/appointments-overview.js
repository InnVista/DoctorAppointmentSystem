let allAppointments = [];
let currentTab = 'today';
let appointmentToCancel = null;

document.addEventListener('DOMContentLoaded', () => {
  setupTabListeners();
  fetchAppointments();
  setupModalHandlers();
  setupNewAppointmentButton();
  setupPatientSearch();
});


function fetchAppointments() {
  secureFetch("/api/appointments/", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then(res => res.json())
    .then(data => {
      allAppointments = data;
      switchTab(currentTab);
    })
    .catch(err => console.error("Error fetching appointments", err));
}

function setupTabListeners() {
  document.getElementById('todayTab')?.addEventListener('click', () => switchTab('today'));
  document.getElementById('upcomingTab')?.addEventListener('click', () => switchTab('upcoming'));
  document.getElementById('historyTab')?.addEventListener('click', () => switchTab('history'));
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.tab-button[data-tab="${tab}"]`)?.classList.add('active');

  const todayDate = new Date().toISOString().split("T")[0];

  let filtered = [];
  if (tab === 'today') {
    filtered = allAppointments.filter(app => app.appointment_date === todayDate);
  } else if (tab === 'upcoming') {
    filtered = allAppointments.filter(app =>
      app.appointment_date > todayDate && app.status !== "cancelled"
    );
  } else if (tab === 'history') {
    filtered = allAppointments.filter(app =>
      app.status === "completed" || app.status === "cancelled"
    );
  }

  renderAppointments(filtered);
}

function renderAppointments(data) {
  const appointmentsBody = document.getElementById('appointmentsBody');
  appointmentsBody.innerHTML = '';

  if (data.length === 0) {
    appointmentsBody.innerHTML = `<tr><td colspan="6">No appointments available.</td></tr>`;
    return;
  }

  data.forEach(app => {
    const row = `
      <tr>
        <td>${app.patient_name || 'Unknown'}</td>
        <td>${app.appointment_date}</td>
        <td>${app.appointment_time}</td>
        <td>${app.reason || 'N/A'}</td>
        <td><span class="status ${app.status.toLowerCase()}">${app.status}</span></td>
        <td>
          <button class="action-btn" onclick="viewAppointment(${app.id})">View</button>
          ${app.status !== 'completed' && app.status !== 'cancelled' ? `
            <button class="action-btn" onclick="rescheduleAppointment(${app.id})">Reschedule</button>
            <button class="action-btn" onclick="cancelAppointment(${app.id})">Cancel</button>
          ` : ''}
        </td>
      </tr>
    `;
    appointmentsBody.innerHTML += row;
  });
}

function viewAppointment(id) {
  const appointment = allAppointments.find(app => app.id === id);
  localStorage.setItem('selectedAppointment', JSON.stringify(appointment));
  localStorage.setItem('appointmentTab', currentTab);
  window.location.href = 'appointment-view.html';
}

function cancelAppointment(id) {
  appointmentToCancel = id;
  document.getElementById('cancelModal').style.display = 'flex';
}

function setupModalHandlers() {
  document.getElementById('confirmCancelBtn')?.addEventListener('click', () => {
    if (appointmentToCancel !== null) {
      secureFetch(`/api/appointments/${appointmentToCancel}/cancel/`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then(res => res.json())
        .then(() => {
          fetchAppointments();
          document.getElementById('cancelModal').style.display = 'none';
          appointmentToCancel = null;
        })
        .catch(err => console.error("Cancel failed", err));
    }
  });

  document.getElementById('closeModalBtn')?.addEventListener('click', () => {
    appointmentToCancel = null;
    document.getElementById('cancelModal').style.display = 'none';
  });
}

function rescheduleAppointment(id) {
  Notifier.success("Reschedule logic is coming soon");
}

function setupNewAppointmentButton() {
  document.querySelector('.add-appointment')?.addEventListener('click', () => {
    document.getElementById('newAppointmentModal')?.style.display = 'flex';
  });
}

function setupPatientSearch() {
  const input = document.getElementById('patientSearch');
  const list = document.getElementById('suggestionList');

  if (!input || !list) return;

  let debounce;

  input.addEventListener("input", () => {
    const query = input.value.trim();

    if (debounce) clearTimeout(debounce);
    if (query.length < 2) {
      list.innerHTML = "";
      return;
    }

    debounce = setTimeout(() => {
      secureFetch(`/api/patients/?search=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then(res => res.json())
        .then(data => {
          list.innerHTML = "";
          data.results.forEach(patient => {
            const li = document.createElement("li");
            li.textContent = `${patient.first_name} (${patient.email})`;
            li.addEventListener("click", () => {
              input.value = `${patient.first_name} (${patient.email})`;
              input.dataset.patientId = patient.id;
              list.innerHTML = "";
            });
            list.appendChild(li);
          });
        })
        .catch(err => {
          console.error("Error fetching suggestions", err);
        });
    }, 300);
  });

  // Hide list when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".form-group")) {
      list.innerHTML = "";
    }
  });
}
