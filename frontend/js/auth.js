async function secureFetch(url, options = {}) {
  const accessToken = localStorage.getItem('accessToken');

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let response = await fetch(url, options);

  if (response.status === 401) {
    // Token might be expired → try refreshing
    const refreshResponse = await fetch('/api/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh: localStorage.getItem('refreshToken'),
      }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem('accessToken', data.access);

      // Retry original request with new token
      options.headers.Authorization = `Bearer ${data.access}`;
      response = await fetch(url, options);
    } else {
      // Refresh token expired or invalid
      alert('Session expired. Please login again.');
      localStorage.clear();
      window.location.href = '/pages/login.html';
    }
  }

  return response;
}

document.querySelectorAll('a[href$="login.html"]').forEach(btn => {
  btn.addEventListener('click', () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  });
});
