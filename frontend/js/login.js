document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission for now

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Log the values for debugging
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}`);

    // Redirect based on role
    let redirectUrl = '';
    if (role === 'admin') {
        redirectUrl = 'admin-dashboard.html';
    } else if (role === 'doctor') {
        redirectUrl = 'doctor-dashboard.html';
    } else if (role === 'patient') {
        redirectUrl = 'patient-dashboard.html';
    }

    if (redirectUrl) {
        window.location.href = redirectUrl; // Redirect to the corresponding dashboard
    } else {
        alert('Invalid role selection!');
    }

    // In real-world use, we would send these details to the backend for validation
    alert('Login details received! (Add backend integration later)');
});
