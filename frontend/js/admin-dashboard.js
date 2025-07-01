const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

const API_BASE = "http://localhost:8000/api";


const DOCTORS_API = `${API_BASE}/doctors/all/`;
const PATIENTS_API = `${API_BASE}/patients/all/`;
const APPOINTMENTS_API = `${API_BASE}/appointments/all/`;

// Fetch data and initialize dashboard
async function fetchData() {
  try {
    const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
      secureFetch(DOCTORS_API),
      secureFetch(PATIENTS_API),
      secureFetch(APPOINTMENTS_API)
    ]);

    const doctors = await doctorsRes.json();
    const patients = await patientsRes.json();
    const appointments = await appointmentsRes.json();

    // === Dashboard Counts ===
    document.getElementById('totalDoctors').textContent = doctors.length;
    document.getElementById('totalPatients').textContent = patients.length;

    const now = new Date();
    const appointmentCounts = Array(12).fill(0);

    appointments.forEach(app => {
      const date = new Date(app.appointment_date);
      if (date.getFullYear() === now.getFullYear()) {
        appointmentCounts[date.getMonth()]++;
      }
    });

    document.getElementById('appointmentsThisMonth').textContent = appointmentCounts[now.getMonth()];

    drawCharts(doctors, patients, appointmentCounts);
  } catch (error) {
    console.error("Dashboard data fetch failed:", error);
  }
}

function drawCharts(doctors, patients, monthlyAppointments) {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                       
  new Chart(document.getElementById('appointmentsChart'), {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [{
        label: 'Appointments',
        data: monthlyAppointments,
        backgroundColor: '#4CAF50'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Appointments per Month'
        }
      }
    }
  });
  

  const revenue = monthlyAppointments.map(count => count * 250);
  new Chart(document.getElementById('revenueChart'), {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [{
        label: 'Revenue (₹)',
        data: revenue,
        backgroundColor: '#cc6699'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Monthly Revenue (₹250 per Appointment)'
        }
      }
    }
  });

  
  const specializationCount = {};
  doctors.forEach(doc => {
    const spec = doc.specialization?.trim() || "Others";
    specializationCount[spec] = (specializationCount[spec] || 0) + 1;
  });

  const specLabels = Object.keys(specializationCount);
  const specValues = Object.values(specializationCount);
  const specColors = specLabels.map((_, i) => `hsl(${i * 50}, 70%, 60%)`);

  new Chart(document.getElementById('specializationChart'), {
    type: 'pie',
    data: {
      labels: specLabels,
      datasets: [{
        label: 'Specializations',
        data: specValues,
        backgroundColor: specColors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Doctor Specialization Breakdown'
        }
      }
    }
  });

  
  const patientMonthly = Array(12).fill(0);
  patients.forEach(p => {
    const joined = new Date(p.date_joined || p.joining_date);
    if (!isNaN(joined) && joined.getFullYear() === new Date().getFullYear()) {
      patientMonthly[joined.getMonth()]++;
    }
  });

  new Chart(document.getElementById('patientGrowthChart'), {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [{
        label: 'New Patients',
        data: patientMonthly,
        fill: true,
        borderColor: '#ff9900',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'New Patient Growth'
        }
      }
    }
  });
}

fetchData();
