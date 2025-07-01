const allSymptoms = [
  "abdominal_pain", "acidity", "acute_liver_failure", "altered_sensorium", "back_pain",
  "blackheads", "bladder_discomfort", "blister", "blood_in_sputum", "bloody_stool",
  "blurred_and_distorted_vision", "breathlessness", "brittle_nails", "bruising", "burning_micturition",
  "chest_pain", "chills", "cold_hands_and_feets", "coma", "congestion", "constipation",
  "continuous_feel_of_urine", "continuous_sneezing", "cough", "cramps", "dark_urine",
  "dehydration", "depression", "diarrhoea", "dischromic_patches", "distention_of_abdomen",
  "dizziness", "drying_and_tingling_lips", "enlarged_thyroid", "excessive_hunger",
  "extra_marital_contacts", "family_history", "fast_heart_rate", "fatigue", "fluid_overload",
  "foul_smell_of_urine", "headache", "high_fever", "hip_joint_pain", "history_of_alcohol_consumption",
  "increased_appetite", "indigestion", "inflammatory_nails", "internal_itching",
  "irregular_sugar_level", "irritability", "irritation_in_anus", "itching", "joint_pain", "knee_pain",
  "lack_of_concentration", "lethargy", "loss_of_appetite", "loss_of_balance", "loss_of_smell", "malaise",
  "mild_fever", "mood_swings", "movement_stiffness", "mucoid_sputum", "muscle_pain",
  "muscle_wasting", "muscle_weakness", "nausea", "neck_pain", "nodal_skin_eruptions", "obesity",
  "pain_behind_the_eyes", "pain_during_bowel_movements", "pain_in_anal_region", "painful_walking",
  "palpitations", "passage_of_gases", "patches_in_throat", "phlegm", "polyuria",
  "prominent_veins_on_calf", "puffy_face_and_eyes", "pus_filled_pimples", "receiving_blood_transfusion",
  "receiving_unsterile_injections", "red_sore_around_nose", "red_spots_over_body", "redness_of_eyes",
  "restlessness", "runny_nose", "rusty_sputum", "scurring", "shivering", "silver_like_dusting",
  "sinus_pressure", "skin_peeling", "skin_rash", "slurred_speech", "small_dents_in_nails",
  "spinning_movements", "spotting_urination", "stiff_neck", "stomach_bleeding", "stomach_pain",
  "sunken_eyes", "sweating", "swelled_lymph_nodes", "swelling_joints", "swelling_of_stomach",
  "swollen_blood_vessels", "swollen_extremeties", "swollen_legs", "throat_irritation",
  "toxic_look_typhos", "ulcers_on_tongue", "unsteadiness", "visual_disturbances", "vomiting",
  "watering_from_eyes", "weakness_in_limbs", "weakness_of_one_body_side", "weight_gain", "weight_loss",
  "yellow_crust_ooze", "yellow_urine", "yellowing_of_eyes", "yellowish_skin"
];



// --- DOM references ---
const symptomList = document.getElementById('symptomList');
const dropdown = document.getElementById('symptomDropdownList');
const input = document.getElementById('symptomInput');
const tagContainer = document.getElementById('symptomTags');
const selectedSymptoms = new Set();

// --- Populate datalist and dropdown ---
allSymptoms.forEach(symptom => {
  const cleanLabel = symptom.replace(/_/g, ' ');

  // Datalist option
  const option = document.createElement('option');
  option.value = symptom;
  symptomList.appendChild(option);

  // Dropdown checkbox
  const label = document.createElement('label');
  label.innerHTML = `<input type="checkbox" value="${symptom}"> ${cleanLabel}`;
  dropdown.appendChild(label);
});

// --- Tag input logic ---
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = input.value.trim();
    if (val && allSymptoms.includes(val) && !selectedSymptoms.has(val)) {
      selectedSymptoms.add(val);
      addTag(val);
    }
    input.value = '';
  }
});

function addTag(symptom) {
  const tag = document.createElement('div');
  tag.classList.add('tag');
  tag.textContent = symptom.replace(/_/g, ' ');

  const removeBtn = document.createElement('button');
  removeBtn.innerHTML = '×';
  removeBtn.onclick = () => {
    selectedSymptoms.delete(symptom);
    tag.remove();
  };

  tag.appendChild(removeBtn);
  tagContainer.appendChild(tag);
}

// --- Submit form ---
document.getElementById("symptomForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const dropdownSelected = Array.from(dropdown.querySelectorAll("input[type='checkbox']:checked"))
    .map(cb => cb.value);
  dropdownSelected.forEach(s => selectedSymptoms.add(s));

  if (selectedSymptoms.size === 0) {
    showResult("Please select or enter at least one symptom.");
    return;
  }

  secureFetch("/api/symptom-check/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms: [...selectedSymptoms] })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        showResult(data.error);
        return;
      }

      showResult(`🔎 Predicted Disease: ${data.predicted_disease}`);
      showDoctors(data.recommended_doctors || []);
    })
    .catch(err => {
      console.error(err);
      showResult("Something went wrong. Try again later.");
    });
});

// --- Result display helpers ---
function showResult(msg) {
  const resultBox = document.getElementById("result");
  resultBox.textContent = msg;
  resultBox.style.display = "block";
}

function showDoctors(doctors) {
  const div = document.getElementById("doctor-suggestions");
  const list = document.getElementById("doctor-list");

  list.innerHTML = "";
  div.style.display = doctors.length > 0 ? "block" : "none";

  doctors.forEach(specialization => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#" class="specialization-link">${specialization}</a>`;
    li.addEventListener("click", () => {
      fetchDoctorsBySpecialization(specialization);
    });
    list.appendChild(li);
  });
}

function fetchDoctorsBySpecialization(specialization) {
  secureFetch(`/api/doctors/by-specialization/?specialization=${encodeURIComponent(specialization)}`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => res.json())
    .then(data => {
      const doctors = data.results || [];
      const modal = document.getElementById("doctorModal");
      const list = document.getElementById("doctorListBySpecialization");
      list.innerHTML = "";

      if (doctors.length === 0) {
        list.innerHTML = "<li>No doctors available</li>";
      } else {
        doctors.forEach(doc => {
          const li = document.createElement("li");
          li.textContent = `${doc.first_name} ${doc.last_name} (${doc.specialization})`;
          li.addEventListener("click", () => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const redirectUrl = `patient-appointments.html?doctorId=${doc.id}&doctorName=${encodeURIComponent(doc.first_name + ' ' + doc.last_name)}&specialty=${encodeURIComponent(doc.specialization)}&patientId=${user.id}`;
            window.location.href = redirectUrl;
          });
          list.appendChild(li);
        });
      }

      modal.style.display = "flex";
    })
    .catch(() => alert("Failed to fetch doctors."));
}

document.getElementById("closeDoctorModal").addEventListener("click", () => {
  document.getElementById("doctorModal").style.display = "none";
});

