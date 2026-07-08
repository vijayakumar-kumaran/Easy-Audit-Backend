const Customer = require('../models/Customer');
const CustomerTaxAssessment = require('../models/CustomerTaxAssessment');
const CustomerITNotice = require('../models/CustomerITNotice');
const { IndividualNoticeType } = require('../models/DropdownTypes');
const { createLogAndNotify } = require('../config/transactionHelper');

// Signup customer (individual)
exports.customerSignup = async (req, res) => {
  try {
    const {
      assesseeType, assesseefirstName, assesseelastName, fatherHusbandName, maritialstatus,
      day, month, year, bankName, branchName, bankAccountNumber, ifscCode, panNumber,
      aadharNumber, contactPersonName, emailAddress, phoneNumber, streetAddress, city,
      state, postalCode, country, dscPassword
    } = req.body;

    const panCardFile = req.files && req.files['panCardFile'] ? req.files['panCardFile'][0].filename : null;
    const adharCardFile = req.files && req.files['adharCardFile'] ? req.files['adharCardFile'][0].filename : null;
    const otherDocumentFile = req.files && req.files['otherDocumentFile'] ? req.files['otherDocumentFile'][0].filename : null;

    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    const transactionId = require('../config/transactionHelper').generateTransactionId();

    const customer = new Customer({
      transactionId,
      assesseeType, assesseefirstName, assesseelastName, fatherHusbandName, maritialstatus,
      day, month, year, bankName, branchName, bankAccountNumber, ifscCode, panNumber,
      aadharNumber, contactPersonName, emailAddress, phoneNumber, streetAddress, city,
      state, postalCode, country, dscPassword, panCardFile, adharCardFile, otherDocumentFile
    });

    const saved = await customer.save();

    await createLogAndNotify({
      type: 'Client Register',
      category: 'Individual',
      clientName: `${assesseefirstName} ${assesseelastName}`,
      description: `Registered new individual client: ${assesseefirstName} ${assesseelastName}`,
      performedBy: user.username,
      role: user.usertype,
      referenceId: saved._id.toString(),
      recipient: 'admin',
      notifyTitle: 'New Client Registered',
      notifyMsg: `Admin ${user.username} registered individual client ${assesseefirstName} ${assesseelastName}.`,
      link: `/customer/${saved._id.toString()}`
    });

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Customer signup error:', error);
    res.status(500).send('Error registering user');
  }
};

// Fetch all customers
exports.getCustomers = async (req, res) => {
  try {
    const results = await Customer.find({});
    const mapped = results.map(c => ({
      id: c._id.toString(),
      assesseefirstName: c.assesseefirstName,
      assesseelastName: c.assesseelastName,
      phoneNumber: c.phoneNumber
    }));
    res.status(200).json(mapped);
  } catch (error) {
    console.error('Fetch customers error:', error);
    res.status(500).send('Error fetching customers');
  }
};

// Fetch customer details by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send('Customer not found');
    }
    const obj = customer.toObject();
    obj.id = customer._id.toString();
    res.status(200).json(obj);
  } catch (error) {
    console.error('Fetch customer by ID error:', error);
    res.status(500).send('Error fetching customer details');
  }
};

// Update customer details by ID
exports.updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const updateData = { ...req.body };

    if (req.files) {
      if (req.files['panCardFile']) {
        updateData.panCardFile = req.files['panCardFile'][0].filename;
      }
      if (req.files['adharCardFile']) {
        updateData.adharCardFile = req.files['adharCardFile'][0].filename;
      }
      if (req.files['otherDocumentFile']) {
        updateData.otherDocumentFile = req.files['otherDocumentFile'][0].filename;
      }
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(customerId, updateData, { new: true });
    if (!updatedCustomer) {
      return res.status(404).send('Customer not found');
    }

    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    const clientName = `${updatedCustomer.assesseefirstName} ${updatedCustomer.assesseelastName}`;

    await createLogAndNotify({
      type: 'Client Update',
      category: 'Individual',
      clientName: clientName,
      description: `Updated individual client profile: ${clientName}`,
      performedBy: user.username,
      role: user.usertype,
      referenceId: customerId
    });

    res.status(200).send('Customer details updated successfully');
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).send('Error updating customer details');
  }
};

// Delete customer by ID
exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).send('Customer not found');
    }

    const clientName = `${customer.assesseefirstName} ${customer.assesseelastName}`;
    await Customer.findByIdAndDelete(customerId);

    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    await createLogAndNotify({
      type: 'Client Delete',
      category: 'Individual',
      clientName: clientName,
      description: `Deleted individual client profile: ${clientName}`,
      performedBy: user.username,
      role: user.usertype,
      referenceId: customerId
    });

    res.status(200).send('Customer deleted successfully');
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).send('Error deleting customer');
  }
};

// Create customer tax assessment
exports.createTaxAssessment = async (req, res) => {
  try {
    const {
      customerId, assesseeType, assesseName, fatherName, dob, panNumber,
      adharNumber, phoneNumber, assessmentYear, notes, assignedTo, status
    } = req.body;
    const document = req.file ? req.file.filename : null;

    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    const transactionId = require('../config/transactionHelper').generateTransactionId();

    const taxAssessment = new CustomerTaxAssessment({
      customerId, transactionId, assesseeType, assesseName, fatherName, dob, panNumber,
      adharNumber, phoneNumber, assessmentYear, notes, document, assignedTo, status
    });

    const saved = await taxAssessment.save();

    // Log the transaction and notify assigned auditor
    await createLogAndNotify({
      type: 'Tax Created',
      category: 'Individual',
      clientName: assesseName,
      description: `Created tax assessment task for AY ${assessmentYear} and assigned to ${assignedTo || 'Unassigned'}`,
      performedBy: user.username,
      role: user.usertype,
      referenceId: saved._id.toString(),
      recipient: assignedTo,
      notifyTitle: 'New Tax Task Assigned',
      notifyMsg: `You have been assigned a new individual tax assessment for ${assesseName} (AY ${assessmentYear}).`,
      link: `/update-tax-assessment/${saved._id.toString()}`
    });

    res.send('Tax assessment created successfully');
  } catch (error) {
    console.error('Create tax assessment error:', error);
    res.status(500).send('Error creating tax assessment');
  }
};

// Fetch all customer tax assessments
exports.getAllTaxAssessments = async (req, res) => {
  try {
    const results = await CustomerTaxAssessment.find({});
    const mapped = results.map(ta => {
      const obj = ta.toObject();
      obj.id = ta._id.toString();
      return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error('Fetch all tax assessments error:', error);
    res.status(500).json({ error: 'Error fetching tax assessments' });
  }
};

// Fetch customer tax assessments assigned to specific username
exports.getAssignedTaxAssessments = async (req, res) => {
  try {
    const { username } = req.query;
    const results = await CustomerTaxAssessment.find({ assignedTo: username });
    const mapped = results.map(ta => {
      const obj = ta.toObject();
      obj.id = ta._id.toString();
      return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error('Fetch assigned tax assessments error:', error);
    res.status(500).json({ error: 'Error fetching tax assessments' });
  }
};

// Fetch a single customer tax assessment by ID
exports.getTaxAssessmentById = async (req, res) => {
  try {
    const assessment = await CustomerTaxAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).send('Tax assessment not found');
    }
    const obj = assessment.toObject();
    obj.id = assessment._id.toString();
    res.status(200).json(obj);
  } catch (error) {
    console.error('Fetch tax assessment by ID error:', error);
    res.status(500).send('Error fetching tax assessment');
  }
};

// Update a customer tax assessment by ID
exports.updateTaxAssessment = async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const updateData = { ...req.body };
    if (req.file) {
      updateData.document = req.file.filename;
    }

    const previousAssessment = await CustomerTaxAssessment.findById(assessmentId);
    if (!previousAssessment) {
      return res.status(404).send('Tax assessment not found');
    }

    const updated = await CustomerTaxAssessment.findByIdAndUpdate(assessmentId, updateData, { new: true });
    
    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    
    // Log the transaction
    let desc = `Updated tax assessment details for ${updated.assesseName}`;
    if (previousAssessment.status !== updated.status) {
      desc = `Changed tax assessment status from "${previousAssessment.status}" to "${updated.status}" for ${updated.assesseName}`;
    }

    await createLogAndNotify({
      type: 'Tax Updated',
      category: 'Individual',
      clientName: updated.assesseName,
      description: desc,
      performedBy: user.username,
      role: user.usertype,
      referenceId: assessmentId,
      // If auditor resolves or updates progress, notify admins and superusers
      recipient: user.usertype === 'audituser' ? 'admin' : (previousAssessment.assignedTo !== updated.assignedTo ? updated.assignedTo : ''),
      notifyTitle: user.usertype === 'audituser' ? 'Tax Status Updated' : 'Tax Task Assignment Updated',
      notifyMsg: user.usertype === 'audituser' 
        ? `Auditor ${user.username} updated status to "${updated.status}" for ${updated.assesseName}.`
        : `Admin ${user.username} reassigned tax task for ${updated.assesseName} to ${updated.assignedTo}.`,
      link: `/update-tax-assessment/${assessmentId}`
    });

    // Also send duplicate notifications to supervisors/superusers if status changes
    if (user.usertype === 'audituser' && previousAssessment.status !== updated.status) {
      const Notification = require('../models/Notification');
      const superuserNotification = new Notification({
        recipient: 'superuser',
        sender: user.username,
        title: 'Tax Status Updated (Supervisor Alert)',
        message: `Auditor ${user.username} updated tax task status to "${updated.status}" for ${updated.assesseName}.`,
        link: `/update-tax-assessment/${assessmentId}`
      });
      await superuserNotification.save();
    }

    res.status(200).send('Tax assessment updated successfully');
  } catch (error) {
    console.error('Update tax assessment error:', error);
    res.status(500).send('Error updating tax assessment');
  }
};

// Fetch individual notice types dropdown options
exports.getNoticeTypes = async (req, res) => {
  try {
    const results = await IndividualNoticeType.find({});
    res.json(results);
  } catch (error) {
    console.error('Fetch individual notice types error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
};

// Create customer IT notice
exports.createITNotice = async (req, res) => {
  try {
    const {
      customerId, assesseeType, assesseeName, fatherName, dob, panNumber,
      adharNumber, phoneNumber, noticeType, noticeDescription, dueDate, assignedTo, status, notes
    } = req.body;
    const document = req.file ? req.file.filename : null;

    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    const transactionId = require('../config/transactionHelper').generateTransactionId();

    const itNotice = new CustomerITNotice({
      customerId, transactionId, assesseeType, assesseeName, fatherName, dob, panNumber,
      adharNumber, phoneNumber, noticeType, noticeDescription, document,
      dueDate: dueDate ? new Date(dueDate) : null, assignedTo, status, notes
    });

    const saved = await itNotice.save();

    // Log the transaction and notify assigned auditor
    await createLogAndNotify({
      type: 'Notice Created',
      category: 'Individual',
      clientName: assesseeName,
      description: `Created IT notice task under ${noticeType} for ${assesseeName} and assigned to ${assignedTo || 'Unassigned'}`,
      performedBy: user.username,
      role: user.usertype,
      referenceId: saved._id.toString(),
      recipient: assignedTo,
      notifyTitle: 'New Notice Task Assigned',
      notifyMsg: `You have been assigned a new IT notice task for ${assesseeName} (${noticeType}).`,
      link: `/edit-it-notice/${saved._id.toString()}`
    });

    res.status(201).send('IT notice created successfully');
  } catch (error) {
    console.error('Create IT notice error:', error);
    res.status(500).json({ message: 'Error creating IT notice', error: error.message });
  }
};

// Fetch all customer IT notices
exports.getAllITNotices = async (req, res) => {
  try {
    const results = await CustomerITNotice.find({});
    const mapped = results.map(n => {
      const obj = n.toObject();
      obj.id = n._id.toString();
      return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error('Fetch all IT notices error:', error);
    res.status(500).json({ error: 'Error fetching it notices' });
  }
};

// Fetch customer IT notices assigned to a specific username
exports.getAssignedITNotices = async (req, res) => {
  try {
    const { username } = req.query;
    const results = await CustomerITNotice.find({ assignedTo: username });
    const mapped = results.map(n => {
      const obj = n.toObject();
      obj.id = n._id.toString();
      return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error('Fetch assigned IT notices error:', error);
    res.status(500).json({ error: 'Error fetching it notices' });
  }
};

// Fetch a single customer IT notice by ID
exports.getITNoticeById = async (req, res) => {
  try {
    const notice = await CustomerITNotice.findById(req.params.id);
    if (!notice) {
      return res.status(404).send('Notice not found');
    }
    const obj = notice.toObject();
    obj.id = notice._id.toString();
    res.status(200).json(obj);
  } catch (error) {
    console.error('Fetch IT notice by ID error:', error);
    res.status(500).send('Error fetching Notice');
  }
};

// Update a customer IT notice by ID
exports.updateITNotice = async (req, res) => {
  try {
    const noticeId = req.params.id;
    const updateData = { ...req.body };
    if (req.file) {
      updateData.document = req.file.filename;
    }
    if (updateData.dob) {
      updateData.dob = new Date(updateData.dob).toISOString().split('T')[0];
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate).toISOString().split('T')[0];
    }

    const previousNotice = await CustomerITNotice.findById(noticeId);
    if (!previousNotice) {
      return res.status(404).send('Notice not found');
    }

    const updated = await CustomerITNotice.findByIdAndUpdate(noticeId, updateData, { new: true });
    
    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    
    // Log the transaction
    let desc = `Updated IT notice details for ${updated.assesseeName}`;
    if (previousNotice.status !== updated.status) {
      desc = `Changed IT notice status from "${previousNotice.status}" to "${updated.status}" for ${updated.assesseeName}`;
    }

    await createLogAndNotify({
      type: 'Notice Updated',
      category: 'Individual',
      clientName: updated.assesseeName,
      description: desc,
      performedBy: user.username,
      role: user.usertype,
      referenceId: noticeId,
      recipient: user.usertype === 'audituser' ? 'admin' : (previousNotice.assignedTo !== updated.assignedTo ? updated.assignedTo : ''),
      notifyTitle: user.usertype === 'audituser' ? 'Notice Status Updated' : 'Notice Task Assignment Updated',
      notifyMsg: user.usertype === 'audituser' 
        ? `Auditor ${user.username} updated status to "${updated.status}" for ${updated.assesseeName}.`
        : `Admin ${user.username} reassigned notice task for ${updated.assesseeName} to ${updated.assignedTo}.`,
      link: `/edit-it-notice/${noticeId}`
    });

    // Notify supervisors too if status changes
    if (user.usertype === 'audituser' && previousNotice.status !== updated.status) {
      const Notification = require('../models/Notification');
      const superuserNotification = new Notification({
        recipient: 'superuser',
        sender: user.username,
        title: 'Notice Status Updated (Supervisor Alert)',
        message: `Auditor ${user.username} updated notice status to "${updated.status}" for ${updated.assesseeName}.`,
        link: `/edit-it-notice/${noticeId}`
      });
      await superuserNotification.save();
    }

    res.status(200).send('IT notice updated successfully');
  } catch (error) {
    console.error('Update IT notice error:', error);
    res.status(500).send('Error updating IT notice');
  }
};
