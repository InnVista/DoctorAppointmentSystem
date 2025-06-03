document.addEventListener('DOMContentLoaded', () => {
    renderPatients();
    setupPagination();
  });
  
  const patients = Array.from({ length: 50 }, (_, i) => ({
    id: `P${1000 + i}`,
    name: `Patient ${i + 1}`,
    age: 20 + (i % 50),
    gender: ['Male', 'Female', 'Other'][i % 3],
    phone: `99999${(10000 + i).toString().slice(-5)}`,
    condition: ['Diabetes', 'Flu', 'Heart Issues'][i % 3],
  }));
  
  const pageSize = 15;
  let currentPage = 1;
  
  function renderPatients() {
    const patientsBody = document.getElementById('patientsBody');
    patientsBody.innerHTML = '';
  
    const start = (currentPage - 1) * pageSize;
    const paginatedPatients = patients.slice(start, start + pageSize);
  
    paginatedPatients.forEach(p => {
      patientsBody.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td>${p.age}</td>
          <td>${p.gender}</td>
          <td>${p.phone}</td>
          <td>${p.condition}</td>
          <td><a href="patient-view.html?id=${p.id}" class="action-btn">View</a></td>
        </tr>
      `;
    });
  }
  
  function setupPagination() {
    const totalPages = Math.ceil(patients.length / pageSize);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
  
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.innerText = i;
      btn.classList.toggle('active', i === currentPage);
      btn.addEventListener('click', () => {
        currentPage = i;
        renderPatients();
        setupPagination();
      });
      pagination.appendChild(btn);
    }
  }
  
  // Modal Logic
  document.getElementById('addPatientBtn').addEventListener('click', () => {
    document.getElementById('addPatientModal').style.display = 'flex';
  });
  
  document.getElementById('closeAddPatientModal').addEventListener('click', () => {
    document.getElementById('addPatientModal').style.display = 'none';
  });
  
  document.getElementById('cancelAddPatient').addEventListener('click', () => {
    document.getElementById('addPatientModal').style.display = 'none';
  });
  
  document.getElementById('addPatientForm').addEventListener('submit', e => {
    e.preventDefault();
    const newPatient = {
      id: document.getElementById('patientId').value,
      name: document.getElementById('patientName').value,
      age: parseInt(document.getElementById('age').value),
      gender: document.getElementById('gender').value,
      phone: document.getElementById('phone').value,
      condition: document.getElementById('condition').value,
    };
  
    patients.push(newPatient);
    currentPage = Math.ceil(patients.length / pageSize);
    renderPatients();
    setupPagination();
    document.getElementById('addPatientModal').style.display = 'none';


  });

  document.getElementById('addPatientBtn').addEventListener('click', () => {
    window.location.href = 'new-patient.html';
  });
  
  
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});