const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const { BusinessAssessmentType, BusinessNoticeType, IndividualNoticeType } = require('./models/DropdownTypes');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easy_audit';

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // 1. Seed Users
    const supervisorExists = await User.findOne({ username: 'supervisor' });
    if (!supervisorExists) {
      console.log('Seeding supervisor user...');
      const supervisorPassword = await bcrypt.hash('superuser123', 10);
      await User.create({ username: 'supervisor', password: supervisorPassword, usertype: 'superuser' });
      console.log('Supervisor user seeded (supervisor/superuser123).');
    }

    const userCount = await User.countDocuments();
    if (userCount <= 1) { // If only supervisor exists or database is empty, seed others
      console.log('Seeding default users...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      const auditPassword = await bcrypt.hash('audituser123', 10);

      await User.create([
        { username: 'admin', password: adminPassword, usertype: 'admin' },
        { username: 'audit1', password: auditPassword, usertype: 'audituser' }
      ]);
      console.log('Default users seeded (admin/admin123, audit1/audituser123).');
    } else {
      console.log('Default users already exist, skipping default user seed.');
    }

    // 2. Seed Business Assessment Types
    const batCount = await BusinessAssessmentType.countDocuments();
    if (batCount === 0) {
      console.log('Seeding business assessment types...');
      await BusinessAssessmentType.create([
        { item_id: 1, bassessmentvalues: 'Tax Audit (Form 3CD)' },
        { item_id: 2, bassessmentvalues: 'GST Audit (Form 9C)' },
        { item_id: 3, bassessmentvalues: 'Statutory Audit (Companies Act)' },
        { item_id: 4, bassessmentvalues: 'Transfer Pricing Audit (Form 3CEB)' },
        { item_id: 5, bassessmentvalues: 'Internal Financial Control Audit' }
      ]);
      console.log('Business assessment types seeded.');
    } else {
      console.log('Business assessment types already exist.');
    }

    // 3. Seed Business Notice Types
    const bntCount = await BusinessNoticeType.countDocuments();
    if (bntCount === 0) {
      console.log('Seeding business notice types...');
      await BusinessNoticeType.create([
        { item_id: 1, noticetype: 'Section 143(2) - Scrutiny Assessment', noticedescription: 'Notice for detailed scrutiny of return' },
        { item_id: 2, noticetype: 'Section 148 - Income Escaping Assessment', noticedescription: 'Reassessment notice' },
        { item_id: 3, noticetype: 'Section 156 - Demand Notice', noticedescription: 'Demand notice for outstanding dues' },
        { item_id: 4, noticetype: 'Section 245 - Set Off of Refunds', noticedescription: 'Adjusting refund against outstanding tax' },
        { item_id: 5, noticetype: 'GST Section 73 - Show Cause Notice', noticedescription: 'GST notice for short payment of tax' }
      ]);
      console.log('Business notice types seeded.');
    } else {
      console.log('Business notice types already exist.');
    }

    // 4. Seed Individual Notice Types
    const intCount = await IndividualNoticeType.countDocuments();
    if (intCount === 0) {
      console.log('Seeding individual notice types...');
      await IndividualNoticeType.create([
        { item_id: 1, noticetype: 'Section 139(9) - Defective Return', noticedescription: 'Correction needed in submitted return' },
        { item_id: 2, noticetype: 'Section 142(1) - Inquiry Before Assessment', noticedescription: 'Request for document production or account details' },
        { item_id: 3, noticetype: 'Section 143(1) - Intimation Notice', noticedescription: 'Intimation of processing result' },
        { item_id: 4, noticetype: 'Section 143(2) - Scrutiny Assessment', noticedescription: 'Notice for scrutiny for individual assessee' },
        { item_id: 5, noticetype: 'Section 271(1)(c) - Penalty Notice', noticedescription: 'Notice for concealment of income' }
      ]);
      console.log('Individual notice types seeded.');
    } else {
      console.log('Individual notice types already exist.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
