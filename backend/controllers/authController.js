const User = require('../models/User');
const bcrypt = require('bcrypt');
const Customer = require('../models/Customer');
const BusinessSignup = require('../models/BusinessSignup');
const CustomerTaxAssessment = require('../models/CustomerTaxAssessment');
const BusinessTaxAssessment = require('../models/BusinessTaxAssessment');
const CustomerITNotice = require('../models/CustomerITNotice');
const BusinessITNotice = require('../models/BusinessITNotice');

exports.signup = async (req, res) => {
  try {
    const { username, password, usertype } = req.body;
    if (!username || !password || !usertype) {
      return res.status(400).json({ error: 'Please provide username, password and usertype' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      usertype
    });

    await user.save();
    res.status(201).send('User registered');
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please provide username and password' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.warn('User not found:', username);
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Support both bcrypt hashed password and plain password comparison for backwards compatibility (in case of unhashed seeds)
    let isMatch = false;
    if (user.password.startsWith('$2b$') || user.password.length > 20) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      console.warn('Invalid password attempt for user:', username);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    req.session.user = { username, usertype: user.usertype };
    res.json({ success: true, usertype: user.usertype });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

exports.logout = (req, res) => {
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
};

exports.getAuditUsers = async (req, res) => {
  try {
    const results = await User.find({ usertype: 'audituser' }).select('username -_id');
    res.json(results.map(user => user.username));
  } catch (error) {
    console.error('Fetch audit users error:', error);
    res.status(500).json({ error: 'Error fetching audit users' });
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const results = await User.find({ usertype: 'admin' }).select('username -_id');
    res.json(results.map(user => user.username));
  } catch (error) {
    console.error('Fetch admin users error:', error);
    res.status(500).json({ error: 'Error fetching admin users' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalBusinesses = await BusinessSignup.countDocuments();

    const cTaxes = await CustomerTaxAssessment.find({});
    const bTaxes = await BusinessTaxAssessment.find({});
    const allTaxes = [...cTaxes, ...bTaxes];

    const taxStats = {
      pending: allTaxes.filter(t => t.status === 'Pending' || t.status === 'pending').length,
      inProgress: allTaxes.filter(t => t.status === 'In Progress' || t.status === 'In-Progress' || t.status === 'in progress').length,
      completed: allTaxes.filter(t => t.status === 'Completed' || t.status === 'completed').length,
      total: allTaxes.length
    };

    const cNotices = await CustomerITNotice.find({});
    const bNotices = await BusinessITNotice.find({});
    const allNotices = [...cNotices, ...bNotices];

    const noticeStats = {
      pending: allNotices.filter(n => n.status === 'Pending' || n.status === 'pending').length,
      inProgress: allNotices.filter(n => n.status === 'In Progress' || n.status === 'In-Progress' || n.status === 'in progress').length,
      completed: allNotices.filter(n => n.status === 'Completed' || n.status === 'completed').length,
      total: allNotices.length
    };

    res.json({
      totalCustomers,
      totalBusinesses,
      taxStats,
      noticeStats
    });
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
};
