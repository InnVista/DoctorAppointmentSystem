// doctor-appointments-overview.js

document.addEventListener('DOMContentLoaded', () => {
    renderAppointments(todayAppointments);
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
  const upcomingTab = document.getElementById('upcomingTab');
  const historyTab = document.getElementById('historyTab');
  const todayTab = document.getElementById('todayTab');


  let currentTab = 'today';
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-button[data-tab="${tab}"]`).classList.add('active');
  
    if (tab === 'today') {
      renderAppointments(todayAppointments);
    } else if (tab === 'upcoming') {
      renderAppointments(upcomingAppointments);
    } else if (tab === 'history') {
      renderAppointments(historyAppointments);
    }
  }
  
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      switchTab(button.getAttribute('data-tab'));
    });
  });
  
  // Initial Load
  renderAppointments(todayAppointments);
  // Tabs Switching
  todayTab.addEventListener('click', () => {
    renderAppointments(todayAppointments);
    todayTab.classList.add('active');
    upcomingTab.classList.remove('active');
    historyTab.classList.remove('active');
  });
  
  // Tabs Switching
  upcomingTab.addEventListener('click', () => {
    renderAppointments(upcomingAppointments);
    upcomingTab.classList.add('active');
    historyTab.classList.remove('active');
    todayTab.classList.remove('active');
  });
  
  historyTab.addEventListener('click', () => {
    renderAppointments(historyAppointments);
    historyTab.classList.add('active');
    upcomingTab.classList.remove('active');
    todayTab.classList.remove('active');
  });
  
  // New Appointment Button
  document.getElementById('newAppointmentBtn').addEventListener('click', () => {
    alert('Redirect to New Appointment Page (Coming Soon)');
  });
  
  // Updated renderAppointments function to pass index
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
  
  // View function (dummy)
  function viewAppointment(index) {
    alert('View Appointment Details (Coming Soon)');
  }
  
  // Reschedule function (dummy)
  function rescheduleAppointment(index) {
    alert('Reschedule Appointment (Coming Soon)');
  }
  

  let appointmentToCancel = null;

function cancelAppointment(index) {
  appointmentToCancel = index;
  document.getElementById('cancelModal').style.display = 'flex';
}

document.getElementById('confirmCancelBtn').addEventListener('click', function() {
  if (appointmentToCancel !== null) {
    upcomingAppointments[appointmentToCancel].status = "Cancelled";
    renderAppointments(upcomingAppointments);
    appointmentToCancel = null;
    document.getElementById('cancelModal').style.display = 'none';
  }
});

document.getElementById('closeModalBtn').addEventListener('click', function() {
  appointmentToCancel = null;
  document.getElementById('cancelModal').style.display = 'none';
});
