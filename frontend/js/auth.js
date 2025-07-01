async function secureFetch(url, options = {}) {
  const accessToken = localStorage.getItem('accessToken');

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let response = await fetch(url, options);

  if (response.status === 401) {
    
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

      options.headers.Authorization = `Bearer ${data.access}`;
      response = await fetch(url, options);
    } else {
      
      Notifier.error('Session expired. Please login again.');
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
function showFlashMessage(message) {
  const flash = document.getElementById('flash-message');
  flash.textContent = message;
  flash.classList.remove('hidden');
  setTimeout(() => {
    flash.classList.add('hidden');
  }, 3000);
}

(function loadNotificationAssets() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../css/notification.css';
  document.head.appendChild(link);

  const link1 = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../../../css/notification.css';
  document.head.appendChild(link);

  if (!window.Notifier) {
    const script = document.createElement('script');
    script.src = 'notification.js';
    document.body.appendChild(script);
  }
  
  if (!window.Notifier) {
    const script = document.createElement('script');
    script.src = 'js/notification.js';
    document.body.appendChild(script);
  }
  if (!window.Notifier) {
    const script = document.createElement('script');
    script.src = '../js/notification.js';
    document.body.appendChild(script);
  }

  if (!window.Notifier) {
    const script = document.createElement('script');
    script.src = '../../js/notification.js';
    document.body.appendChild(script);
  }
  if (!window.Notifier) {
    const script = document.createElement('script');
    script.src = '../../../js/notification.js';
    document.body.appendChild(script);
  }
})();
