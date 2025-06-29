function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

document.addEventListener("DOMContentLoaded", async function () {
  const appointmentId = getQueryParam("id");

  if (!appointmentId) {
    alert("No appointment ID provided.");
    window.location.href = "doctor-appointment-overview.html";
    return;
  }

  const token = localStorage.getItem("token");

  let appointment;

  try {
    const res = await secureFetch(`/api/appointments/${appointmentId}/`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });
    appointment = await res.json();

    if (!appointment.id) throw new Error("Invalid appointment data.");
  } catch (err) {
    alert("Failed to load appointment.");
    window.location.href = "doctor-appointment-overview.html";
    return;
  }

  // Populate details
  document.getElementById('patientName').textContent = appointment.patient_name || "Unknown";
  document.getElementById('patientPhone').textContent = appointment.phone || "N/A";
  document.getElementById('patientID').textContent = appointment.patient || "-";
  document.getElementById('appointmentDate').textContent = appointment.appointment_date;
  document.getElementById('appointmentTime').textContent = appointment.appointment_time;
  document.getElementById('appointmentReason').textContent = appointment.reason || "-";
  document.getElementById('appointmentStatus').textContent = appointment.status || "-";
  document.getElementById('notesReason').value = appointment.reason || "";
  if (appointment.notes && appointment.notes.trim() !== "") {
    document.getElementById('appointmentNotesDisplay').textContent = appointment.notes;
    document.getElementById('doctorNotesSection').style.display = "block";
  }
  // Hide reschedule button for disallowed statuses
  const rescheduleBtn = document.getElementById('rescheduleBtn');
  if (["started", "completed", "cancelled"].includes(appointment.status)) {
    rescheduleBtn.style.display = "none";
  }
  // Previous visits
  try {
    const res = await secureFetch(`/api/appointments/?patient=${appointment.patient}`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });
    const data = await res.json();
    const visits = data
      .filter(item => item.id !== appointment.id)
      .filter(item => item.status === 'completed' || item.status === 'cancelled' || item.appointment_date < appointment.appointment_date)
      .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

    const list = document.getElementById('previousVisitsList');
    if (visits.length === 0) {
      list.innerHTML = '<li>No previous visits found.</li>';
    } else {
      list.innerHTML = "";
      console.log("Previous visits:", visits);
      visits.forEach(visit => {
      const li = document.createElement('li');
      li.innerHTML = `
        <p><strong>Date:</strong> ${visit.appointment_date}</p>
        <p><strong>Time:</strong> ${visit.appointment_time || "N/A"}</p>
        <p><strong>Reason:</strong> ${visit.reason || "N/A"}</p>
        <p><strong>Status:</strong> ${visit.status}</p>
        <p><strong>Notes:</strong> ${visit.notes || "No notes"}</p>
      `;
      list.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Failed to fetch previous visits:", err);
    document.getElementById('previousVisitsList').innerHTML = '<li>Error loading previous visits.</li>';
  }

  // Modal events
  document.getElementById('rescheduleBtn').addEventListener('click', () => openModal('rescheduleModal'));
  document.getElementById('cancelBtn').addEventListener('click', () => openModal('cancelModal'));
  document.getElementById('statusBtn').addEventListener('click', () => openModal('statusModal'));

  // Close modals
  document.querySelectorAll('.modal .close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  window.addEventListener('click', e => {
    document.querySelectorAll('.modal').forEach(modal => {
      if (e.target === modal) modal.style.display = 'none';
    });
  });

  // Save Notes
  document.getElementById('saveNotesBtn').addEventListener('click', async () => {
    const notes = document.getElementById('appointmentNotes').value.trim();
    const reason= document.getElementById('notesReason').value.trim();
    if (!notes) return alert("Please enter notes.");

    try {
      await secureFetch(`/api/appointments/${appointment.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
      body: JSON.stringify({ notes, reason })
      });
      
    document.getElementById('appointmentReason').textContent = reason || appointment.reason;
      alert("Notes saved successfully.");
    } catch {
      alert("Failed to save notes.");
    }
  });

  // Reschedule
  document.querySelector('#rescheduleModal button').addEventListener('click', async () => {
    const date = document.getElementById('newDate').value;
    const time = document.getElementById('newTime').value;
    if (!date || !time) return alert("Please enter both date and time.");

    try {
      await secureFetch(`/api/appointments/${appointment.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          appointment_date: date,
          appointment_time: time,
          status: "rescheduled"
        })
      });
      alert(`Appointment rescheduled to ${date} at ${time}`);
      closeModal('rescheduleModal');
      location.reload(); // reload to reflect changes
    } catch {
      alert("Reschedule failed.");
    }
  });

  // Cancel
  document.querySelector('#cancelModal button').addEventListener('click', async () => {
    try {
      await secureFetch(`/api/appointments/${appointment.id}/cancel/`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token
        }
      });
      alert("Appointment cancelled.");
      closeModal('cancelModal');
      location.reload();
    } catch {
      alert("Cancellation failed.");
    }
  });

  // Status Update
  document.querySelector('#statusModal button').addEventListener('click', async () => {
    const status = document.getElementById('statusSelect').value;

    try {
      await secureFetch(`/api/appointments/${appointment.id}/status/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ status })
      });
      alert(`Status updated to ${status}`);
      closeModal('statusModal');
      location.reload();
    } catch {
      alert("Failed to update status.");
    }
  });

  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  // Go back
  document.getElementById('goBackBtn').addEventListener('click', () => {
    window.history.back();
  });
});
