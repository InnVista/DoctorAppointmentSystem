const API_BASE = "http://localhost:8000/api";
const accessToken = localStorage.getItem("accessToken");

document.addEventListener("DOMContentLoaded", async () => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    const res = await secureFetch(`${API_BASE}/appointments/`);
    const appointments = await res.json();

    const today = new Date().toISOString().split("T")[0];

    let todaysCount = 0;
    let patientSet = new Set();
    let totalDuration = 0;
    let completedCount = 0;

    // Initialize daily stats
    const dailyAppointments = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    const dailyDurations = [0, 0, 0, 0, 0, 0, 0];
    const dailyCounts = [0, 0, 0, 0, 0, 0, 0];

    appointments.forEach(app => {
      const dateObj = new Date(app.appointment_date);
      const weekday = dateObj.getDay(); 

      
      if (app.appointment_date === today) {
        todaysCount++;
      }
      
      patientSet.add(app.patient);

      if (app.status === "completed" && app.duration_minutes) {
        totalDuration += app.duration_minutes;
        completedCount++;
        dailyDurations[weekday] += app.duration_minutes;
        dailyCounts[weekday]++;
      }

      if (["scheduled", "confirmed", "completed"].includes(app.status)) {
        dailyAppointments[weekday]++;
      }
    });

    
    document.getElementById("todaysAppointments").textContent = todaysCount;
    document.getElementById("totalPatients").textContent = patientSet.size;
    document.getElementById("avgConsultTime").textContent =
      completedCount > 0 ? `${Math.round(totalDuration / completedCount)} mins` : "0 mins";

    drawCharts(dailyAppointments, dailyDurations, dailyCounts);
  } catch (err) {
    console.error("Error loading doctor dashboard:", err);
  }
}

function drawCharts(dailyAppointments, dailyDurations, dailyCounts) {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  
  const dailyApptCtx = document.getElementById('dailyAppointmentsChart').getContext('2d');
  new Chart(dailyApptCtx, {
    type: 'line',
    data: {
      labels: dayLabels,
      datasets: [{
        label: 'Appointments',
        data: dailyAppointments,
        fill: true,
        borderColor: '#0077cc',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Daily Appointments (This Week)'
        }
      }
    }
  });

  
  const consultTimeCtx = document.getElementById('consultationTimeChart').getContext('2d');
  const avgDurations = dailyDurations.map((total, i) =>
    dailyCounts[i] > 0 ? parseFloat((total / dailyCounts[i]).toFixed(1)) : 0
  );

  new Chart(consultTimeCtx, {
    type: 'line',
    data: {
      labels: dayLabels,
      datasets: [{
        label: 'Avg Time (mins)',
        data: avgDurations,
        fill: false,
        borderColor: '#cc6699',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Average Consultation Time (This Week)'
        }
      }
    }
  });
}
