// Chart for Appointment History
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

const appointmentHistoryChart = new Chart(document.getElementById('appointmentHistoryChart'), {

  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Appointments',
      data: [2, 4, 3, 5, 2],
      backgroundColor: '#0077cc'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Appointment History'
      }
    }
  }
});

// Chart for Vitals Trend
const vitalsTrendChart = new Chart(document.getElementById('vitalsTrendChart'), {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Blood Pressure (mmHg)',
      data: [120, 125, 118, 122, 119],
      borderColor: '#28a745',
      fill: false,
      tension: 0.4
    },
    {
      label: 'Heart Rate (bpm)',
      data: [75, 78, 77, 76, 74],
      borderColor: '#dc3545',
      fill: false,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Vitals Trend Over Months'
      }
    }
  }
});
