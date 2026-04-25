const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Review = require('../models/Review');
const Student = require('../models/Student');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedReviews = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Get Students
    const students = await Student.find({ email: { $in: ['john@example.com', 'jane@example.com', 'alex@example.com', 'sarah@example.com', 'mike@example.com'] } });
    if (students.length === 0) {
      console.log('No students found. Please run the initial seed first.');
      process.exit(1);
    }

    // 2. Create More Sample Reviews to make lists more interesting
    const reviewsData = [
      // More for Google
      {
        companyName: 'Google',
        title: 'Interview was hard but worth it',
        description: 'The interview process at Google is quite rigorous. 4 rounds of technical interviews. But once you\'re in, it\'s like a dream.',
        rating: 5,
        position: 'SRE Intern',
        authorId: students[0]._id,
        authorName: students[0].firstName + ' ' + students[0].lastName,
        helpful: 55,
        unhelpful: 1,
        createdAt: new Date('2025-10-01')
      },
      // More for Netflix (High rating, low count)
      {
        companyName: 'Netflix',
        title: 'Freedom and Responsibility',
        description: 'Netflix culture is unique. You are treated like an adult. No micromanagement at all. Very high pay.',
        rating: 5,
        position: 'Data Science Intern',
        authorId: students[1]._id,
        authorName: students[1].firstName + ' ' + students[1].lastName,
        helpful: 102,
        unhelpful: 0,
        createdAt: new Date('2025-11-15')
      },
      {
        companyName: 'Netflix',
        title: 'Incredible talent density',
        description: 'Everyone here is at the top of their game. It\'s intimidating but you learn so much just by being in the room.',
        rating: 5,
        position: 'Software Engineer Intern',
        authorId: students[2]._id,
        authorName: students[2].firstName + ' ' + students[2].lastName,
        helpful: 44,
        unhelpful: 2,
        createdAt: new Date('2025-12-05')
      },
      // More for Tesla (Low rating, high count)
      {
        companyName: 'Tesla',
        title: 'Not for the faint of heart',
        description: 'Burnout is very real here. If you value your weekends, maybe look elsewhere. But the mission is great.',
        rating: 2,
        position: 'Manufacturing Intern',
        authorId: students[3]._id,
        authorName: students[3].firstName + ' ' + students[3].lastName,
        helpful: 150,
        unhelpful: 10,
        createdAt: new Date('2025-10-20')
      },
      {
        companyName: 'Tesla',
        title: 'Chaotic environment',
        description: 'Processes change every week. It\'s hard to keep up. Management is very top-down.',
        rating: 2,
        position: 'Quality Intern',
        authorId: students[4]._id,
        authorName: students[4].firstName + ' ' + students[4].lastName,
        helpful: 60,
        unhelpful: 5,
        createdAt: new Date('2025-09-25')
      },
      // More for Amazon (High count)
      {
        companyName: 'Amazon',
        title: 'Great for the resume',
        description: 'Having Amazon on your resume opens so many doors. The work is okay, but the name recognition is what matters.',
        rating: 3,
        position: 'Operations Intern',
        authorId: students[0]._id,
        authorName: students[0].firstName + ' ' + students[0].lastName,
        helpful: 30,
        unhelpful: 4,
        createdAt: new Date('2025-11-01')
      },
      {
        companyName: 'Amazon',
        title: 'L6 managers vary a lot',
        description: 'My manager was great, but the team next to us was miserable. It really depends on your org.',
        rating: 4,
        position: 'SDE Intern',
        authorId: students[1]._id,
        authorName: students[1].firstName + ' ' + students[1].lastName,
        helpful: 12,
        unhelpful: 1,
        createdAt: new Date('2025-11-10')
      },
      // Some for a new company
      {
        companyName: 'Spotify',
        title: 'Music and Code',
        description: 'The culture is so relaxed. We have jam sessions in the office! The engineering tribes system is very interesting.',
        rating: 5,
        position: 'Backend Intern',
        authorId: students[2]._id,
        authorName: students[2].firstName + ' ' + students[2].lastName,
        helpful: 88,
        unhelpful: 0,
        createdAt: new Date('2025-12-10')
      }
    ];

    await Review.insertMany(reviewsData);
    console.log(`Successfully added ${reviewsData.length} more reviews.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedReviews();
