document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('id');

  if (!patientId) {
    notification.error('Patient ID not found in URL');
    return;
  }

  try {
    const response = await secureFetch(`/api/patients/${patientId}/`);
    if (!response.ok) 
      notification.error(error);

    const data = await response.json();
    populateForm(data);
  } catch (err) {
    notification.error(err.message);
  }
});

function populateForm(patient) {
  const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();

  document.getElementById('patientName').value = fullName;
  document.getElementById('dob').value = patient.dob;
  document.getElementById('phone').value = patient.phone || '';
  document.getElementById('email').value = patient.email || '';
  document.getElementById('gender').value = patient.gender || '';
  document.getElementById('emergencyContact').value = patient.emergency_contact || '';
  document.getElementById('address').value = patient.address || '';
}

// Toggle edit/save buttons
document.getElementById('editBtn').addEventListener('click', () => {
  document.querySelectorAll('#patientViewForm input, #patientViewForm textarea, #patientViewForm select').forEach(field => field.disabled = false);
  document.getElementById('saveBtn').style.display = 'inline-block';
  document.getElementById('editBtn').style.display = 'none';
});

// Submit updated data (optional)
document.getElementById('patientViewForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('id');
  if (!patientId) return;

  const fullName = document.getElementById('patientName').value.trim().split(' ');
  const first_name = fullName[0];
  const last_name = fullName.slice(1).join(' ') || '';
  const rawDob=null;
  const updatedData = {
    first_name,
    last_name,
    dob: document.getElementById('dob').value=== "" ? null : document.getElementById('dob').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    gender: document.getElementById('gender').value,
    emergency_contact: document.getElementById('emergencyContact').value,
    address: document.getElementById('address').value,
    username: document.getElementById('email').value,
  };

  try {
    const response = await secureFetch(`/api/patients/${patientId}/`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const error = await response.json();
      // throw new Error(error.detail || 'Update failed');
      notification.error(error);
    }

    notification.success('Patient updated successfully!');
    document.querySelectorAll('#patientViewForm input, #patientViewForm textarea, #patientViewForm select').forEach(field => field.disabled = true);
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('editBtn').style.display = 'inline-block';
  } catch (err) {
    notification.error(err.message);
  }
});
