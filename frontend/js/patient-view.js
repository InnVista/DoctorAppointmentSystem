document.addEventListener("DOMContentLoaded", function () {
    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    const formElements = document.querySelectorAll(
      "#patientViewForm input, #patientViewForm textarea"
    );
  
    editBtn.addEventListener("click", () => {
      formElements.forEach(el => el.disabled = false);
      editBtn.style.display = "none";
      saveBtn.style.display = "inline-block";
    });
  
    document.getElementById("patientViewForm").addEventListener("submit", function (e) {
      e.preventDefault();
  
      // Sample validation (you can enhance this)
      const name = document.getElementById("patientName").value.trim();
      if (name === "") {
        alert("Name is required.");
        return;
      }
  
      alert("Changes saved!");
      formElements.forEach(el => el.disabled = true);
      editBtn.style.display = "inline-block";
      saveBtn.style.display = "none";
    });
  });
  
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
  function enableEditing() {
    const inputs = document.querySelectorAll("#patientViewForm input, #patientViewForm textarea, #patientViewForm select");
    inputs.forEach(input => input.removeAttribute("readonly"));
    document.querySelector(".edit-btn").style.display = "none";
    document.querySelector(".save-btn").style.display = "inline-block";
  }
  
  function saveChanges() {
    const inputs = document.querySelectorAll("#patientViewForm input, #patientViewForm textarea, #patientViewForm select");
    inputs.forEach(input => input.setAttribute("readonly", true));
    document.querySelector(".edit-btn").style.display = "inline-block";
    document.querySelector(".save-btn").style.display = "none";
    alert("Changes saved successfully!");
  }