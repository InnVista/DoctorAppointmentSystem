let doctors = [
    { name: "Dr. Alice Smith", email: "alice@example.com", specialization: "Cardiology", status: "Active" },
    { name: "Dr. Bob Johnson", email: "bob@example.com", specialization: "Dermatology", status: "Inactive" },
  ];
  
  const doctorList = document.getElementById("doctorList");
  const nameInput = document.getElementById("doctorName");
  const emailInput = document.getElementById("doctorEmail");
  const specInput = document.getElementById("doctorSpecialization");
  const addBtn = document.getElementById("addDoctorBtn");
  
  function renderDoctors() {
    doctorList.innerHTML = "";
    doctors.forEach((doc, index) => {
      doctorList.innerHTML += `
        <tr>
          <td>${doc.name}</td>
          <td>${doc.email}</td>
          <td>${doc.specialization}</td>
          <td>${doc.status}</td>
          <td>
            <button class="action-btn edit-btn" data-index="${index}">Edit</button>
            <button class="action-btn deactivate-btn" onclick="toggleStatus(${index})">${doc.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
            <button class="action-btn delete-btn" onclick="deleteDoctor(${index})">Delete</button>
          </td>
        </tr>
      `;
    });
  }
  
  addBtn.onclick = () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const spec = specInput.value.trim();
    
    // Clear previous errors
    nameInput.classList.remove("error");
    emailInput.classList.remove("error");
    specInput.classList.remove("error");
  
    const errorMessage = document.querySelector(".error-message");
    if (errorMessage) errorMessage.remove();  // Remove any previous error messages
  
    if (name && email && spec) {
      doctors.push({ name, email, specialization: spec, status: "Active" });
      nameInput.value = "";
      emailInput.value = "";
      specInput.value = "";
      renderDoctors();
    } else {
      let errorText = "Please fill all fields.";
      
      if (!name) nameInput.classList.add("error");
      if (!email) emailInput.classList.add("error");
      if (!spec) specInput.classList.add("error");
  
      // Display error message below the form
      const errorDiv = document.createElement("div");
      errorDiv.classList.add("error-message");
      errorDiv.textContent = errorText;
      document.querySelector(".add-form").appendChild(errorDiv);
    }
  };
  
  
  let editIndex = null;
  
  function openEditModal(index) {
    editIndex = index;
    const doc = doctors[index];
    document.getElementById("editName").value = doc.name;
    document.getElementById("editEmail").value = doc.email;
    document.getElementById("editSpecialization").value = doc.specialization;
    document.getElementById("editDoctorModal").style.display = "flex"; // Show the edit modal
  }
  
  document.getElementById("saveEditBtn").onclick = () => {
    const name = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const specialization = document.getElementById("editSpecialization").value.trim();
  
    if (name && email && specialization) {
      doctors[editIndex] = { ...doctors[editIndex], name, email, specialization };
      document.getElementById("editDoctorModal").style.display = "none"; // Hide the edit modal
      renderDoctors();
    } else {
      alert("Please fill all fields.");
    }
  };
  
  document.getElementById("cancelEditModalBtn").onclick = () => {
    document.getElementById("editDoctorModal").style.display = "none"; // Hide the edit modal
  };
  
  document.getElementById("confirmEditBtn").onclick = () => {
    document.getElementById("editPopupOverlay").style.display = "none"; // Hide confirmation popup
    openEditModal(editIndex); // Open the actual edit modal after confirmation
  };
  
  document.getElementById("cancelEditBtn").onclick = () => {
    document.getElementById("editPopupOverlay").style.display = "none"; // Hide confirmation popup
  };
  
  function toggleStatus(index) {
    doctors[index].status = doctors[index].status === "Active" ? "Inactive" : "Active";
    renderDoctors();
  }
  
  function deleteDoctor(index) {
    if (confirm("Are you sure you want to delete this doctor?")) {
      doctors.splice(index, 1);
      renderDoctors();
    }
  }
  
  // Edit button modal logic
  document.addEventListener("click", function(e) {
    if (e.target.classList.contains("edit-btn")) {
      editIndex = e.target.getAttribute("data-index");
      // Show the confirmation popup before opening the edit modal
      document.getElementById("editPopupOverlay").style.display = "flex"; // Show the confirmation popup
    }
  });
  
  renderDoctors();
  

  addBtn.onclick = () => {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const spec = specInput.value.trim();
  
  // Clear previous errors
  nameInput.classList.remove("error");
  emailInput.classList.remove("error");
  specInput.classList.remove("error");

  const errorMessage = document.querySelector(".error-message");
  if (errorMessage) errorMessage.remove();  // Remove any previous error messages

  if (name && email && spec) {
    doctors.push({ name, email, specialization: spec, status: "Active" });
    nameInput.value = "";
    emailInput.value = "";
    specInput.value = "";
    renderDoctors();
  } else {
    let errorText = "Please fill all fields.";
    
    if (!name) nameInput.classList.add("error");
    if (!email) emailInput.classList.add("error");
    if (!spec) specInput.classList.add("error");

    // Display error message below the form
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("error-message");
    errorDiv.textContent = errorText;
    document.querySelector(".add-form").appendChild(errorDiv);
  }
};
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});
