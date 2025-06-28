let doctors = [];
let currentPage = 1;
const pageSize = 10; // Optional, if your backend supports it

const doctorList = document.getElementById("doctorList");
const searchInput = document.getElementById("searchInput");

const newNameInput = document.getElementById("newDoctorName");
const newEmailInput = document.getElementById("newDoctorEmail");
const newSpecInput = document.getElementById("newDoctorSpecialization");

const addModal = document.getElementById("addDoctorModal");
const openAddModalBtn = document.getElementById("openAddModalBtn");
const addDoctorConfirmBtn = document.getElementById("addDoctorConfirmBtn");
const cancelAddModalBtn = document.getElementById("cancelAddModalBtn");

const editModal = document.getElementById("editDoctorModal");
const editNameInput = document.getElementById("editName");
const editEmailInput = document.getElementById("editEmail");
const editSpecInput = document.getElementById("editSpecialization");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditModalBtn");

const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageDisplay = document.getElementById("currentPageDisplay");


let editIndex = null;

async function fetchDoctors(query = "", page = 1) {
  try {
    const response = await secureFetch(`/api/doctors/?search=${encodeURIComponent(query)}&page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch doctors.');

    const data = await response.json();
    doctors = data.results || data;
    renderDoctors();

    currentPage = page;
    currentPageDisplay.textContent = `Page ${currentPage}`;

    // Enable/disable buttons based on API pagination links
    prevPageBtn.disabled = !data.previous;
    nextPageBtn.disabled = !data.next;
  } catch (error) {
    alert(error.message);
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

// Also update the search input event to reset page and fetch
searchInput.addEventListener("input", () => {
  currentPage = 1;
  fetchDoctors(searchInput.value, currentPage);
});


// Render doctor list
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

  // Re-bind edit buttons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"));
      openEditModal(index);
    });
  });
}

// Add doctor
addDoctorConfirmBtn.onclick = async () => {
  const name = newNameInput.value.trim();
  const email = newEmailInput.value.trim();
  const specialization = newSpecInput.value.trim();

  if (!name || !email || !specialization) {
    alert("Please fill all fields.");
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
      throw new Error(error.detail || "Failed to add doctor.");
    }

    alert("Doctor added successfully! Login credentials sent via email.");
    addModal.style.display = "none";
    newNameInput.value = "";
    newEmailInput.value = "";
    newSpecInput.value = "";

    fetchDoctors(searchInput.value, currentPage); // Refresh
  } catch (error) {
    alert(error.message);
  }
};

// Open edit modal
function openEditModal(index) {
  editIndex = index;
  const doc = doctors[index];
  editNameInput.value = `${doc.first_name} ${doc.last_name || ''}`;
  editEmailInput.value = doc.email;
  editSpecInput.value = doc.specialization || '';
  editModal.style.display = "flex";
}

// Save edits
saveEditBtn.onclick = async () => {
  let name = editNameInput.value.trim();
  let email = editEmailInput.value.trim();
  let specialization = editSpecInput.value.trim();

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

    if (!response.ok) throw new Error('Failed to update doctor');
    editModal.style.display = "none";
    fetchDoctors(searchInput.value, currentPage);
  } catch (error) {
    alert(error.message);
  }
};

// Cancel edit
cancelEditBtn.onclick = () => {
  editModal.style.display = "none";
};

// Delete doctor
async function deleteDoctor(index) {
  const confirmDelete = confirm("Are you sure you want to delete this doctor?");
  if (!confirmDelete) return;

  const id = doctors[index].id;

  try {
    const response = await secureFetch(`/api/doctors/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error("Failed to delete doctor.");
    await fetchDoctors(searchInput.value, currentPage);  // Refresh
  } catch (error) {
    alert(error.message);
  }
}

// Toggle status
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
    alert(error.message);
  }
}

// Search input
searchInput.addEventListener("input", () => {
  currentPage = 1;
  fetchDoctors(searchInput.value, currentPage);
});

// Modal open/close
openAddModalBtn.onclick = () => addModal.style.display = "flex";
cancelAddModalBtn.onclick = () => addModal.style.display = "none";

// Sidebar toggle
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');
toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// On page load
window.onload = () => {
  fetchDoctors(); // load on start
};
