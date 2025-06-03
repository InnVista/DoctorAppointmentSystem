document.getElementById("symptomForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const selectedSymptoms = Array.from(
        document.querySelectorAll("input[type='checkbox']:checked")
    ).map(checkbox => checkbox.value);

    const resultDiv = document.getElementById("result");
    const doctorSuggestionsDiv = document.getElementById("doctor-suggestions");
    const doctorList = document.getElementById("doctor-list");

    // Initially hide doctor suggestions
    doctorSuggestionsDiv.style.display = "none";

    if (selectedSymptoms.length === 0) {
        resultDiv.textContent = "Please select at least one symptom.";
        resultDiv.style.display = "block";
        return;
    }

    // Mock diagnosis logic
    let diagnosis = "Unable to determine condition. Please consult a doctor.";
    let doctors = [];

    if (selectedSymptoms.includes("fever") && selectedSymptoms.includes("cough")) {
        diagnosis = "Possible Flu or COVID-19. Monitor and seek medical advice.";
        doctors = ["General Physician", "Pulmonologist"];
    } else if (selectedSymptoms.includes("chest pain") && selectedSymptoms.includes("shortness of breath")) {
        diagnosis = "Possible cardiac issue. Seek immediate medical help.";
        doctors = ["Cardiologist", "General Physician"];
    } else if (selectedSymptoms.includes("headache") && selectedSymptoms.includes("nausea")) {
        diagnosis = "Possible migraine symptoms.";
        doctors = ["Neurologist", "General Physician"];
    }

    // Show result
    resultDiv.innerHTML = `<strong>Based on your symptoms:</strong><br>${diagnosis}`;
    resultDiv.style.display = "block";

    // Show doctor suggestions if available
    if (doctors.length > 0) {
        doctorSuggestionsDiv.style.display = "block";
        doctorList.innerHTML = doctors.map(doctor => `<li>${doctor}</li>`).join('');
    }
});
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});