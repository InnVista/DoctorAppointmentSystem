document.addEventListener('DOMContentLoaded', () => {
  fetchPatients();
});

let currentPage = 1;
const pageSize = 10;

async function fetchPatients(page = 1) {
  try {
    const response = await secureFetch(`/api/patients/?page=${page}&page_size=${pageSize}`);
    if (!response.ok)
      Notifier.error(response)
    const data = await response.json();
    renderPatients(data.results);
    setupPagination(data.count, page);
  } catch (error) {
    Notifier.error(error.message);
  }
}


function renderPatients(patients) {
  const patientsBody = document.getElementById('patientsBody');
  patientsBody.innerHTML = '';

  patients.forEach(p => {
    const fullName = `${p.first_name} ${p.last_name || ''}`.trim();
    patientsBody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${fullName}</td>
        <td>${p.gender || '-'}</td>
        <td>${p.phone || '-'}</td>
        <td>
          <a href="../pages/admin/patient-view.html?id=${p.id}" class="action-btn">View</a>
        </td>
      </tr>
    `;
  });
}

function setupPagination(totalItems, currentPage) {
  const pagination = document.getElementById('pagination');
  const totalPages = Math.ceil(totalItems / pageSize);
  pagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.classList.toggle('active', i === currentPage);
    btn.addEventListener('click', () => {
      fetchPatients(i);
    });
    pagination.appendChild(btn);
  }
}


document.getElementById('addPatientBtn').addEventListener('click', () => {
  window.location.href = '../pages/admin/new-patient.html';
});


const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');
toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});
