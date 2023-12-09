  async function fetchDevices() {
    try {
      const response = await fetch('/Devices');
      const devices = await response.json();

      const devicesList = document.getElementById('devices');

      // Очистіть попередні дані
      devicesList.innerHTML = '';

      // Додайте нові дані
      devices.forEach(device => {
        const listItem = document.createElement('li');

        // Створіть елементи для відображення даних пристрою
        const deviceId = document.createElement('strong');
        deviceId.textContent = `Device ID: ${device._id}`;

        const name = document.createElement('p');
        name.textContent = `Name: ${device.deviceName}`;

        const serialNumber = document.createElement('p');
        serialNumber.textContent = `Serial Number: ${device.serialNumber}`;

        const manufacturer = document.createElement('p');
        manufacturer.textContent = `Manufacturer: ${device.manufacturer}`;

        const status = document.createElement('p');
        status.textContent = `Status: ${device.status}`;

        const description = document.createElement('p');
        description.textContent = `Description: ${device.description}`;

        /*const image = document.createElement('img');
        // Перетворити Buffer на base64 рядок
        const base64Image = Buffer.from(device.devicePhoto.buffer).toString('base64');
        image.src = `data:image/png;base64,${base64Image}`*/

        // Додайте створені елементи до списку
        listItem.appendChild(deviceId);
        listItem.appendChild(name);
        listItem.appendChild(serialNumber);
        listItem.appendChild(manufacturer);
        listItem.appendChild(status);
        listItem.appendChild(description);
        //listItem.appendChild(image);

        // Додайте елемент списку до списку пристроїв
        devicesList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  }

  function showTab(tabName) {
      // Перемикання вкладок
      if (tabName === 'main') {
        window.location.href = '/'; 
      }
       else if (tabName === 'Device') {
        window.location.href = '/Device'; 
      } else if (tabName === 'Take Device') {
        window.location.href = '/Take-Device';
      } else if (tabName === 'Register') {
        window.location.href = '/Register'; 
      } else if (tabName === 'Login') {
        window.location.href = '/Login'; 
      } /*else if (tabName === 'searchByName') {
        window.location.href = '/search-by-name'; 
      }
      else if (tabName === 'searchByAttributes') {
        window.location.href = '/search-by-attributes'; 
      }
      else if (tabName === 'modGif') {
        if (!isAuthenticated){
          authenticateAndShowTab('modGif');
          return;
        }
        window.location.href = '/Modify-Gifs'; 
      }*/
    }