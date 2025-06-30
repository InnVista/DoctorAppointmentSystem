let doctors = [];
let currentPage = 1;
const pageSize = 10;

const doctorList = document.getElementById("doctorList");
const searchInput = document.getElementById("searchInput");

const newNameInput = document.getElementById("newDoctorName");
const newEmailInput = document.getElementById("newDoctorEmail");
const newSpecInputField = document.getElementById("newDoctorSpecializationInput");
const newSpecList = document.getElementById("newDoctorSpecializationList");

const addModal = document.getElementById("addDoctorModal");
const openAddModalBtn = document.getElementById("openAddModalBtn");
const addDoctorConfirmBtn = document.getElementById("addDoctorConfirmBtn");
const cancelAddModalBtn = document.getElementById("cancelAddModalBtn");

const editModal = document.getElementById("editDoctorModal");
const editNameInput = document.getElementById("editName");
const editEmailInput = document.getElementById("editEmail");
const editSpecInputField = document.getElementById("editSpecializationInput");
const editSpecList = document.getElementById("editSpecializationList");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditModalBtn");

const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageDisplay = document.getElementById("currentPageDisplay");

let editIndex = null;

// Specializations list
const SPECIALIZATIONS = [
  "Dermatologist", "General Physician", "Allergist", "Gastroenterologist", "Hepatologist",
  "Infectious Disease Specialist", "Endocrinologist", "Pulmonologist", "Cardiologist",
  "Neurologist", "Neurosurgeon", "Pediatrician", "Emergency Medicine Physician",
  "Vascular Surgeon", "Phlebologist", "Orthopedist", "Rheumatologist", "ENT Specialist",
  "Urologist", "Proctologist"
];

function filterAndShowDropdown(inputEl, listEl) {
  const value = inputEl.value.toLowerCase();
  listEl.innerHTML = "";

  const filtered = SPECIALIZATIONS.filter(spec => spec.toLowerCase().includes(value));
  if (filtered.length === 0) {
    listEl.style.display = "none";
    return;
  }

  filtered.forEach(spec => {
    const li = document.createElement("li");
    li.textContent = spec;
    li.onclick = () => {
      inputEl.value = spec;
      listEl.style.display = "none";
    };
    listEl.appendChild(li);
  });

  listEl.style.display = "block";
}

newSpecInputField.addEventListener("input", () =>
  filterAndShowDropdown(newSpecInputField, newSpecList)
);

editSpecInputField.addEventListener("input", () =>
  filterAndShowDropdown(editSpecInputField, editSpecList)
);

document.addEventListener("click", (e) => {
  if (!newSpecInputField.contains(e.target)) newSpecList.style.display = "none";
  if (!editSpecInputField.contains(e.target)) editSpecList.style.display = "none";
});

async function fetchDoctors(query = "", page = 1) {
  try {
    const response = await secureFetch(`/api/doctors/?search=${encodeURIComponent(query)}&page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch doctors.');

    const data = await response.json();
    doctors = data.results || data;
    renderDoctors();

    currentPage = page;
    currentPageDisplay.textContent = `Page ${currentPage}`;

    prevPageBtn.disabled = !data.previous;
    nextPageBtn.disabled = !data.next;
  } catch (error) {
    showNotification(error.message || "An unexpected error occurred.", "error");
  }
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    fetchDoctors(searchInput.value, currentPage - 1);
  }
});

nextPageBtn.addEventListener("click", () => {
  fetchDoctors(searchInput.value, currentPage + 1);
});

searchInput.addEventListener("input", () => {
  currentPage = 1;
  fetchDoctors(searchInput.value, currentPage);
});

function renderDoctors() {
  doctorList.innerHTML = "";

  doctors.forEach((doc, index) => {
    const fullName = `${doc.first_name} ${doc.last_name || ''}`;
    doctorList.innerHTML += `
      <tr>
        <td>${fullName}</td>
        <td>${doc.email}</td>
        <td>${doc.specialization || 'N/A'}</td>
        <td>${doc.is_active === false ? 'Inactive' : 'Active'}</td>
        <td>
          <button class="action-btn edit-btn" data-index="${index}">Edit</button>
          <button class="action-btn deactivate-btn" onclick="toggleStatus(${index})">
            ${doc.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button class="action-btn delete-btn" onclick="deleteDoctor(${index})">Delete</button>
        </td>
      </tr>
    `;
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"));
      openEditModal(index);
    });
  });
}

addDoctorConfirmBtn.onclick = async () => {
  const name = newNameInput.value.trim();
  const email = newEmailInput.value.trim();
  const specialization = newSpecInputField.value.trim();

  if (!name || !email || !specialization) {
    showNotification("Please fill all fields.", "error");
    return;
  }

  const first_name = name.split(" ")[0];
  const last_name = name.split(" ").slice(1).join(" ") || "";
  const username = name.replace(/\s+/g, '').toLowerCase();

  try {
    const response = await secureFetch('/api/doctors/', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        first_name,
        last_name,
        specialization,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(error)
      console.log(response)
      if (typeof error === 'string')
        throw new Error(error || "Failed to add doctor.");
      message = Object.entries(error)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
        .join('\n');
      throw new Error(message || "Failed to add doctor.");
    }
    showNotification("Doctor added successfully! Login credentials sent via email.", "success")
    addModal.style.display = "none";
    newNameInput.value = "";
    newEmailInput.value = "";
    newSpecInputField.value = "";
    fetchDoctors(searchInput.value, currentPage);
  } catch (error) {
    showNotification(error.message || "An unexpected error occurred.", "error");
  }
};

function openEditModal(index) {
  editIndex = index;
  const doc = doctors[index];
  editNameInput.value = `${doc.first_name} ${doc.last_name || ''}`;
  editEmailInput.value = doc.email;
  editSpecInputField.value = doc.specialization || '';
  editModal.style.display = "flex";
}

saveEditBtn.onclick = async () => {
  let name = editNameInput.value.trim();
  let email = editEmailInput.value.trim();
  let specialization = editSpecInputField.value.trim();

  const existingDoctor = doctors[editIndex];
  const id = existingDoctor.id;

  if (!name) name = `${existingDoctor.first_name} ${existingDoctor.last_name || ''}`;
  if (!email) email = existingDoctor.email;
  if (!specialization) specialization = existingDoctor.specialization;

  const [first_name, ...rest] = name.split(" ");
  const last_name = rest.join(" ") || "";

  try {
    const response = await secureFetch(`/api/doctors/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({
        email,
        first_name,
        last_name,
        specialization,
        username: existingDoctor.username,
      }),
    });

    
    if (!response.ok) {
      const error = await response.json();
      console.log(error)
      console.log(response)
      if (typeof error === 'string')
        throw new Error(error || "Failed to update doctor.");
      message = Object.entries(error)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
        .join('\n');
      throw new Error(message || "Failed to update doctor.");
    }
    editModal.style.display = "none";
    fetchDoctors(searchInput.value, currentPage);
  } catch (error) {
    showNotification(error.message || "An unexpected error occurred.", "error");
  }
};

cancelEditBtn.onclick = () => {
  editModal.style.display = "none";
};

async function deleteDoctor(index) {
  const confirmDelete = confirm("Are you sure you want to delete this doctor?");
  if (!confirmDelete) return;

  const id = doctors[index].id;

  try {
    const response = await secureFetch(`/api/doctors/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error("Failed to delete doctor.");
    await fetchDoctors(searchInput.value, currentPage);
  } catch (error) {
    showNotification(error.message || "An unexpected error occurred.", "error");
  }
}

async function toggleStatus(index) {
  const doc = doctors[index];
  const id = doc.id;
  const newStatus = doc.is_active ? "Inactive" : "Active";

  try {
    const response = await secureFetch(`/api/doctors/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) throw new Error("Failed to update status.");
    await fetchDoctors(searchInput.value, currentPage);
  } catch (error) {
    showNotification(error.message || "An unexpected error occurred.", "error");
  }
}

openAddModalBtn.onclick = () => addModal.style.display = "flex";
cancelAddModalBtn.onclick = () => addModal.style.display = "none";

const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');
toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove("hidden");

  setTimeout(() => {
    notification.classList.add("hidden");
  }, 3000);
}

window.onload = () => {
  fetchDoctors();
};
