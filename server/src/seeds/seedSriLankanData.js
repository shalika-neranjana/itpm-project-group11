const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Review = require('../models/Review');
const Student = require('../models/Student');
const Company = require('../models/Company');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SL_COMPANIES = [
  {
    name: 'WSO2',
    industry: 'Technology / Open Source',
    email: 'hr@wso2.com',
    password: 'password123',
    website: 'https://wso2.com',
    address: 'Lotus Road, Colombo 01',
    location: 'Colombo',
    description: 'Leading open-source technology provider in Sri Lanka.'
  },
  {
    name: 'Virtusa',
    industry: 'IT Services / Digital Engineering',
    email: 'hr@virtusa.com',
    password: 'password123',
    website: 'https://virtusa.com',
    address: 'Orion City, Colombo 09',
    location: 'Colombo',
    description: 'Global provider of digital engineering and IT services.'
  },
  {
    name: '99x',
    industry: 'Software Product Engineering',
    email: 'hr@99x.io',
    password: 'password123',
    website: 'https://99x.io',
    address: 'Magura Place, Colombo 06',
    location: 'Colombo',
    description: 'Specializing in software product engineering for global markets.'
  },
  {
    name: 'Sysco LABS',
    industry: 'Technology / Enterprise',
    email: 'hr@syscolabs.com',
    password: 'password123',
    website: 'https://syscolabs.com',
    address: 'Flower Road, Colombo 07',
    location: 'Colombo',
    description: 'The innovation arm of Sysco, the world leader in foodservice.'
  },
  {
    name: 'IFS Sri Lanka',
    industry: 'Enterprise Software',
    email: 'hr@ifs.com',
    password: 'password123',
    website: 'https://ifs.com',
    address: 'Orion City, Colombo 09',
    location: 'Colombo',
    description: 'Developer of enterprise software for customers around the world.'
  },
  {
    name: 'Dialog Axiata',
    industry: 'Telecommunications',
    email: 'hr@dialog.lk',
    password: 'password123',
    website: 'https://dialog.lk',
    address: 'Union Place, Colombo 02',
    location: 'Colombo',
    description: 'Sri Lanka\'s largest telecommunications provider.'
  },
  {
    name: 'LSEG Sri Lanka',
    industry: 'FinTech / Capital Markets',
    email: 'hr@lseg.com',
    password: 'password123',
    website: 'https://lseg.com',
    address: 'Trace Expert City, Colombo 10',
    location: 'Colombo',
    description: 'Global financial markets infrastructure and data provider.'
  },
  {
    name: 'Pearson Lanka',
    industry: 'EdTech / Technology',
    email: 'hr@pearson.com',
    password: 'password123',
    website: 'https://pearson.com',
    address: 'Magura Place, Colombo 06',
    location: 'Colombo',
    description: 'World\'s leading learning company, providing digital services and content.'
  },
  {
    name: 'CodeGen',
    industry: 'AI / Travel Technology',
    email: 'hr@codegen.co.uk',
    password: 'password123',
    website: 'https://codegen.co.uk',
    address: 'Trace Expert City, Colombo 10',
    location: 'Colombo',
    description: 'Leading provider of high-performance technology for the global travel industry.'
  }
];

const seedSriLankanData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Ensure Dummy Students exist
    const students = await Student.find({ email: { $in: ['john@example.com', 'jane@example.com', 'alex@example.com', 'sarah@example.com', 'mike@example.com'] } });
    if (students.length === 0) {
      console.log('No students found. Run initial seeds first.');
      process.exit(1);
    }

    // 2. Clear existing reviews and companies
    console.log('Cleaning existing reviews and companies...');
    await Review.deleteMany({});
    // We only delete the ones we are about to add or similar to avoid clearing real data if any
    // But since this is a dev/seed task, clearing all is usually what's requested for "replace"
    await Company.deleteMany({});

    // 3. Create Sri Lankan Companies
    console.log('Seeding Sri Lankan Companies...');
    const createdCompanies = await Company.insertMany(SL_COMPANIES);
    console.log(`Successfully seeded ${createdCompanies.length} Sri Lankan companies.`);

    // 4. Create Reviews for SL Companies
    console.log('Seeding Sri Lankan Company Reviews...');
    const reviewsData = [
      // WSO2
      {
        companyName: 'WSO2',
        title: 'Outstanding Open Source Culture',
        description: 'Interning at WSO2 was a transformative experience that far exceeded my expectations. I was fortunate enough to be placed within the Ballerina language team, where I was treated as a core contributor from day one. I had the opportunity to dive deep into complex topics like compiler design, concurrency models, and cloud-native integration patterns. The mentorship I received was world-class; senior engineers were always available to walk me through difficult concepts and provide constructive feedback on my pull requests. The horizontal hierarchy and open-source philosophy create an environment where curiosity is rewarded and every voice, including an intern\'s, truly matters. The culture is vibrant, intellectually stimulating, and incredibly supportive, making it a perfect place for any aspiring software engineer in Sri Lanka.',
        rating: 5,
        position: 'Software Engineering Intern',
        authorId: students[0]._id,
        authorName: students[0].firstName + ' ' + students[0].lastName,
        helpful: 34,
        unhelpful: 0,
        createdAt: new Date('2026-01-10'),
        comments: [
          {
            text: "This sounds amazing! How difficult was the technical interview for the Ballerina team?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-01-12'),
            replies: [
              {
                text: "It was quite challenging but fair. They focused a lot on distributed systems concepts and your ability to reason about code performance.",
                authorId: students[0]._id,
                authorName: students[0].firstName + ' ' + students[0].lastName,
                createdAt: new Date('2026-01-13')
              },
              {
                text: "Thanks! Did you have to do any live coding during the interview?",
                authorId: students[1]._id,
                authorName: students[1].firstName + ' ' + students[1].lastName,
                createdAt: new Date('2026-01-14')
              }
            ]
          },
          {
            text: "Does WSO2 still offer work-from-home options for interns?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-01-15'),
            replies: [
              {
                text: "Yes, currently it's a hybrid model. Usually 2-3 days in the office.",
                authorId: students[0]._id,
                authorName: students[0].firstName + ' ' + students[0].lastName,
                createdAt: new Date('2026-01-16')
              }
            ]
          },
          {
            text: "How much is the intern stipend at WSO2 these days?",
            authorId: students[3]._id,
            authorName: students[3].firstName + ' ' + students[3].lastName,
            createdAt: new Date('2026-01-17')
          },
          {
            text: "The Ballerina team is legendary! Did you get to meet Sanjiva?",
            authorId: students[4]._id,
            authorName: students[4].firstName + ' ' + students[4].lastName,
            createdAt: new Date('2026-01-18')
          },
          {
            text: "I applied last week, how long does it usually take to hear back?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-01-19')
          },
          {
            text: "Do they provide a laptop for the internship or should we use our own?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-01-20'),
            replies: [
              {
                text: "They provide high-end MacBook Pros or ThinkPads depending on the team.",
                authorId: students[0]._id,
                authorName: students[0].firstName + ' ' + students[0].lastName,
                createdAt: new Date('2026-01-21')
              }
            ]
          },
          {
            text: "What tech stack are they using for the Identity Server team?",
            authorId: students[3]._id,
            authorName: students[3].firstName + ' ' + students[3].lastName,
            createdAt: new Date('2026-01-22')
          }
        ]
      },
      {
        companyName: 'WSO2',
        title: 'High learning curve but rewarding',
        description: 'Joining WSO2 as a Product Intern was a steep learning curve but an immensely rewarding journey. The middleware space is notoriously complex, and understanding how identity management, API integration, and enterprise service buses function at scale took significant effort. However, the structured onboarding and the abundance of internal documentation helped me get up to speed quickly. I was involved in market research and feature prioritization for the latest release of the API Manager, which gave me invaluable insights into the product lifecycle. While the work can be intense and the technical depth required is high, the sense of accomplishment when you contribute to a product used by global enterprises is unmatched. It is a place that pushes you to your limits and helps you grow professionally and personally.',
        rating: 4,
        position: 'Product Intern',
        authorId: students[1]._id,
        authorName: students[1].firstName + ' ' + students[1].lastName,
        helpful: 12,
        unhelpful: 1,
        createdAt: new Date('2026-02-05'),
        comments: [
          {
            text: "Great review! Did you have to have a technical background for the Product role?",
            authorId: students[3]._id,
            authorName: students[3].firstName + ' ' + students[3].lastName,
            createdAt: new Date('2026-02-07')
          }
        ]
      },
      // Virtusa
      {
        companyName: 'Virtusa',
        title: 'Global exposure in Colombo',
        description: 'Virtusa provides an exceptional platform for interns to gain global exposure while staying in Sri Lanka. During my internship, I was integrated into a large-scale digital transformation project for a major retail bank based in the United Kingdom. This allowed me to learn about Agile methodologies, CI/CD pipelines, and enterprise-grade security standards in a real-world setting. The V-Academy training modules were particularly helpful in bridging the gap between university theory and industry practice. Working with cross-functional teams across different time zones was challenging but taught me a lot about professional communication and collaboration. The sheer scale of the organization means there are endless opportunities to explore different technologies and domains. It is a solid starting point for anyone looking to understand how the global IT services industry operates.',
        rating: 4,
        position: 'Technology Intern',
        authorId: students[2]._id,
        authorName: students[2].firstName + ' ' + students[2].lastName,
        helpful: 28,
        unhelpful: 2,
        createdAt: new Date('2026-01-20'),
        comments: [
          {
            text: "How was the work-life balance during the UK project? I heard Virtusa can be quite demanding.",
            authorId: students[4]._id,
            authorName: students[4].firstName + ' ' + students[4].lastName,
            createdAt: new Date('2026-01-22'),
            replies: [
              {
                text: "It depends on the project, but for mine, it was mostly 9-6. There were a few late calls with the UK team though.",
                authorId: students[2]._id,
                authorName: students[2].firstName + ' ' + students[2].lastName,
                createdAt: new Date('2026-01-23')
              },
              {
                text: "Were you paid overtime for those late calls?",
                authorId: students[4]._id,
                authorName: students[4].firstName + ' ' + students[4].lastName,
                createdAt: new Date('2026-01-24')
              }
            ]
          },
          {
            text: "What was the most common technology used in your project?",
            authorId: students[0]._id,
            authorName: students[0].firstName + ' ' + students[0].lastName,
            createdAt: new Date('2026-01-25'),
            replies: [
              {
                text: "Java and Spring Boot were the main ones, with Angular on the frontend.",
                authorId: students[2]._id,
                authorName: students[2].firstName + ' ' + students[2].lastName,
                createdAt: new Date('2026-01-26')
              }
            ]
          },
          {
            text: "Did you get a return offer after the internship?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-01-27')
          },
          {
            text: "How many interns were there in your batch?",
            authorId: students[3]._id,
            authorName: students[3].firstName + ' ' + students[3].lastName,
            createdAt: new Date('2026-01-28')
          },
          {
            text: "Is the Orion City office easy to commute to via public transport?",
            authorId: students[4]._id,
            authorName: students[4].firstName + ' ' + students[4].lastName,
            createdAt: new Date('2026-01-29')
          },
          {
            text: "What kind of projects do Technology Interns usually get?",
            authorId: students[0]._id,
            authorName: students[0].firstName + ' ' + students[0].lastName,
            createdAt: new Date('2026-01-30')
          },
          {
            text: "Do they have a dress code at Virtusa?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-01-31')
          }
        ]
      },
      // 99x
      {
        companyName: '99x',
        title: 'The best workplace for interns',
        description: '99x has truly mastered the art of fostering a positive and productive work environment for interns. From the moment I walked in, I was struck by the lack of traditional hierarchy and the genuine warmth of the staff. I was assigned to a high-impact project for a Scandinavian client, where I worked with a modern tech stack including React, Node.js, and AWS. The focus on software quality and "clean code" is religious here, which has permanently improved my coding habits. Beyond the technical work, the company organizes frequent social events, hackathons, and knowledge-sharing sessions that make you feel part of a community rather than just a number. If you are looking for a place where you can learn from the best while enjoying a fantastic work-life balance, 99x is undoubtedly the place to be.',
        rating: 5,
        position: 'Software Engineer Intern',
        authorId: students[4]._id,
        authorName: students[4].firstName + ' ' + students[4].lastName,
        helpful: 45,
        unhelpful: 1,
        createdAt: new Date('2026-02-15'),
        comments: [
          {
            text: "99x is my dream company! Do they hire many interns from local universities?",
            authorId: students[0]._id,
            authorName: students[0].firstName + ' ' + students[0].lastName,
            createdAt: new Date('2026-02-17'),
            replies: [
              {
                text: "Yes, they definitely do! A lot of my colleagues were from Moratuwa and SLIIT.",
                authorId: students[4]._id,
                authorName: students[4].firstName + ' ' + students[4].lastName,
                createdAt: new Date('2026-02-18')
              },
              {
                text: "That's good to hear. What was your GPA if you don't mind me asking?",
                authorId: students[0]._id,
                authorName: students[0].firstName + ' ' + students[0].lastName,
                createdAt: new Date('2026-02-19')
              }
            ]
          },
          {
            text: "How's the coffee at the new office? I heard it's great!",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-02-20')
          },
          {
            text: "Did you get to participate in any of their Dotitude events?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-02-21'),
            replies: [
              {
                text: "Yes, I was part of the organizing committee for the last hackathon. It was an amazing experience!",
                authorId: students[4]._id,
                authorName: students[4].firstName + ' ' + students[4].lastName,
                createdAt: new Date('2026-02-22')
              }
            ]
          },
          {
            text: "Is the salary competitive for interns at 99x?",
            authorId: students[3]._id,
            authorName: students[3].firstName + ' ' + students[3].lastName,
            createdAt: new Date('2026-02-23')
          },
          {
            text: "What tech stack are you guys using for the Scandinavian projects?",
            authorId: students[0]._id,
            authorName: students[0].firstName + ' ' + students[0].lastName,
            createdAt: new Date('2026-02-24')
          },
          {
            text: "Do they have flexible working hours?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-02-25'),
            replies: [
              {
                text: "Very flexible. As long as you get your work done and attend the standups.",
                authorId: students[4]._id,
                authorName: students[4].firstName + ' ' + students[4].lastName,
                createdAt: new Date('2026-02-26')
              }
            ]
          },
          {
            text: "I'm interested in DevOps, do they have roles for that?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-02-27')
          }
        ]
      },
      // Sysco LABS
      {
        companyName: 'Sysco LABS',
        title: 'Cutting edge tech in food-tech',
        description: 'My time at Sysco LABS was nothing short of incredible. Working for the innovation arm of the world\'s largest foodservice provider means you get to tackle problems of massive scale. As a Data Engineering intern, I was involved in building real-time analytics dashboards that help optimize supply chain operations across North America. We used advanced big data tools like Spark and Snowflake, which was a fantastic learning opportunity that I wouldn\'t have gotten elsewhere. The engineering standards are incredibly high, and the emphasis on innovation is visible in everything they do. The office itself is a masterpiece, designed to encourage creativity and collaboration. The combination of high-impact work, great perks, and a brilliant team makes Sysco LABS one of the most prestigious places to intern in Sri Lanka.',
        rating: 5,
        position: 'Data Engineering Intern',
        authorId: students[0]._id,
        authorName: students[0].firstName + ' ' + students[0].lastName,
        helpful: 52,
        unhelpful: 0,
        createdAt: new Date('2026-01-25'),
        comments: [
          {
            text: "Is it true they have a dedicated game room and free meals?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-01-27'),
            replies: [
              {
                text: "Haha yes! The game room is legendary and the food is great. But the work is also very serious!",
                authorId: students[0]._id,
                authorName: students[0].firstName + ' ' + students[0].lastName,
                createdAt: new Date('2026-01-28')
              },
              {
                text: "What kind of food do they usually serve?",
                authorId: students[2]._id,
                authorName: students[2].firstName + ' ' + students[2].lastName,
                createdAt: new Date('2026-01-29')
              }
            ]
          },
          {
            text: "How hard is it to get into the Data Engineering team?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-01-30')
          },
          {
            text: "Do you get to work with actual US-based mentors?",
            authorId: students[3]._id,
            authorName: students[3].firstName + ' ' + students[3].lastName,
            createdAt: new Date('2026-01-31'),
            replies: [
              {
                text: "Yes, my project lead was based in Texas. We had daily syncs.",
                authorId: students[0]._id,
                authorName: students[0].firstName + ' ' + students[0].lastName,
                createdAt: new Date('2026-02-01')
              }
            ]
          },
          {
            text: "What's the best thing about working at Sysco LABS?",
            authorId: students[4]._id,
            authorName: students[4].firstName + ' ' + students[4].lastName,
            createdAt: new Date('2026-02-02')
          },
          {
            text: "Is the interview mostly about algorithms or system design?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-02-03')
          },
          {
            text: "Do they offer transport for interns?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-02-04')
          },
          {
            text: "How many rounds of interviews did you have?",
            authorId: students[3]._id,
            authorName: students[3].firstName + ' ' + students[3].lastName,
            createdAt: new Date('2026-02-05')
          }
        ]
      },
      // LSEG
      {
        companyName: 'LSEG Sri Lanka',
        title: 'High scale FinTech exposure',
        description: 'Interning at the London Stock Exchange Group (LSEG) in Sri Lanka was a prestigious and intellectually demanding experience. Being part of the team that builds and maintains the technology for global financial markets was a huge responsibility. I worked on low-latency trading systems where even a few milliseconds of delay can have massive consequences. This taught me a great deal about performance optimization, multi-threading, and system reliability. The environment is professional and high-stakes, yet the seniors are incredibly patient and willing to teach. LSEG provides a unique intersection of finance and technology that is rare to find. The exposure to global financial standards and the opportunity to work at Trace Expert City made this an unforgettable internship. It is highly recommended for those who enjoy rigorous engineering and complex problem-solving.',
        rating: 5,
        position: 'Software Engineer Intern',
        authorId: students[3]._id,
        authorName: students[3].firstName + ' ' + students[3].lastName,
        helpful: 31,
        unhelpful: 0,
        createdAt: new Date('2026-02-10'),
        comments: [
          {
            text: "What programming languages do they mostly use for the trading systems?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-02-12'),
            replies: [
              {
                text: "Mostly C++ and Java for the core systems, with some Python for tooling and analysis.",
                authorId: students[3]._id,
                authorName: students[3].firstName + ' ' + students[3].lastName,
                createdAt: new Date('2026-02-13')
              },
              {
                text: "I'm better at Java, is there a specific team I should apply for?",
                authorId: students[1]._id,
                authorName: students[1].firstName + ' ' + students[1].lastName,
                createdAt: new Date('2026-02-14')
              }
            ]
          },
          {
            text: "LSEG is a big name. How's the pressure for interns?",
            authorId: students[0]._id,
            authorName: students[0].firstName + ' ' + students[0].lastName,
            createdAt: new Date('2026-02-15')
          },
          {
            text: "Is the office at Trace Expert City as cool as it looks?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-02-16'),
            replies: [
              {
                text: "Even cooler! It's an old warehouse converted into a high-tech office. Very unique vibe.",
                authorId: students[3]._id,
                authorName: students[3].firstName + ' ' + students[3].lastName,
                createdAt: new Date('2026-02-17')
              }
            ]
          },
          {
            text: "Do they have a formal internship program with structured training?",
            authorId: students[4]._id,
            authorName: students[4].firstName + ' ' + students[4].lastName,
            createdAt: new Date('2026-02-18')
          },
          {
            text: "What's the starting salary for a junior dev after internship?",
            authorId: students[0]._id,
            authorName: students[0].firstName + ' ' + students[0].lastName,
            createdAt: new Date('2026-02-19')
          },
          {
            text: "Do you get to interact with teams in London?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-02-20')
          },
          {
            text: "How's the interview process for SE interns?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-02-21')
          }
        ]
      },
      // Pearson
      {
        companyName: 'Pearson Lanka',
        title: 'Meaningful work in EdTech',
        description: 'Pearson Lanka offers a very stable and nurturing environment for interns looking to make a difference in the world of education. During my six months there, I worked with the Cloud Operations team, where I gained hands-on experience with Azure and Kubernetes. The project I was on directly supported digital learning platforms used by millions of students worldwide, which gave my work a great sense of purpose. The culture is very inclusive, and there is a strong emphasis on continuous learning; I was encouraged to take certification exams and participate in global internal workshops. While it might not be as "fast-paced" as a startup, the structured learning and the focus on accessibility and pedagogical standards make it a unique and valuable experience. It is a great place for those who value impact and a supportive learning environment.',
        rating: 4,
        position: 'Cloud Ops Intern',
        authorId: students[4]._id,
        authorName: students[4].firstName + ' ' + students[4].lastName,
        helpful: 14,
        unhelpful: 1,
        createdAt: new Date('2026-01-05'),
        comments: [
          {
            text: "Did you get a chance to take any AWS or Azure certifications during the internship?",
            authorId: students[0]._id,
            authorName: students[0].firstName + ' ' + students[0].lastName,
            createdAt: new Date('2026-01-08'),
            replies: [
              {
                text: "Yes! They actually paid for my AZ-900 exam and provided all the study materials.",
                authorId: students[4]._id,
                authorName: students[4].firstName + ' ' + students[4].lastName,
                createdAt: new Date('2026-01-09')
              },
              {
                text: "That's a huge plus! Was the exam difficult?",
                authorId: students[0]._id,
                authorName: students[0].firstName + ' ' + students[0].lastName,
                createdAt: new Date('2026-01-10')
              }
            ]
          },
          {
            text: "How's the diversity and inclusion at Pearson Lanka?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-01-11')
          },
          {
            text: "Is there a lot of legacy code to deal with?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-01-12'),
            replies: [
              {
                text: "Some parts, but my project was on a brand new microservice architecture.",
                authorId: students[4]._id,
                authorName: students[4].firstName + ' ' + students[4].lastName,
                createdAt: new Date('2026-01-13')
              }
            ]
          },
          {
            text: "What are the working hours like for interns?",
            authorId: students[3]._id,
            authorName: students[3].firstName + ' ' + students[3].lastName,
            createdAt: new Date('2026-01-14')
          },
          {
            text: "Do they provide breakfast and lunch?",
            authorId: students[0]._id,
            authorName: students[0].firstName + ' ' + students[0].lastName,
            createdAt: new Date('2026-01-15')
          },
          {
            text: "Is it a good place for someone interested in Cloud Ops?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-01-16')
          },
          {
            text: "How many interns were in your team?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-01-17')
          }
        ]
      },
      // CodeGen
      {
        companyName: 'CodeGen',
        title: 'AI Innovation at its Peak',
        description: 'CodeGen is widely considered the most innovative tech company in Sri Lanka, and my internship there definitely confirmed that reputation. I was part of the AI research unit, where we worked on autonomous vehicle technology and sophisticated travel recommendation engines. The level of "out-of-the-box" thinking encouraged here is phenomenal. We weren\'t just using existing libraries; we were building our own algorithms from scratch. The atmosphere is energetic and feels like a massive startup where anything is possible. Working alongside the team that built the Vega EV was a highlight of my time there. If you want to be at the absolute cutting edge of technology and aren\'t afraid of ambitious projects that push the boundaries of what is possible in Sri Lanka, CodeGen is the ultimate destination for an internship.',
        rating: 5,
        position: 'AI Engineer Intern',
        authorId: students[0]._id,
        authorName: students[0].firstName + ' ' + students[0].lastName,
        helpful: 22,
        unhelpful: 0,
        createdAt: new Date('2026-03-20'),
        comments: [
          {
            text: "Did you actually get to see the Vega car up close?",
            authorId: students[3]._id,
            authorName: students[3].firstName + ' ' + students[3].lastName,
            createdAt: new Date('2026-03-22'),
            replies: [
              {
                text: "Yes, multiple times! They even let the interns sit in it during a special showcase event.",
                authorId: students[0]._id,
                authorName: students[0].firstName + ' ' + students[0].lastName,
                createdAt: new Date('2026-03-23')
              },
              {
                text: "That is so cool! Is it as fast as they say?",
                authorId: students[3]._id,
                authorName: students[3].firstName + ' ' + students[3].lastName,
                createdAt: new Date('2026-03-24')
              }
            ]
          },
          {
            text: "CodeGen sounds like a place for 'rockstar' devs. Is it very competitive internally?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-03-25')
          },
          {
            text: "What's the tech stack for the travel platforms?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-03-26'),
            replies: [
              {
                text: "It's a mix of Java, C++, and a lot of proprietary AI frameworks they built.",
                authorId: students[0]._id,
                authorName: students[0].firstName + ' ' + students[0].lastName,
                createdAt: new Date('2026-03-27')
              }
            ]
          },
          {
            text: "Do they hire fresh graduates too, or just interns?",
            authorId: students[4]._id,
            authorName: students[4].firstName + ' ' + students[4].lastName,
            createdAt: new Date('2026-03-28')
          },
          {
            text: "How was the interview for the AI unit?",
            authorId: students[1]._id,
            authorName: students[1].firstName + ' ' + students[1].lastName,
            createdAt: new Date('2026-03-29')
          },
          {
            text: "Does CodeGen have a gym in the office?",
            authorId: students[2]._id,
            authorName: students[2].firstName + ' ' + students[2].lastName,
            createdAt: new Date('2026-03-30')
          },
          {
            text: "Is there a specific research project interns can join?",
            authorId: students[3]._id,
            authorName: students[3].firstName + ' ' + students[3].lastName,
            createdAt: new Date('2026-03-31')
          }
        ]
      }
    ];

    await Review.insertMany(reviewsData);
    console.log(`Successfully seeded ${reviewsData.length} Sri Lankan company reviews.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding Sri Lankan data:', error);
    process.exit(1);
  }
};

seedSriLankanData();
