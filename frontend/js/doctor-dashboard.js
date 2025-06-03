document.addEventListener('DOMContentLoaded', function() {
    // Sidebar Toggle functionality
    const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
  
    // Daily Appointments Trend
    const dailyAppointmentsCtx = document.getElementById('dailyAppointmentsChart').getContext('2d');
    new Chart(dailyAppointmentsCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
          label: 'Appointments',
          data: [5, 7, 8, 6, 9, 4],
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
            text: 'Daily Appointments'
          }
        }
      }
    });
  
    // Top Diagnosed Diseases
    const diagnosedCasesCtx = document.getElementById('diagnosedCasesChart').getContext('2d');
    new Chart(diagnosedCasesCtx, {
      type: 'bar',
      data: {
        labels: ['Flu', 'Fever', 'Diabetes', 'Allergy', 'Fracture'],
        datasets: [{
          label: 'Cases',
          data: [15, 10, 8, 6, 4],
          backgroundColor: ['#4CAF50', '#ff9900', '#66ccff', '#ff6666', '#9966cc']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top Diagnosed Diseases'
          }
        }
      }
    });
  
    // Patient Age Groups
    const patientAgeCtx = document.getElementById('patientAgeChart').getContext('2d');
    new Chart(patientAgeCtx, {
      type: 'pie',
      data: {
        labels: ['0-18', '19-30', '31-45', '46-60', '60+'],
        datasets: [{
          label: 'Age Groups',
          data: [10, 30, 25, 20, 15],
          backgroundColor: ['#0077cc', '#ff9900', '#66cc66', '#cc6699', '#ff6666']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Patient Age Group Distribution'
          }
        }
      }
    });
  
    // Average Consultation Time
    const consultationTimeCtx = document.getElementById('consultationTimeChart').getContext('2d');
    new Chart(consultationTimeCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
          label: 'Minutes',
          data: [18, 20, 22, 19, 21, 17],
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
            text: 'Average Consultation Time'
          }
        }
      }
    });
  });

  function loadComponent(id, filePath) {
    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load ${filePath}: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        document.getElementById(id).innerHTML = data;
      })
      .catch(error => {
        console.error(error);
      });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header-placeholder", "../pages/doctor/doctor-header.html");
    loadComponent("sidebar-placeholder", "../pages/doctor/sidebar.html");
    loadComponent("footer-placeholder", "../pages/doctor/footer.html");
  });
  