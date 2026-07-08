const BusinessSignup = require('../models/BusinessSignup');
const BusinessTaxAssessment = require('../models/BusinessTaxAssessment');
const BusinessITNotice = require('../models/BusinessITNotice');
const { BusinessAssessmentType, BusinessNoticeType } = require('../models/DropdownTypes');
const { createLogAndNotify } = require('../config/transactionHelper');

// Fetch Business Assessment Types dropdown
exports.getBusinessAssessmentTypes = async (req, res) => {
  try {
    const results = await BusinessAssessmentType.find({});
    res.json(results);
  } catch (error) {
    console.error('Fetch business assessment types error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
};

// Signup business
exports.businessSignup = async (req, res) => {
  try {
    const {
      assesseeType, businessName, businessOwnerName, typeOfBusiness, businessRegistrationNumber,
      panOfBusiness, gstin, signatoryAuthorityName, bankName, branchName, bankAccountNumber, ifscCode, streetAddress, city,
      state, postalCode, country, dscPassword, contactPhoneNumber, contactEmail, contactPersonName, notes
    } = req.body;

    const panCardFile = req.files && req.files['panCardFile'] ? req.files['panCardFile'][0].filename : null;
    const gstinFile = req.files && req.files['gstinFile'] ? req.files['gstinFile'][0].filename : null;
    const otherDocumentFile = req.files && req.files['otherDocumentFile'] ? req.files['otherDocumentFile'][0].filename : null;

    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    const transactionId = require('../config/transactionHelper').generateTransactionId();

    const business = new BusinessSignup({
      transactionId,
      assesseeType, businessName, businessOwnerName, typeOfBusiness, businessRegistrationNumber,
      panOfBusiness, gstin, signatoryAuthorityName, bankName, branchName, bankAccountNumber, ifscCode,
      streetAddress, city, state, postalCode, country, dscPassword, contactPhoneNumber, contactEmail, contactPersonName, 
      notes, panCardFile, gstinFile, otherDocumentFile
    });

    const saved = await business.save();

    await createLogAndNotify({
      type: 'Client Register',
      category: 'Business',
      clientName: businessName,
      description: `Registered new business client: ${businessName}`,
      performedBy: user.username,
      role: user.usertype,
      referenceId: saved._id.toString(),
      recipient: 'admin',
      notifyTitle: 'New Business Client Registered',
      notifyMsg: `Admin ${user.username} registered business client "${businessName}".`,
      link: `/business-Details/${saved._id.toString()}`
    });

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Business signup error:', error);
    res.status(500).send('Error registering user');
  }
};

// Fetch all businesses (id, name, owner, phone)
exports.getBusinesses = async (req, res) => {
  try {
    const results = await BusinessSignup.find({});
    const mapped = results.map(b => ({
      id: b._id.toString(),
      businessName: b.businessName,
      businessOwnerName: b.businessOwnerName,
      contactPhoneNumber: b.contactPhoneNumber
    }));
    res.status(200).json(mapped);
  } catch (error) {
    console.error('Fetch businesses error:', error);
    res.status(500).send('Error fetching business');
  }
};

// Fetch Business details by ID
exports.getBusinessById = async (req, res) => {
  try {
    const business = await BusinessSignup.findById(req.params.id);
    if (!business) {
      return res.status(404).send('business not found');
    }
    const obj = business.toObject();
    obj.id = business._id.toString();
    res.status(200).json(obj);
  } catch (error) {
    console.error('Fetch business by ID error:', error);
    res.status(500).send('Error fetching business details');
  }
};

// Update Business details by ID
exports.updateBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;
    const updateData = { ...req.body };

    if (req.files) {
      if (req.files['panCardFile']) {
        updateData.panCardFile = req.files['panCardFile'][0].filename;
      }
      if (req.files['gstinFile']) {
        updateData.gstinFile = req.files['gstinFile'][0].filename;
      }
      if (req.files['otherDocumentFile']) {
        updateData.otherDocumentFile = req.files['otherDocumentFile'][0].filename;
      }
    }

    const updated = await BusinessSignup.findByIdAndUpdate(businessId, updateData, { new: true });
    if (!updated) {
      return res.status(404).send('business not found');
    }

    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    await createLogAndNotify({
      type: 'Client Update',
      category: 'Business',
      clientName: updated.businessName,
      description: `Updated business client profile: ${updated.businessName}`,
      performedBy: user.username,
      role: user.usertype,
      referenceId: businessId
    });

    res.status(200).send('Business details updated successfully');
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).send('Error updating Business details');
  }
};

// Delete business by ID
exports.deleteBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;
    const business = await BusinessSignup.findById(businessId);
    if (!business) {
      return res.status(404).send('business not found');
    }

    const businessName = business.businessName;
    await BusinessSignup.findByIdAndDelete(businessId);

    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    await createLogAndNotify({
      type: 'Client Delete',
      category: 'Business',
      clientName: businessName,
      description: `Deleted business client profile: ${businessName}`,
      performedBy: user.username,
      role: user.usertype,
      referenceId: businessId
    });

    res.status(200).send('business deleted successfully');
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).send('Error deleting business');
  }
};

// Create business tax assessment
exports.createBusinessTaxAssessment = async (req, res) => {
  try {
    const {
      business_listID, assesseeType, businessName, businessOwnerName, typeOfBusiness, businessRegistrationNumber,
      panOfBusiness, gstin, contactPersonName, assessmentYear, notes, assignedTo, status
    } = req.body;
    const document = req.file ? req.file.filename : null;

    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    const transactionId = require('../config/transactionHelper').generateTransactionId();

    const taxAssessment = new BusinessTaxAssessment({
      business_listID, transactionId, assesseeType, businessName, businessOwnerName, typeOfBusiness, businessRegistrationNumber,
      panOfBusiness, gstin, contactPersonName, assessmentYear, notes, document, assignedTo, status
    });

    const saved = await taxAssessment.save();

    // Log the transaction and notify assigned auditor
    await createLogAndNotify({
      type: 'Tax Created',
      category: 'Business',
      clientName: businessName,
      description: `Created business tax assessment task for AY ${assessmentYear} and assigned to ${assignedTo || 'Unassigned'}`,
      performedBy: user.username,
      role: user.usertype,
      referenceId: saved._id.toString(),
      recipient: assignedTo,
      notifyTitle: 'New Business Tax Task Assigned',
      notifyMsg: `You have been assigned a new business tax assessment for "${businessName}" (AY ${assessmentYear}).`,
      link: `/update-bus-tax-assessment/${saved._id.toString()}`
    });

    res.send('Tax assessment created successfully');
  } catch (error) {
    console.error('Create business tax assessment error:', error);
    res.status(500).send('Error creating tax assessment');
  }
};

// Fetch all business tax assessments
exports.getAllBusinessTaxAssessments = async (req, res) => {
  try {
    const results = await BusinessTaxAssessment.find({});
    const mapped = results.map(ta => {
      const obj = ta.toObject();
      obj.id = ta._id.toString();
      return obj;
    });
    res.status(200).json(mapped);
  } catch (error) {
    console.error('Fetch all business tax assessments error:', error);
    res.status(500).send('Error fetching tax assessments');
  }
};

// Fetch assigned business tax assessments for username
exports.getAssignedBusinessTaxAssessments = async (req, res) => {
  try {
    const { username } = req.query;
    const results = await BusinessTaxAssessment.find({ assignedTo: username });
    const mapped = results.map(ta => {
      const obj = ta.toObject();
      obj.id = ta._id.toString();
      return obj;
    });
    res.status(200).json(mapped);
  } catch (error) {
    console.error('Fetch assigned business tax assessments error:', error);
    res.status(500).send('Error fetching tax assessments');
  }
};

// Fetch single business tax assessment by ID
exports.getBusinessTaxAssessmentById = async (req, res) => {
  try {
    const assessment = await BusinessTaxAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).send('Tax assessment not found');
    }
    const obj = assessment.toObject();
    obj.id = assessment._id.toString();
    res.status(200).json(obj);
  } catch (error) {
    console.error('Fetch business tax assessment by ID error:', error);
    res.status(500).send('Error fetching tax assessment');
  }
};

// Update business tax assessment by ID
exports.updateBusinessTaxAssessment = async (req, res) => {
  try {
    const bassessmentId = req.params.id;
    const updateData = { ...req.body };
    if (req.file) {
      updateData.document = req.file.filename;
    }

    const previousAssessment = await BusinessTaxAssessment.findById(bassessmentId);
    if (!previousAssessment) {
      return res.status(404).send('Tax assessment not found');
    }

    const updated = await BusinessTaxAssessment.findByIdAndUpdate(bassessmentId, updateData, { new: true });
    
    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    
    // Log the transaction
    let desc = `Updated business tax assessment details for ${updated.businessName}`;
    if (previousAssessment.status !== updated.status) {
      desc = `Changed business tax assessment status from "${previousAssessment.status}" to "${updated.status}" for ${updated.businessName}`;
    }

    await createLogAndNotify({
      type: 'Tax Updated',
      category: 'Business',
      clientName: updated.businessName,
      description: desc,
      performedBy: user.username,
      role: user.usertype,
      referenceId: bassessmentId,
      recipient: user.usertype === 'audituser' ? 'admin' : (previousAssessment.assignedTo !== updated.assignedTo ? updated.assignedTo : ''),
      notifyTitle: user.usertype === 'audituser' ? 'Business Tax Status Updated' : 'Business Tax Task Assignment Updated',
      notifyMsg: user.usertype === 'audituser' 
        ? `Auditor ${user.username} updated status to "${updated.status}" for business "${updated.businessName}".`
        : `Admin ${user.username} reassigned business tax task for "${updated.businessName}" to ${updated.assignedTo}.`,
      link: `/update-bus-tax-assessment/${bassessmentId}`
    });

    // Notify supervisors too if status changes
    if (user.usertype === 'audituser' && previousAssessment.status !== updated.status) {
      const Notification = require('../models/Notification');
      const superuserNotification = new Notification({
        recipient: 'superuser',
        sender: user.username,
        title: 'Business Tax Status Updated (Supervisor Alert)',
        message: `Auditor ${user.username} updated business tax task status to "${updated.status}" for ${updated.businessName}.`,
        link: `/update-bus-tax-assessment/${bassessmentId}`
      });
      await superuserNotification.save();
    }

    res.status(200).send('Tax assessment updated successfully');
  } catch (error) {
    console.error('Update business tax assessment error:', error);
    res.status(500).send('Error updating tax assessment');
  }
};

// Fetch business notice types dropdown
exports.getBusinessNoticeTypes = async (req, res) => {
  try {
    const results = await BusinessNoticeType.find({}).select('item_id noticetype noticedescription');
    res.json(results);
  } catch (error) {
    console.error('Fetch business notice types dropdown error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
};

// Create business IT notice
exports.createBusinessITNotice = async (req, res) => {
  try {
    const {
      businessID, assesseeType, businessName, businessOwnerName, typeOfBusiness, contactPersonName,
      noticeType, noticeDescription, dueDate, assignedTo, status, notes
    } = req.body;
    const document = req.file ? req.file.filename : null;

    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    const transactionId = require('../config/transactionHelper').generateTransactionId();

    const itNotice = new BusinessITNotice({
      businessID, transactionId, assesseeType, businessName, businessOwnerName, typeOfBusiness, contactPersonName,
      noticeType, noticeDescription, document,
      dueDate: dueDate ? new Date(dueDate) : null, assignedTo, status, notes
    });

    const saved = await itNotice.save();

    // Log the transaction and notify assigned auditor
    await createLogAndNotify({
      type: 'Notice Created',
      category: 'Business',
      clientName: businessName,
      description: `Created business IT notice task under ${noticeType} for ${businessName} and assigned to ${assignedTo || 'Unassigned'}`,
      performedBy: user.username,
      role: user.usertype,
      referenceId: saved._id.toString(),
      recipient: assignedTo,
      notifyTitle: 'New Business Notice Task Assigned',
      notifyMsg: `You have been assigned a new business IT notice task for "${businessName}" (${noticeType}).`,
      link: `/update-bus-it-notice/${saved._id.toString()}`
    });

    res.status(201).send('IT notice created successfully');
  } catch (error) {
    console.error('Create business IT notice error:', error);
    res.status(500).json({ message: 'Error creating IT notice', error: error.message });
  }
};

// Fetch all business IT notices
exports.getAllBusinessITNotices = async (req, res) => {
  try {
    const results = await BusinessITNotice.find({});
    const mapped = results.map(n => {
      const obj = n.toObject();
      obj.id = n._id.toString();
      return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error('Fetch all business IT notices error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};

// Fetch assigned business IT notices for username
exports.getAssignedBusinessITNotices = async (req, res) => {
  try {
    const { username } = req.query;
    const results = await BusinessITNotice.find({ assignedTo: username });
    const mapped = results.map(n => {
      const obj = n.toObject();
      obj.id = n._id.toString();
      return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error('Fetch assigned business IT notices error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};

// Fetch single business IT notice by ID
exports.getBusinessITNoticeById = async (req, res) => {
  try {
    const notice = await BusinessITNotice.findById(req.params.id);
    if (!notice) {
      return res.status(404).send('Notice not found');
    }
    const obj = notice.toObject();
    obj.id = notice._id.toString();
    res.status(200).json(obj);
  } catch (error) {
    console.error('Fetch business IT notice by ID error:', error);
    res.status(500).send('Error fetching Notice');
  }
};

// Update business IT notice by ID
exports.updateBusinessITNotice = async (req, res) => {
  try {
    const noticeId = req.params.id;
    const updateData = { ...req.body };
    if (req.file) {
      updateData.document = req.file.filename;
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate).toISOString().split('T')[0];
    }

    const previousNotice = await BusinessITNotice.findById(noticeId);
    if (!previousNotice) {
      return res.status(404).send('Notice not found');
    }

    const updated = await BusinessITNotice.findByIdAndUpdate(noticeId, updateData, { new: true });
    
    const user = req.session && req.session.user ? req.session.user : { username: 'System', usertype: 'admin' };
    
    // Log the transaction
    let desc = `Updated business IT notice details for ${updated.businessName}`;
    if (previousNotice.status !== updated.status) {
      desc = `Changed business IT notice status from "${previousNotice.status}" to "${updated.status}" for ${updated.businessName}`;
    }

    await createLogAndNotify({
      type: 'Notice Updated',
      category: 'Business',
      clientName: updated.businessName,
      description: desc,
      performedBy: user.username,
      role: user.usertype,
      referenceId: noticeId,
      recipient: user.usertype === 'audituser' ? 'admin' : (previousNotice.assignedTo !== updated.assignedTo ? updated.assignedTo : ''),
      notifyTitle: user.usertype === 'audituser' ? 'Business Notice Status Updated' : 'Business Notice Task Assignment Updated',
      notifyMsg: user.usertype === 'audituser' 
        ? `Auditor ${user.username} updated status to "${updated.status}" for business "${updated.businessName}".`
        : `Admin ${user.username} reassigned business notice task for "${updated.businessName}" to ${updated.assignedTo}.`,
      link: `/update-bus-it-notice/${noticeId}`
    });

    // Notify supervisors too if status changes
    if (user.usertype === 'audituser' && previousNotice.status !== updated.status) {
      const Notification = require('../models/Notification');
      const superuserNotification = new Notification({
        recipient: 'superuser',
        sender: user.username,
        title: 'Business Notice Status Updated (Supervisor Alert)',
        message: `Auditor ${user.username} updated business notice status to "${updated.status}" for ${updated.businessName}.`,
        link: `/update-bus-it-notice/${noticeId}`
      });
      await superuserNotification.save();
    }

    res.status(200).send('IT notice updated successfully');
  } catch (error) {
    console.error('Update business IT notice error:', error);
    res.status(500).send('Error updating IT notice');
  }
};
