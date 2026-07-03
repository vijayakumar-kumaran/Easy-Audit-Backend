const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easy_audit';

// Configure Mongoose global serialization to map _id to id
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : '';
    return ret;
  }
});
mongoose.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : '';
    return ret;
  }
});

// Import models
const {
  User,
  BusinessSignup,
  Customer,
  BusinessTaxAssessment,
  CustomerTaxAssessment,
  BusinessITNotice,
  CustomerITNotice,
  BusinessAssessmentType,
  BusinessNoticeType,
  IndividualNoticeType
} = require('./models');

// Configure CORS
app.use(cors({
  origin: [
    'http://localhost:5173',          // Vite local
    'https://easyaudit.onrender.com'  // Production frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB Connected to:', mongoUri);
    seedDatabase();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Configure session store using connect-mongo
app.use(session({
  secret: process.env.SESSION_SECRET || 'easy_audit_session_secret_key_12345',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: mongoUri,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: false, // Set to true if using https
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // 10 MB size limit
  }
});

// Helper: Seed reference dropdown tables if empty
async function seedDatabase() {
  try {
    // 1. Seed Business Assessment Types
    const busAssTypeCount = await BusinessAssessmentType.countDocuments();
    if (busAssTypeCount === 0) {
      const defaultBusTypes = [
        { item_id: 1, bassessmentvalues: 'Proprietorship' },
        { item_id: 2, bassessmentvalues: 'Partnership Firm' },
        { item_id: 3, bassessmentvalues: 'Private Limited Company' },
        { item_id: 4, bassessmentvalues: 'Public Limited Company' },
        { item_id: 5, bassessmentvalues: 'LLP' },
        { item_id: 6, bassessmentvalues: 'Trust / Society' }
      ];
      await BusinessAssessmentType.insertMany(defaultBusTypes);
      console.log('Seeded Business Assessment Types.');
    }

    // 2. Seed Business Notice Types
    const busNoticeCount = await BusinessNoticeType.countDocuments();
    if (busNoticeCount === 0) {
      const defaultBusNotices = [
        { item_id: 1, noticetype: '143(2)', noticedescription: 'Scrutiny Assessment Notice' },
        { item_id: 2, noticetype: '142(1)', noticedescription: 'Inquiry before assessment / document production' },
        { item_id: 3, noticetype: '148', noticedescription: 'Income escaping assessment' },
        { item_id: 4, noticetype: '156', noticedescription: 'Notice of demand for business tax dues' }
      ];
      await BusinessNoticeType.insertMany(defaultBusNotices);
      console.log('Seeded Business Notice Types.');
    }

    // 3. Seed Individual Notice Types
    const indNoticeCount = await IndividualNoticeType.countDocuments();
    if (indNoticeCount === 0) {
      const defaultIndNotices = [
        { item_id: 1, noticetype: '143(2)', noticedescription: 'Scrutiny Assessment Notice' },
        { item_id: 2, noticetype: '142(1)', noticedescription: 'Inquiry before assessment / document production' },
        { item_id: 3, noticetype: '148', noticedescription: 'Income escaping assessment' },
        { item_id: 4, noticetype: '156', noticedescription: 'Notice of demand for individual tax dues' }
      ];
      await IndividualNoticeType.insertMany(defaultIndNotices);
      console.log('Seeded Individual Notice Types.');
    }

    // 4. Seed a default admin and audit user if User collection is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const adminPass = await bcrypt.hash('admin123', 10);
      const auditPass = await bcrypt.hash('audit123', 10);
      await User.insertMany([
        { username: 'admin', password: adminPass, usertype: 'admin' },
        { username: 'audit1', password: auditPass, usertype: 'audituser' }
      ]);
      console.log('Seeded default users: admin/admin123 and audit1/audit123.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// ==========================================
// USER AUTHENTICATION ROUTES
// ==========================================

// User signup
app.post('/signup', async (req, res) => {
  const { username, password, usertype } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, usertype });
    await user.save();
    res.status(201).send('User registered');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// User login
app.post('/login', async (req, res) => {

  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.user = { username, usertype: user.usertype, avatar: user.avatar };
        res.json({
          success: true,
          usertype: user.usertype,
          username: user.username,
          avatar: user.avatar
        });

      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// User logout
app.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Unable to log out');
      }
      res.clearCookie('connect.sid', { path: '/' });
      res.setHeader('Cache-Control', 'no-store');
      res.send('Logout successful');
    });
  } else {
    res.status(400).send('Not logged in');
  }
});

// Fetch audit users
app.get('/audit-users', async (req, res) => {
  try {
    const results = await User.find({ usertype: 'audituser' }, 'username');
    res.json(results.map(u => u.username));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching audit users' });
  }
});

// Fetch admin users
app.get('/admin-users', async (req, res) => {
  try {
    const results = await User.find({ usertype: 'admin' }, 'username');
    res.json(results.map(u => u.username));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching admin users' });
  }
});


// ==========================================
// BUSINESS ROUTES
// ==========================================

// Get business assessment types
app.get('/business-assessment-types', async (req, res) => {
  try {
    const results = await BusinessAssessmentType.find({}).sort({ item_id: 1 });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Register Business Client
app.post('/business-signup', upload.fields([
  { name: 'panCardFile', maxCount: 1 },
  { name: 'gstinfile', maxCount: 1 },
  { name: 'gstinFile', maxCount: 1 },
  { name: 'otherDocumentFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files || {};
    const panCardFile = files['panCardFile'] ? files['panCardFile'][0].filename : null;
    const gstinFile = (files['gstinfile'] && files['gstinfile'][0].filename) ||
                      (files['gstinFile'] && files['gstinFile'][0].filename) ||
                      null;
    const otherDocumentFile = files['otherDocumentFile'] ? files['otherDocumentFile'][0].filename : null;

    const business = new BusinessSignup({
      ...req.body,
      panCardFile,
      gstinFile,
      otherDocumentFile
    });

    await business.save();
    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Error inserting business:', err);
    res.status(500).send('Error registering user');
  }
});

// Fetch Business list
app.get('/business_list', async (req, res) => {
  try {
    const results = await BusinessSignup.find({}, 'businessName businessOwnerName contactPhoneNumber avatar');
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching business');
  }
});

// Fetch Business details by ID
app.get('/business_list/:id', async (req, res) => {
  try {
    const result = await BusinessSignup.findById(req.params.id);
    if (!result) {
      return res.status(404).send('business not found');
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching business details');
  }
});

// Update business details by ID
app.put('/business_list/:id', upload.fields([
  { name: 'panCardFile', maxCount: 1 },
  { name: 'gstinfile', maxCount: 1 },
  { name: 'gstinFile', maxCount: 1 },
  { name: 'gtsinfile', maxCount: 1 },
  { name: 'otherDocumentFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files || {};
    const updateData = { ...req.body };

    if (files['panCardFile']) updateData.panCardFile = files['panCardFile'][0].filename;
    const gstinFile = (files['gstinfile'] && files['gstinfile'][0].filename) ||
                      (files['gstinFile'] && files['gstinFile'][0].filename) ||
                      (files['gtsinfile'] && files['gtsinfile'][0].filename) ||
                      null;
    if (gstinFile) updateData.gstinFile = gstinFile;
    if (files['otherDocumentFile']) updateData.otherDocumentFile = files['otherDocumentFile'][0].filename;

    const result = await BusinessSignup.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!result) {
      return res.status(404).send('business not found');
    }
    res.status(200).send('Business details updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating Business details');
  }
});

// Delete business by ID
app.delete('/business_list/:id', async (req, res) => {
  try {
    const result = await BusinessSignup.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send('business not found');
    }
    res.status(200).send('business deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting business');
  }
});

// Create Business Tax Assessment
app.post('/business-tax-assessments', upload.single('document'), async (req, res) => {
  try {
    const document = req.file ? req.file.filename : null;
    const assessment = new BusinessTaxAssessment({
      ...req.body,
      document
    });
    await assessment.save();
    res.status(201).send('Tax assessment created successfully');
  } catch (err) {
    console.error('Error creating business tax assessment:', err);
    res.status(500).send('Error creating tax assessment');
  }
});

// Fetch all business tax assessments
app.get('/list-of-tax-assessments-all', async (req, res) => {
  try {
    const results = await BusinessTaxAssessment.find({});
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching tax assessments');
  }
});

// Fetch audit user business tax assessments
app.get('/list-of-tax-assessments', async (req, res) => {
  try {
    const { username } = req.query;
    const results = await BusinessTaxAssessment.find({ assignedTo: username });
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching tax assessments');
  }
});

// Fetch single business tax assessment by ID
app.get('/update-tax-assessments/:id', async (req, res) => {
  try {
    const result = await BusinessTaxAssessment.findById(req.params.id);
    if (!result) {
      return res.status(404).send('Tax assessment not found');
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching tax assessment');
  }
});

// Update a business tax assessment by ID
app.put('/updated-tax-assessments/:id', upload.single('document'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.document = req.file.filename;
    }
    const result = await BusinessTaxAssessment.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!result) {
      return res.status(404).send('Tax assessment not found');
    }
    res.status(200).send('Tax assessment updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating tax assessment');
  }
});

// Fetch business notice types
app.get('/bus-notice-types', async (req, res) => {
  try {
    const results = await BusinessNoticeType.find({}).sort({ item_id: 1 });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Create business IT Notice
app.post('/bus-it-notices', upload.single('document'), async (req, res) => {
  try {
    const document = req.file ? req.file.filename : null;
    const notice = new BusinessITNotice({
      ...req.body,
      document,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
    });
    await notice.save();
    res.status(201).send('IT notice created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating IT notice', error: err.message });
  }
});

// Fetch all business IT notices
app.get('/bus-it-notices-all', async (req, res) => {
  try {
    const results = await BusinessITNotice.find({});
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Fetch business IT notices for assigned user
app.get('/bus-it-notices', async (req, res) => {
  try {
    const { username } = req.query;
    const results = await BusinessITNotice.find({ assignedTo: username });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Fetch single business IT notice by ID
app.get('/bus-it-notice/:id', async (req, res) => {
  try {
    const result = await BusinessITNotice.findById(req.params.id);
    if (!result) {
      return res.status(404).send('Notice not found');
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching Notice');
  }
});

// Update business IT notice by ID
app.put('/business-it-notices/:id', upload.single('document'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.document = req.file.filename;
    }
    if (req.body.dueDate) {
      updateData.dueDate = new Date(req.body.dueDate);
    }
    const result = await BusinessITNotice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!result) {
      return res.status(404).send('Notice not found');
    }
    res.status(200).send('IT notice updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating IT notice');
  }
});


// ==========================================
// CUSTOMER ROUTES
// ==========================================

// Register Customer Client
app.post('/customer-signup', upload.fields([
  { name: 'panCardFile', maxCount: 1 },
  { name: 'adharCardFile', maxCount: 1 },
  { name: 'otherDocumentFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files || {};
    const panCardFile = files['panCardFile'] ? files['panCardFile'][0].filename : null;
    const adharCardFile = files['adharCardFile'] ? files['adharCardFile'][0].filename : null;
    const otherDocumentFile = files['otherDocumentFile'] ? files['otherDocumentFile'][0].filename : null;

    const customer = new Customer({
      ...req.body,
      panCardFile,
      adharCardFile,
      otherDocumentFile
    });

    await customer.save();
    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Error inserting customer:', err);
    res.status(500).send('Error registering user');
  }
});

// Create Customer Tax Assessment
app.post('/customer-tax-assessments', upload.single('document'), async (req, res) => {
  try {
    const document = req.file ? req.file.filename : null;
    const assessment = new CustomerTaxAssessment({
      ...req.body,
      document
    });
    await assessment.save();
    res.send('Tax assessment created successfully');
  } catch (err) {
    console.error('Error creating customer tax assessment:', err);
    res.status(500).send('Error creating tax assessment');
  }
});

// Fetch all customer tax assessments
app.get('/customer-tax-assessments-all', async (req, res) => {
  try {
    const results = await CustomerTaxAssessment.find({});
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tax assessments' });
  }
});

// Fetch customer tax assessments by assignee
app.get('/customer-tax-assessments', async (req, res) => {
  try {
    const { username } = req.query;
    const results = await CustomerTaxAssessment.find({ assignedTo: username });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tax assessments' });
  }
});

// Fetch single customer tax assessment by ID
app.get('/customer-tax-assessments/:id', async (req, res) => {
  try {
    const result = await CustomerTaxAssessment.findById(req.params.id);
    if (!result) {
      return res.status(404).send('Tax assessment not found');
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching tax assessment');
  }
});

// Update customer tax assessment by ID
app.put('/customer-tax-assessments/:id', upload.single('document'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.document = req.file.filename;
    }
    const result = await CustomerTaxAssessment.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!result) {
      return res.status(404).send('Tax assessment not found');
    }
    res.status(200).send('Tax assessment updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating tax assessment');
  }
});

// Fetch all customers
app.get('/customers', async (req, res) => {
  try {
    const results = await Customer.find({}, 'assesseefirstName assesseelastName phoneNumber avatar');
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching customers');
  }
});

// Fetch customer details by ID
app.get('/customers/:id', async (req, res) => {
  try {
    const result = await Customer.findById(req.params.id);
    if (!result) {
      return res.status(404).send('Customer not found');
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching customer details');
  }
});

// Update customer details by ID
app.put('/customers/:id', upload.fields([
  { name: 'panCardFile', maxCount: 1 },
  { name: 'adharCardFile', maxCount: 1 },
  { name: 'otherDocumentFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files || {};
    const updateData = { ...req.body };

    if (files['panCardFile']) updateData.panCardFile = files['panCardFile'][0].filename;
    if (files['adharCardFile']) updateData.adharCardFile = files['adharCardFile'][0].filename;
    if (files['otherDocumentFile']) updateData.otherDocumentFile = files['otherDocumentFile'][0].filename;

    const result = await Customer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!result) {
      return res.status(404).send('Customer not found');
    }
    res.status(200).send('Customer details updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating customer details');
  }
});

// Delete customer by ID
app.delete('/customers/:id', async (req, res) => {
  try {
    const result = await Customer.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send('Customer not found');
    }
    res.status(200).send('Customer deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting customer');
  }
});

// Get individual notice types
app.get('/notice-types', async (req, res) => {
  try {
    const results = await IndividualNoticeType.find({}).sort({ item_id: 1 });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Create customer IT notice
app.post('/customer-it-notices', upload.single('document'), async (req, res) => {
  try {
    const document = req.file ? req.file.filename : null;
    const notice = new CustomerITNotice({
      ...req.body,
      document,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
    });
    await notice.save();
    res.status(201).send('IT notice created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating IT notice', error: err.message });
  }
});

// Fetch all customer IT notices
app.get('/it-notices-all', async (req, res) => {
  try {
    const results = await CustomerITNotice.find({});
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching it notices' });
  }
});

// Fetch customer IT notices by assignee
app.get('/it-notices', async (req, res) => {
  try {
    const { username } = req.query;
    const results = await CustomerITNotice.find({ assignedTo: username });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching it notices' });
  }
});

// Fetch single customer IT notice by ID
app.get('/customer-it-notices/:id', async (req, res) => {
  try {
    const result = await CustomerITNotice.findById(req.params.id);
    if (!result) {
      return res.status(404).send('Notice not found');
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching Notice');
  }
});

// Update customer IT notice by ID
app.put('/customer-it-notices/:id', upload.single('document'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.document = req.file.filename;
    }
    if (req.body.dob) {
      updateData.dob = req.body.dob;
    }
    if (req.body.dueDate) {
      updateData.dueDate = new Date(req.body.dueDate);
    }

    const result = await CustomerITNotice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!result) {
      return res.status(404).send('Notice not found');
    }
    res.status(200).send('IT notice updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating IT notice');
  }
});


// ==========================================
// GLOBAL ERROR HANDLER & STARTUP
// ==========================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Consolidated EasyAudit Server running on port ${port}`);
});
