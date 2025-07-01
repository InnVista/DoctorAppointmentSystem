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
    Notifier("No appointment ID provided.");
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
    Notifier.error("Failed to load appointment.");
    window.location.href = "doctor-appointment-overview.html";
    return;
  }

  
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
  
  const rescheduleBtn = document.getElementById('rescheduleBtn');
  if (["started", "completed", "cancelled"].includes(appointment.status)) {
    rescheduleBtn.style.display = "none";
  }
  
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

  
  document.getElementById('rescheduleBtn').addEventListener('click', () => openModal('rescheduleModal'));
  document.getElementById('cancelBtn').addEventListener('click', () => openModal('cancelModal'));
  document.getElementById('statusBtn').addEventListener('click', () => openModal('statusModal'));

  
  document.querySelectorAll('.modal .close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  window.addEventListener('click', e => {
    document.querySelectorAll('.modal').forEach(modal => {
      if (e.target === modal) modal.style.display = 'none';
    });
  });

  document.getElementById('saveNotesBtn').addEventListener('click', async () => {
    const notes = document.getElementById('appointmentNotes').value.trim();
    const reason= document.getElementById('notesReason').value.trim();
    if (!notes) return Notifier.error("Please enter notes.");

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
      Notifier.success("Notes saved successfully.");
    } catch {
      Notifier.error("Failed to save notes.");
    }
  });

  document.querySelector('#rescheduleModal button').addEventListener('click', async () => {
    const date = document.getElementById('newDate').value;
    const time = document.getElementById('newTime').value;
    if (!date || !time) return Notifier.error("Please enter both date and time.");

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
      Notifier.success(`Appointment rescheduled to ${date} at ${time}`);
      closeModal('rescheduleModal');
      location.reload(); // reload to reflect changes
    } catch {
      Notifier.error("Reschedule failed.");
    }
  });

  document.querySelector('#cancelModal button').addEventListener('click', async () => {
    try {
      await secureFetch(`/api/appointments/${appointment.id}/cancel/`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token
        }
      });
      Notifier.success("Appointment cancelled.");
      closeModal('cancelModal');
      location.reload();
    } catch {
      Notifier.error("Cancellation failed.");
    }
  });

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
      })
      .then(res => {
        if (!res.ok) return Notifier.error(res).then(err => Promise.reject(err));
        return res.json();
      });
      Notifier.success(`Status updated to ${status}`);
      closeModal('statusModal');
      location.reload();
    } catch {
      Notifier.error("Failed to update status.");
    }
  });

  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  document.getElementById('goBackBtn').addEventListener('click', () => {
    window.history.back();
  });
});
