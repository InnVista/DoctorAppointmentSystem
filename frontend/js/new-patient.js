document.getElementById("newPatientForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    // Clear previous error messages
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(msg => msg.style.display = "none");
  
    let formValid = true;
  
    // Name (Required)
    const patientName = document.getElementById("patientName").value.trim();
    if (!patientName) {
      document.getElementById("nameError").style.display = "block";
      formValid = false;
    }
  
    // DOB or Age (One must be filled)
    const dob = document.getElementById("dob").value;
    const age = document.getElementById("age") ? document.getElementById("age").value.trim() : "";
    if (!dob && !age) {
      document.getElementById("dobError").style.display = "block";
      formValid = false;
    }
  
    // Phone (Required, 10-digit)
    const phone = document.getElementById("phone").value.trim();
    if (!/^\d{10}$/.test(phone)) {
      document.getElementById("phoneError").style.display = "block";
      formValid = false;
    }
  
    // Email (Optional, but validate if filled)
    const email = document.getElementById("email").value.trim();
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (email && !emailPattern.test(email)) {
      document.getElementById("emailError").style.display = "block";
      formValid = false;
    }
  
    // Address (Optional, no format validation here)
    const address = document.getElementById("address").value.trim();
    // No validation unless you want minimum character length, etc.
  
    // Gender (Optional)
    const gender = document.getElementById("gender").value;
    // No validation needed if optional
  
    // Emergency Contact (Optional, but must be 10-digit if entered)
    const emergencyContact = document.getElementById("emergencyContact").value.trim();
    if (emergencyContact && !/^\d{10}$/.test(emergencyContact)) {
      document.getElementById("emergencyContactError").style.display = "block";
      formValid = false;
    }
  
    // Final validation
    if (formValid) {
      alert("Patient added successfully!");
      document.getElementById("newPatientForm").reset();
    }
  });
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});
