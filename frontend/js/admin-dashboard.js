// Appointments per Month
const appointmentsCtx = document.getElementById('appointmentsChart').getContext('2d');
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

new Chart(appointmentsCtx, {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Appointments',
      data: [30, 50, 40, 60, 80, 90],
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

// Doctor Specializations
const specializationCtx = document.getElementById('specializationChart').getContext('2d');
new Chart(specializationCtx, {
  type: 'pie',
  data: {
    labels: ['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Psychiatry'],
    datasets: [{
      label: 'Specialization Distribution',
      data: [25, 20, 15, 25, 15],
      backgroundColor: ['#0077cc', '#ff9900', '#66cc66', '#cc6699', '#ff6666']
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

// Patient Growth
const patientGrowthCtx = document.getElementById('patientGrowthChart').getContext('2d');
new Chart(patientGrowthCtx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'New Patients',
      data: [10, 15, 20, 25, 35, 40],
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

// Revenue (Dummy)
const revenueCtx = document.getElementById('revenueChart').getContext('2d');
new Chart(revenueCtx, {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue (₹)',
      data: [20000, 25000, 30000, 35000, 40000, 50000],
      backgroundColor: '#cc6699'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Revenue'
      }
    }
  }
});
