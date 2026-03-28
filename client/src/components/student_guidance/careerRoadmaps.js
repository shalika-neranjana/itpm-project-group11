export const careerRoadmaps = [
  {
    id: 'web-developer',
    title: 'Web Developer',
    summary: 'Build responsive and accessible websites with modern frontend and backend technologies.',
    nextStep: 'Create and deploy one portfolio website with API integration and responsive layouts.',
    matchScore: 80,
    matchedAreas: ['Software Engineering', 'JavaScript', 'React'],
    comprehensiveDescription:
      'Web development combines interface design, frontend engineering, backend services, and deployment workflows. You will build products that run across browsers, optimize performance, and ensure security and accessibility standards are met.',
    guidelines: [
      'Master HTML, CSS, JavaScript, and responsive design fundamentals.',
      'Build reusable UI components and connect them to REST APIs.',
      'Learn backend basics (Node.js/Express), authentication, and database CRUD operations.',
      'Apply accessibility checks, performance optimization, and cross-browser testing.',
      'Deploy projects to cloud platforms and document architecture decisions in your portfolio.',
    ],
    roadmap: [
      {
        phase: 'Phase 1 (Weeks 1-2): Foundation',
        outcome: 'Complete core web basics and build static responsive pages.',
      },
      {
        phase: 'Phase 2 (Weeks 3-5): Frontend Projects',
        outcome: 'Build component-based interfaces with state and routing.',
      },
      {
        phase: 'Phase 3 (Weeks 6-8): Backend Integration',
        outcome: 'Connect frontend to APIs, auth, and persistent storage.',
      },
      {
        phase: 'Phase 4 (Weeks 9-10): Quality and Delivery',
        outcome: 'Apply testing, accessibility, optimization, and deploy a full project.',
      },
    ],
  },
  {
    id: 'mobile-apps-developer',
    title: 'Mobile Apps Developer',
    summary: 'Develop smooth, user-friendly mobile applications with strong performance and usability.',
    nextStep: 'Build one mobile app prototype and implement core screens with navigation and state management.',
    matchScore: 15,
    matchedAreas: ['Software Engineering', 'React', 'UI/UX Design'],
    comprehensiveDescription:
      'Mobile app development focuses on building applications for Android and iOS with native-like performance and intuitive user experiences. It requires understanding mobile UI patterns, state management, offline handling, and app lifecycle behavior.',
    guidelines: [
      'Start with React Native or Flutter and understand project structure and navigation.',
      'Design mobile-first interfaces with consistent spacing, typography, and touch targets.',
      'Implement local storage, API integration, and network error handling.',
      'Measure app performance and reduce heavy renders and unnecessary state updates.',
      'Practice publishing flows, versioning, and release notes for production readiness.',
    ],
    roadmap: [
      {
        phase: 'Phase 1 (Weeks 1-2): Mobile Fundamentals',
        outcome: 'Set up framework, navigation, and reusable mobile UI components.',
      },
      {
        phase: 'Phase 2 (Weeks 3-5): Feature Development',
        outcome: 'Build main app flows with state management and form handling.',
      },
      {
        phase: 'Phase 3 (Weeks 6-8): Data and Reliability',
        outcome: 'Add APIs, offline storage, and graceful error states.',
      },
      {
        phase: 'Phase 4 (Weeks 9-10): Performance and Release',
        outcome: 'Optimize rendering, test on devices, and prepare release builds.',
      },
    ],
  },
  {
    id: 'desktop-app-developer',
    title: 'Desktop App Developer',
    summary: 'Create stable desktop applications for productivity workflows and system-level utilities.',
    nextStep: 'Develop one desktop utility app with file handling, validation, and error logging.',
    matchScore: 5,
    matchedAreas: ['Programming', 'Database', 'Problem Solving'],
    comprehensiveDescription:
      'Desktop development emphasizes reliable applications with rich UI, local resource integration, and long-running stability. You work closely with file systems, native capabilities, and robust exception handling to deliver dependable tools.',
    guidelines: [
      'Choose a desktop framework such as Electron, .NET, JavaFX, or Qt based on your stack.',
      'Design clear workflows for local files, settings, and data persistence.',
      'Implement structured logging, validation rules, and recoverable error handling.',
      'Create installer-ready builds and validate behavior on target operating systems.',
      'Document architecture and support troubleshooting with clear user guides.',
    ],
    roadmap: [
      {
        phase: 'Phase 1 (Weeks 1-2): Platform Setup',
        outcome: 'Set up desktop framework and build core window/navigation structure.',
      },
      {
        phase: 'Phase 2 (Weeks 3-5): Core Utility Features',
        outcome: 'Implement local file workflows, forms, and persistent settings.',
      },
      {
        phase: 'Phase 3 (Weeks 6-8): Stability and Diagnostics',
        outcome: 'Add validation, structured logging, and robust error recovery.',
      },
      {
        phase: 'Phase 4 (Weeks 9-10): Packaging and Support',
        outcome: 'Create installers, verify cross-OS behavior, and prepare user documentation.',
      },
    ],
  },
]

export const getCareerRoadmapById = (id) =>
  careerRoadmaps.find((career) => career.id === id)
