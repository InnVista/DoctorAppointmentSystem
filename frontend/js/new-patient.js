// Submit handler for new patient form
document.getElementById("newPatientForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  // Clear previous error messages
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((msg) => (msg.style.display = "none"));

  let formValid = true;

  // Form values
  const patientName = document.getElementById("patientName").value.trim();
  const dob = document.getElementById("dob").value;
  const age = document.getElementById("age").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
  const gender = document.getElementById("gender").value;
  const emergencyContact = document.getElementById("emergencyContact").value.trim();

  if (!patientName) {
    document.getElementById("nameError").style.display = "block";
    formValid = false;
  }

  if (!dob && !age) {
    document.getElementById("dobError").style.display = "block";
    formValid = false;
  }

  // if (!/^\d{10}$/.test(phone)) {
  //   document.getElementById("phoneError").style.display = "block";
  //   formValid = false;
  // }

  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (email && !emailPattern.test(email)) {
    document.getElementById("emailError").style.display = "block";
    formValid = false;
  }

  
  if (emergencyContact && !/^\d{10}$/.test(emergencyContact)) {
    document.getElementById("emergencyContactError").style.display = "block";
    formValid = false;
  }

  if (!formValid) return;

  
  const [first_name, ...rest] = patientName.split(" ");
  const last_name = rest.join(" ") || "";
  const username = patientName.replace(/\s+/g, '').toLowerCase();

  
  const payload = {
    username,
    email,
    first_name,
    last_name,
    phone,
    dob: dob || null,
    age: age || null,
    address,
    gender,
    emergency_contact: emergencyContact,
    role: "patient",
    
  };

  try {
    const response = await secureFetch("/api/patients/", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      Notifier.error(response)
      
    }
    else{
      Notifier.error("Patient added successfully!");
      document.getElementById("newPatientForm").reset();
    }
  } catch (error) {
    Notifier.error("Error: " + error.message);
  }
});

// Sidebar toggle
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebarToggle");
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});


async function secureFetch(url, options = {}) {
  const token = localStorage.getItem("access_token"); 
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
}
