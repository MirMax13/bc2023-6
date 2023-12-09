const express = require('express');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

const User = require('./userModel');
const Device = require('./deviceModel');

const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'uploads/'); // Папка для зберігання завантажених файлів
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); // Ім'я файлу з унікальним таймстемпом
    },
  });

  const imageFilter = (req, file, callback) => {
    // Перевірка, чи файл є файлом зображення
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
    } else {
      callback('Only image files are allowed!', false);
    }
  };
  
const upload = multer({ storage, fileFilter: imageFilter });
const router = express.Router();

router.use(bodyParser.json());

router.post('/device', upload.single('photo'), async (req, res) => {
  try {
    if(req.body){
      const { deviceName, description, serialNumber, manufacturer } = req.body;
      if (req.file) {
        const {mimetype } = req.file;

        const fileData = fs.readFileSync(req.file.path);
        const device = new Device({
          deviceName: deviceName,
          description:description,
          serialNumber:serialNumber,
          manufacturer:manufacturer,
          data: fileData,
          contentType: mimetype,
        });
        await device.save();

        // Видалити тимчасовий файл
        fs.unlinkSync(req.file.path);

        res.status(201).send('File successfully uploaded and saved to the database.');
      } else {
        res.status(400).send('Error: File was not uploaded.');
      }
    }else {
      res.status(400).send('Error: Body was not recieved.');
    }
  } catch (error) {
    fs.unlinkSync(req.file.path);
    res.status(500).send('Error saving file to the database.');
  }
});

router.put('/device/:id', upload.single('photo'), async (req, res) => {
  try {
    const { deviceName, description, serialNumber, manufacturer} = req.body;
    const devicePhoto = req.file !== undefined ? req.file.filename : undefined;

    const updatedDevice = await Device.findByIdAndUpdate(req.params.id, {
    deviceName,
    description,
    serialNumber,
    manufacturer,
    devicePhoto,
    }, { new: true });

    if (!updatedDevice) {
    return res.status(404).send('Device not found');
    }

    res.send('Device updated successfully!');
  } catch (error) {
    console.error('Error editing device:', error);
    res.status(500).send('Internal Server Error');
  }
});

// DELETE метод для видалення пристрою за id
router.delete('/device/:id', async (req, res) => {
    try {
      const deletedDevice = await Device.findByIdAndDelete(req.params.id);
  
      if (!deletedDevice) {
        return res.status(404).send('Device not found');
      }
  
      res.send('Device deleted successfully!');
    } catch (error) {
      console.error('Error deleting device:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.get('/device/:Id', async (req, res) => {
    try {
      const id = req.params.Id;
      // Пошук пристроя за його ідентифікатором
      const device = await Device.findById(id);
  
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const { data,contentType,__v, ...deviceInfo } = device.toJSON();
      // Відправка інформації про пристрій
      res.json(deviceInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  router.get('/device-photo/:Id', async (req, res) => {
    try {
      const Id = req.params.Id;
      // Пошук пристроя за його ідентифікатором
      const device = await Device.findById(Id);
  
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
  
      // Відправка інформації про пристрій та фото клієнту
      res.setHeader('Content-Type', device.contentType);
      res.send(device.data);
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/devices', async (req, res) => {
    try {
      const device = await Device.find();
  
      const devices = device.map(device => {
      return {
        _id: device._id,
        deviceName: device.deviceName,
        serialNumber: device.serialNumber,
        manufacturer: device.manufacturer,
        status: device.status,
        description: device.description,
      };
    });

    res.json(devices);
  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).send('Internal Server Error');
  }
  });

// POST метод для реєстрації користувача
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
    });

    req.session.userId = newUser._id; // Зберігання ідентифікатора користувача у сесії

    res.status(201).send('User registered successfully!');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST метод для авторизації користувача
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid username or password');
    }

    req.session.username = user.username; // Зберігання імені користувача у сесії 
    req.session.userId = user._id;
    
    res.send('User logged in successfully!');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

  router.put('/takeReturnDevice/:Id', async (req, res) => {
    try {
      const { action } = req.body; // Додайте поле "action" у вашому запиті (може бути "take" або "return")
  
      // Перевірка, чи користувач авторизований
      if (!req.session.username) {
        return res.status(401).send('Unauthorized: User is not logged in');
      }

      // Знайдіть пристрій за ідентифікатором
      const device = await Device.findById(req.params.Id);
  
      if (!device) {
        return res.status(404).send('Device not found');
      }
  
      // Перевірте дію та оновіть статус пристрою
      if (action === 'take') {
        if (device.status === 'Available') {
          device.status = req.session.username; // Зберігайте ідентифікатор користувача в полі "status"
        } else {
          return res.status(400).send('Device is already taken');
        }
      } else if (action === 'return') {
        if (device.status === req.session.username) {
          device.status = 'Available';
        } else {
          return res.status(400).send('You cannot return a device you did not take');
        }
      } else {
        return res.status(400).send('Invalid action');
      }
  
      // Зберігайте оновлений пристрій
      const updatedDevice = await device.save();
  
      res.send('Device status updated successfully!');
    } catch (error) {
      console.error('Error updating device status:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  

module.exports = router;