// doctor-appointments-overview.js

document.addEventListener('DOMContentLoaded', () => {
    switchTab('today');
    renderAppointments(todayAppointments);
  });

  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
  
  // Mock Appointments Data
  const upcomingAppointments = [
    { patient: "John Doe", date: "2025-04-30", time: "10:00 AM", status: "Upcoming" },
    { patient: "Jane Smith", date: "2025-05-01", time: "2:00 PM", status: "Upcoming" },
  ];
  const todayAppointments = [
    { patient: "John Doe", date: "2025-04-30", time: "10:00 AM", status: "Arrived" },
    { patient: "Jane Smith", date: "2025-05-01", time: "2:00 PM", status: "Arrived" },
  ];
  const historyAppointments = [
    { patient: "Michael Brown", date: "2025-04-25", time: "11:00 AM", status: "Completed" },
    { patient: "Emily White", date: "2025-04-26", time: "3:00 PM", status: "Completed" },
  ];
  
  const appointmentsBody = document.getElementById('appointmentsBody');
  const todayTab = document.getElementById('todayTab');
  const upcomingTab = document.getElementById('upcomingTab');
  const historyTab = document.getElementById('historyTab');
  
  let currentTab = 'today';
  
  function switchTab(tab) {
    console.log(tab)
    if(tab!=null)
        currentTab = tab;
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-button[data-tab="${tab}"]`)?.classList.add('active');
  
    if (tab === 'today') {
      renderAppointments(todayAppointments);
    } else if (tab === 'upcoming') {
      renderAppointments(upcomingAppointments);
    } else if (tab === 'history') {
      renderAppointments(historyAppointments);
    }
  }
  
  todayTab.addEventListener('click', () => switchTab('today'));
  upcomingTab.addEventListener('click', () => switchTab('upcoming'));
  historyTab.addEventListener('click', () => switchTab('history'));
  
  function renderAppointments(data) {
    appointmentsBody.innerHTML = '';
    data.forEach((appointment, index) => {
      const row = `
        <tr>
          <td>${appointment.patient}</td>
          <td>${appointment.date}</td>
          <td>${appointment.time}</td>
          <td><span class="status">${appointment.status}</span></td>
          <td>
            <button class="action-btn" onclick="viewAppointment(${index})">View</button>
            <button class="action-btn" onclick="rescheduleAppointment(${index})">Reschedule</button>
            <button class="action-btn" onclick="cancelAppointment(${index})">Cancel</button>
          </td>
        </tr>
      `;
      appointmentsBody.innerHTML += row;
    });
  }
  
  // View function
  function viewAppointment(index) {
    let selectedAppointment;
    if (currentTab === 'today') {
      selectedAppointment = todayAppointments[index];
    } else if (currentTab === 'upcoming') {
      selectedAppointment = upcomingAppointments[index];
    } else if (currentTab === 'history') {
      selectedAppointment = historyAppointments[index];
    }
  
    // Store appointment data in localStorage
    localStorage.setItem('selectedAppointment', JSON.stringify(selectedAppointment));
    localStorage.setItem('appointmentTab', currentTab); // Optional, if needed on the view page
  
    // Navigate to appointment-view.html
    window.location.href = 'appointment-view.html';
  }
  
  

  
  let appointmentToCancel = null;
  
  function cancelAppointment(index) {
    appointmentToCancel = index;
    document.getElementById('cancelModal').style.display = 'flex';
  }
  
  document.getElementById('confirmCancelBtn').addEventListener('click', function() {
    if (appointmentToCancel !== null) {
      if (currentTab === 'today') {
        todayAppointments[appointmentToCancel].status = "Cancelled";
        renderAppointments(todayAppointments);
      } else if (currentTab === 'upcoming') {
        upcomingAppointments[appointmentToCancel].status = "Cancelled";
        renderAppointments(upcomingAppointments);
      } else if (currentTab === 'history') {
        historyAppointments[appointmentToCancel].status = "Cancelled";
        renderAppointments(historyAppointments);
      }
      appointmentToCancel = null;
      document.getElementById('cancelModal').style.display = 'none';
    }
  });
  
  document.getElementById('closeModalBtn').addEventListener('click', function() {
    appointmentToCancel = null;
    document.getElementById('cancelModal').style.display = 'none';
  });
  
  document.getElementById('newAppointmentBtn').addEventListener('click', () => {
    document.getElementById('newAppointmentModal').style.display = 'flex';
  });
  
  document.getElementById('closeAppointmentModal').addEventListener('click', closeNewAppointmentModal);
  document.getElementById('closeAppointmentModalBtn').addEventListener('click', closeNewAppointmentModal);
  
  function closeNewAppointmentModal() {
    document.getElementById('newAppointmentModal').style.display = 'none';
    document.getElementById('appointmentForm').reset();
    document.getElementById('formError').style.display = 'none';
  }
  
  document.getElementById('appointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('patientName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const errorBox = document.getElementById('formError');
  
    if (!name || !phone || !date || !time) {
      errorBox.innerText = "Please fill in all required fields.";
      errorBox.style.display = 'block';
      return;
    }
  
    if (!/^\d{10}$/.test(phone)) {
      errorBox.innerText = "Please enter a valid 10-digit phone number.";
      errorBox.style.display = 'block';
      return;
    }
  
    // Create and store new appointment
    const newAppointment = {
      patient: name,
      date: date,
      time: time,
      status: "Upcoming",
    };
  
    upcomingAppointments.push(newAppointment);
  
    if (currentTab === 'upcoming') {
      renderAppointments(upcomingAppointments);
    }
  
    alert(`Appointment booked successfully for ${name} on ${date} at ${time}.`);
  
    closeNewAppointmentModal();
  });
  
  
  
  let appointmentToReschedule = null;

function rescheduleAppointment(index) {
  appointmentToReschedule = index;
  // Open the reschedule modal
  document.getElementById('rescheduleModal').style.display = 'flex';
}

document.getElementById('confirmRescheduleBtn').addEventListener('click', function () {
  if (appointmentToReschedule !== null) {
    const newDate = document.getElementById('newDate').value;
    const newTime = document.getElementById('newTime').value;
    const alertBox = document.getElementById('rescheduleAlert');

    if (newDate && newTime) {
      // Hide alert if previously shown
      alertBox.style.display = 'none';

      const updatedAppointment = {
        ...getCurrentAppointments()[appointmentToReschedule],
        date: newDate,
        time: newTime,
      };

      // Update the correct list
      if (currentTab === 'today') {
        todayAppointments[appointmentToReschedule] = updatedAppointment;
        renderAppointments(todayAppointments);
      } else if (currentTab === 'upcoming') {
        upcomingAppointments[appointmentToReschedule] = updatedAppointment;
        renderAppointments(upcomingAppointments);
      } else if (currentTab === 'history') {
        historyAppointments[appointmentToReschedule] = updatedAppointment;
        renderAppointments(historyAppointments);
      }

      // Close modal
      document.getElementById('rescheduleModal').style.display = 'none';
      appointmentToReschedule = null;
    } else {
      alertBox.style.display = 'block';
      alertBox.textContent = 'Please select both date and time.';
    }
  }
});


document.getElementById('closeRescheduleModalBtn').addEventListener('click', function() {
  appointmentToReschedule = null;
  document.getElementById('rescheduleModal').style.display = 'none';
});
document.addEventListener("DOMContentLoaded", function () {
  const openModal = (id) => document.getElementById(id).style.display = 'flex';
  const closeModal = (id) => document.getElementById(id).style.display = 'none';

  // Open buttons
  document.getElementById('rescheduleBtn').addEventListener('click', () => openModal('rescheduleModal'));
  document.getElementById('cancelBtn').addEventListener('click', () => openModal('cancelModal'));
  document.getElementById('statusBtn').addEventListener('click', () => openModal('statusModal'));

  // Close icons
  document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  // Close when clicking outside the modal content
  window.addEventListener('click', function (e) {
    document.querySelectorAll('.modal').forEach(modal => {
      if (e.target === modal) modal.style.display = 'none';
    });
  });
});
