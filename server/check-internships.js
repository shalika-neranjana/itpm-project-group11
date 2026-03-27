/**
 * Check existing internships in database
 */

const mongoose = require('mongoose');
const Internship = require('./src/models/Internship');
require('dotenv').config();

const checkInternships = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all internships
    const allInternships = await Internship.find({})
      .populate("company", "name")
      .sort({ createdAt: -1 });

    console.log(`📊 Total internships in database: ${allInternships.length}`);

    if (allInternships.length === 0) {
      console.log('ℹ️  No internships found. Companies need to post internships first.');
    } else {
      allInternships.forEach((internship, index) => {
        console.log(`${index + 1}. ${internship.title}`);
        console.log(`   Company: ${internship.company?.name || 'Unknown'}`);
        console.log(`   Status: ${internship.status}`);
        console.log(`   Type: ${internship.type}`);
        console.log(`   Location: ${internship.location}`);
        console.log(`   Created: ${internship.createdAt.toLocaleDateString()}`);
        console.log('');
      });

      // Check published vs draft
      const published = allInternships.filter(i => i.status === 'Published');
      const draft = allInternships.filter(i => i.status === 'Draft');
      const closed = allInternships.filter(i => i.status === 'Closed');

      console.log(`📈 Status breakdown:`);
      console.log(`   Published: ${published.length}`);
      console.log(`   Draft: ${draft.length}`);
      console.log(`   Closed: ${closed.length}`);
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

checkInternships();
