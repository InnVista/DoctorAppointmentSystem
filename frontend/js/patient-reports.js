const mockReports = [
    { id: 1, name: "Blood Test - Jan 2024.pdf", date: "2024-01-12" },
    { id: 2, name: "MRI Scan - Feb 2024.pdf", date: "2024-02-22" },
  ];
  
  const reportGrid = document.getElementById("reportGrid");
  const uploadBtn = document.getElementById("uploadBtn");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const analysisOutput = document.getElementById("analysisOutput");
  
  function renderReports() {
    // Clear existing reports
    reportGrid.innerHTML = "";
  
    
    mockReports.forEach((report) => {
      const reportCard = document.createElement("div");
      reportCard.classList.add("report-card");
  
      const reportTitle = document.createElement("h3");
      reportTitle.textContent = report.name;
  
      const reportDescription = document.createElement("p");
      reportDescription.textContent = `Uploaded on: ${report.date}`;
  
      const viewReportBtn = document.createElement("button");
      viewReportBtn.textContent = "View Report";
      viewReportBtn.classList.add("view-report");
  
      
      reportCard.appendChild(reportTitle);
      reportCard.appendChild(reportDescription);
      reportCard.appendChild(viewReportBtn);
  
      
      reportGrid.appendChild(reportCard);
    });
  }
  
  uploadBtn.addEventListener("click", () => {
    const fileInput = document.getElementById("reportUpload");
    const file = fileInput.files[0];
  
    if (file) {
      const today = new Date().toISOString().split("T")[0];
      mockReports.unshift({ id: Date.now(), name: file.name, date: today });
  
      renderReports();
      Notifier.success("Report uploaded successfully.");
      fileInput.value = ""; // Clear the file input
    } else {
      Notifier.error("Please select a file.");
    }
  });
  
  analyzeBtn.addEventListener("click", () => {
    if (mockReports.length === 0) {
      analysisOutput.textContent = "No reports available for analysis.";
      analysisOutput.style.display = "block"; // Ensure it's visible
      return;
    }
  
    const latestReport = mockReports[0];
    analysisOutput.innerHTML = `
      <strong>Analysis for:</strong> ${latestReport.name}<br/>
      <em>Mock Result:</em> All parameters within normal range. Follow-up in 6 months.
    `;
    analysisOutput.style.display = "block"; // Show the analysis output
  });
  
  renderReports();
  const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});