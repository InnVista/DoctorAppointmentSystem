// Sidebar toggle
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  secureFetch('/api/appointments/stats/')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch appointment stats.');
      }
      return response.json();
    })
    .then(data => {
      document.getElementById('appointmentCount').textContent = data.upcoming || 0;
      document.getElementById('lastVisit').textContent = data.lastVisit || 'N/A';
      renderAppointmentChart(data.monthlyHistory);
    })
    .catch(error => {
      console.error('Error fetching dashboard stats:', error);
    });
});

function renderAppointmentChart(monthlyData) {
  const ctx = document.getElementById('appointmentHistoryChart');
  const labels = monthlyData.map(item => item.month);
  const counts = monthlyData.map(item => item.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Appointments',
        data: counts,
        backgroundColor: '#0077cc'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Appointments Per Month' }
      }
    }
  });
}
