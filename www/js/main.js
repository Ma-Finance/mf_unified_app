function service_runner () {
  const iframe = document.getElementById('webapp');
  const offlineDiv = document.getElementById('offline');
  const appContainer = document.getElementById('app-container');

  function checkConnection() {
    // Use Navigator.onLine + a quick HEAD request for reliability
    if (!navigator.onLine) return showOffline();

    fetch('https://v1.madhavfinance.com', { method: 'HEAD', mode: 'no-cors' })
      .then(() => showOnline())
      .catch(() => showOffline());
  }

  function showOnline() {
    offlineDiv.style.display = "none";
    // offlineDiv.classList.add('hidden');
    // appContainer.classList.remove('hidden');
    appContainer.style.display = "block";
    // window.location.reload();
  }

  function showOffline() {
    offlineDiv.style.display = "flex";
    // appContainer.classList.add('hidden');
    // offlineDiv.classList.remove('hidden');
    appContainer.style.display = "none";
  }

  // Initial check
  checkConnection();

  // Listen for native online/offline events
  window.addEventListener('online', checkConnection);
  window.addEventListener('offline', showOffline);

  // Periodic check (every 10 s) in case network recovers while app is backgrounded
  setInterval(checkConnection, 10000);
}

(function (){
  setTimeout(() => {
    document.getElementById('splash').style.display = 'none';
    service_runner();
  }, 1000);

  

})();
