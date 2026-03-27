/**
 * Test script to verify internship posting and visibility
 */

const mongoose = require('mongoose');
const Company = require('./src/models/Company');
const Internship = require('./src/models/Internship');
require('dotenv').config();

const testInternshipFlow = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a test company
    let company = await Company.findOne({ email: 'test@company.com' });
    if (!company) {
      company = await Company.create({
        name: 'Test Company',
        industry: 'Technology',
        email: 'test@company.com',
        password: 'password123',
        location: 'Kuala Lumpur',
        contactPerson: 'HR Manager'
      });
      console.log('✅ Created test company:', company.name);
    } else {
      console.log('✅ Found test company:', company.name);
    }

    // Create a test internship with Published status
    const internship = await Internship.create({
      title: 'Software Engineering Intern',
      company: company._id,
      specialization: 'Computer Science',
      type: 'On-site',
      duration: '3 months',
      location: 'Kuala Lumpur',
      stipend: 'RM 1000/month',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      description: 'Great opportunity for students!',
      duties: ['Develop software', 'Write code'],
      requirements: ['Programming skills'],
      slots: 2,
      status: 'Published' // Explicitly set to Published
    });

    console.log('✅ Created internship:', internship.title);
    console.log('✅ Internship status:', internship.status);

    // Test the query used in getAllInternships
    const publishedInternships = await Internship.find({ status: "Published" })
      .populate("company", "name logo")
      .sort({ createdAt: -1 });

    console.log('✅ Published internships found:', publishedInternships.length);
    publishedInternships.forEach(internship => {
      console.log(`   - ${internship.title} by ${internship.company.name} (${internship.status})`);
    });

    // Clean up
    await Internship.findByIdAndDelete(internship._id);
    console.log('✅ Cleaned up test internship');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testInternshipFlow();
