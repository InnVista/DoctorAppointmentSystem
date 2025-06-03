// Helper Functions
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
  }
  
  function closeModal(id) {
    document.getElementById(id).style.display = 'none';
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    const appointmentData = {
      patientName: "John Doe",
      patientPhone: "+1 234 567 890",
      patientID: "12345",
      appointmentDate: "2025-04-30",
      appointmentTime: "14:00",
      appointmentReason: "General checkup",
      previousVisits: [
        { date: "2025-01-15", reason: "Follow-up on blood test" },
        { date: "2024-12-10", reason: "Annual checkup" }
      ]
    };
  
    // Populate fields
    document.getElementById('patientName').textContent = appointmentData.patientName;
    document.getElementById('patientPhone').textContent = appointmentData.patientPhone;
    document.getElementById('patientID').textContent = appointmentData.patientID;
    document.getElementById('appointmentDate').textContent = appointmentData.appointmentDate;
    document.getElementById('appointmentTime').textContent = appointmentData.appointmentTime;
    document.getElementById('appointmentReason').textContent = appointmentData.appointmentReason;
  
    const previousVisitsList = document.getElementById('previousVisitsList');
    appointmentData.previousVisits.forEach(visit => {
      const li = document.createElement('li');
      li.textContent = `Date: ${visit.date} - Reason: ${visit.reason}`;
      previousVisitsList.appendChild(li);
    });
  
    // Open modals
    document.getElementById('rescheduleBtn').addEventListener('click', () => openModal('rescheduleModal'));
    document.getElementById('cancelBtn').addEventListener('click', () => openModal('cancelModal'));
    document.getElementById('statusBtn').addEventListener('click', () => openModal('statusModal'));
  
    // Close modals
    document.querySelectorAll('.modal .close').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });
  
    // Close modals on outside click
    window.addEventListener('click', function (e) {
      document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) modal.style.display = 'none';
      });
    });
  
    // Save notes
    document.getElementById('saveNotesBtn').addEventListener('click', function () {
      const notes = document.getElementById('appointmentNotes').value;
      alert(notes ? "Notes saved!" : "Please enter notes.");
    });
  
    // Go back button
    document.getElementById('goBackBtn').addEventListener('click', function () {
      window.history.back();
    });
  
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', function () {
      document.getElementById('sidebar').classList.toggle('active');
    });
  
    // Modal Actions
    document.querySelector('#rescheduleModal button').addEventListener('click', () => {
      const date = document.getElementById('newDate').value;
      const time = document.getElementById('newTime').value;
      if (date && time) {
        alert(`Appointment rescheduled to ${date} at ${time}`);
        closeModal('rescheduleModal');
      } else {
        alert("Please enter both date and time.");
      }
    });
  
    document.querySelector('#cancelModal button').addEventListener('click', () => {
      alert("Appointment cancelled.");
      closeModal('cancelModal');
    });
  
    document.querySelector('#statusModal button').addEventListener('click', () => {
      const status = document.getElementById('statusSelect').value;
      alert(`Appointment status updated to: ${status}`);
      closeModal('statusModal');
    });
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
  
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  });
  