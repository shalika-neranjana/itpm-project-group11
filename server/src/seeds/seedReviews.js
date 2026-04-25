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

    // 1. Create Dummy Students if they don't exist
    console.log('Creating dummy students...');
    const dummyStudentsData = [
      { studentId: 'S001', firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'password123' },
      { studentId: 'S002', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', password: 'password123' },
      { studentId: 'S003', firstName: 'Alex', lastName: 'Johnson', email: 'alex@example.com', password: 'password123' },
      { studentId: 'S004', firstName: 'Sarah', lastName: 'Williams', email: 'sarah@example.com', password: 'password123' },
      { studentId: 'S005', firstName: 'Mike', lastName: 'Brown', email: 'mike@example.com', password: 'password123' }
    ];

    const students = [];
    for (const data of dummyStudentsData) {
      let student = await Student.findOne({ email: data.email });
      if (!student) {
        student = await Student.create(data);
      }
      students.push(student);
    }
    console.log(`Ensured ${students.length} dummy students exist.`);

    // 2. Clear existing reviews (optional, but good for clean seed)
    console.log('Cleaning existing reviews...');
    await Review.deleteMany({});

    // 3. Create Sample Reviews
    const reviewsData = [
      // Google
      {
        companyName: 'Google',
        title: 'Amazing learning experience',
        description: 'I spent 3 months at Google as a Software Engineering Intern. The mentorship was top-notch and I got to work on production code that impacts millions of users. The perks are as good as everyone says!',
        rating: 5,
        position: 'Software Engineering Intern',
        authorId: students[0]._id,
        authorName: students[0].firstName + ' ' + students[0].lastName,
        helpful: 45,
        unhelpful: 2,
        createdAt: new Date('2025-08-15')
      },
      {
        companyName: 'Google',
        title: 'Great culture, but fast-paced',
        description: 'Google has an incredible culture of collaboration. However, the expectations are very high even for interns. Be prepared to learn quickly!',
        rating: 4,
        position: 'Product Management Intern',
        authorId: students[1]._id,
        authorName: students[1].firstName + ' ' + students[1].lastName,
        helpful: 12,
        unhelpful: 0,
        createdAt: new Date('2025-09-01')
      },
      {
        companyName: 'Google',
        title: 'Not what I expected',
        description: 'The team I was on was very siloed. I didn\'t feel like I got much mentorship. The food was good though.',
        rating: 3,
        position: 'UX Design Intern',
        authorId: students[2]._id,
        authorName: students[2].firstName + ' ' + students[2].lastName,
        helpful: 5,
        unhelpful: 8,
        createdAt: new Date('2025-07-20')
      },
      // Microsoft
      {
        companyName: 'Microsoft',
        title: 'The best internship ever',
        description: 'Microsoft really cares about their interns. The events they host are amazing, and the work-life balance is actually respected. I learned so much about cloud computing.',
        rating: 5,
        position: 'Cloud Engineering Intern',
        authorId: students[3]._id,
        authorName: students[3].firstName + ' ' + students[3].lastName,
        helpful: 38,
        unhelpful: 1,
        createdAt: new Date('2025-08-10')
      },
      {
        companyName: 'Microsoft',
        title: 'Solid experience',
        description: 'Good pay, good benefits, and a very structured program. Sometimes felt a bit corporate and slow moving.',
        rating: 4,
        position: 'Software Engineer Intern',
        authorId: students[4]._id,
        authorName: students[4].firstName + ' ' + students[4].lastName,
        helpful: 15,
        unhelpful: 2,
        createdAt: new Date('2025-08-25')
      },
      // Amazon
      {
        companyName: 'Amazon',
        title: 'High pressure, high reward',
        description: 'Amazon is definitely intense. You are given a lot of responsibility from day one. I owned my project completely. It was stressful but I grew more than I ever have.',
        rating: 4,
        position: 'SDE Intern',
        authorId: students[0]._id,
        authorName: students[0].firstName + ' ' + students[0].lastName,
        helpful: 67,
        unhelpful: 5,
        createdAt: new Date('2025-09-10')
      },
      {
        companyName: 'Amazon',
        title: 'Work-life balance is tough',
        description: 'Expect to work long hours. The culture is very data-driven which is cool, but it can feel impersonal at times.',
        rating: 3,
        position: 'Business Analyst Intern',
        authorId: students[1]._id,
        authorName: students[1].firstName + ' ' + students[1].lastName,
        helpful: 22,
        unhelpful: 3,
        createdAt: new Date('2025-08-05')
      },
      // Meta
      {
        companyName: 'Meta',
        title: 'Move fast and break things',
        description: 'The velocity at Meta is insane. I pushed code to production in my first week. The intern community is very tight-knit.',
        rating: 5,
        position: 'Software Engineering Intern',
        authorId: students[2]._id,
        authorName: students[2].firstName + ' ' + students[2].lastName,
        helpful: 52,
        unhelpful: 2,
        createdAt: new Date('2025-08-30')
      },
      // Apple
      {
        companyName: 'Apple',
        title: 'Secrecy is real',
        description: 'Working at Apple is unique. Everything is very secret, even internally. But the attention to detail is inspiring. You really feel like you\'re building the future.',
        rating: 4,
        position: 'Hardware Engineering Intern',
        authorId: students[3]._id,
        authorName: students[3].firstName + ' ' + students[3].lastName,
        helpful: 41,
        unhelpful: 1,
        createdAt: new Date('2025-07-15')
      },
      // Tesla
      {
        companyName: 'Tesla',
        title: 'Hardest I\'ve ever worked',
        description: 'If you want to work on cool stuff and don\'t mind sleeping at the office sometimes, this is for you. Elon\'s vision is everywhere.',
        rating: 3,
        position: 'Mechanical Engineering Intern',
        authorId: students[4]._id,
        authorName: students[4].firstName + ' ' + students[4].lastName,
        helpful: 89,
        unhelpful: 12,
        createdAt: new Date('2025-09-05')
      },
      // Adobe
      {
        companyName: 'Adobe',
        title: 'Great balance and people',
        description: 'Adobe is a hidden gem for interns. Great pay, amazing people, and they really value creativity. Work-life balance is perfect.',
        rating: 5,
        position: 'Computer Scientist Intern',
        authorId: students[0]._id,
        authorName: students[0].firstName + ' ' + students[0].lastName,
        helpful: 18,
        unhelpful: 0,
        createdAt: new Date('2025-08-20')
      },
      // Slack
      {
        companyName: 'Slack',
        title: 'Very inclusive culture',
        description: 'Slack was a wonderful place to intern. The team was very supportive and I felt like my voice mattered even as an intern.',
        rating: 5,
        position: 'Frontend Engineering Intern',
        authorId: students[1]._id,
        authorName: students[1].firstName + ' ' + students[1].lastName,
        helpful: 14,
        unhelpful: 1,
        createdAt: new Date('2025-08-12')
      },
      // Zoom
      {
        companyName: 'Zoom',
        title: 'Good technical challenges',
        description: 'Scaling video infrastructure is hard! I learned a lot about networking and performance optimization.',
        rating: 4,
        position: 'Infrastructure Intern',
        authorId: students[2]._id,
        authorName: students[2].firstName + ' ' + students[2].lastName,
        helpful: 9,
        unhelpful: 1,
        createdAt: new Date('2025-07-25')
      },
      // Additional reviews for more counts
      {
        companyName: 'Google',
        title: 'Solid PM experience',
        description: 'Managed a small feature from spec to launch. Great visibility into how products are built at scale.',
        rating: 5,
        position: 'APM Intern',
        authorId: students[3]._id,
        authorName: students[3].firstName + ' ' + students[3].lastName,
        helpful: 25,
        unhelpful: 0,
        createdAt: new Date('2025-09-15')
      },
      {
        companyName: 'Microsoft',
        title: 'Loved the Redmond campus',
        description: 'The campus is like a small city. So many things to do. The internship program is very well run.',
        rating: 4,
        position: 'Software Engineer',
        authorId: students[4]._id,
        authorName: students[4].firstName + ' ' + students[4].lastName,
        helpful: 11,
        unhelpful: 1,
        createdAt: new Date('2025-08-28')
      }
    ];

    await Review.insertMany(reviewsData);
    console.log(`Successfully seeded ${reviewsData.length} reviews.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedReviews();
