/**
 * English Resource File (Introduction Page)
 * English UI texts for WodiConsuke Chrome Extension Introduction Page
 */

const enWebsiteResources = {
  // Meta Information
  meta: {
    title: 'WodiConsuke - WOLF RPG Editor Contest Game Management Tool',
    description: 'Chrome extension to enhance your Wodicon game experience. Features 6-category rating system, review memos, and automatic site monitoring to make your Wodicon life more convenient.',
    keywords: 'Wodicon,WOLF RPG Editor,Chrome Extension,Game Management,Rating System,Auto Monitor,Notification',
    ogTitle: 'WodiConsuke - WOLF RPG Editor Contest Game Management Tool',
    ogDescription: 'Chrome extension to enhance your Wodicon game experience. Features 6-category rating system, review memos, and automatic site monitoring to make your Wodicon life more convenient.',
    twitterTitle: 'WodiConsuke - Wodicon Game Management Tool',
    twitterDescription: 'Chrome extension to enhance your Wodicon game experience. Rating management, review memos, and automatic site monitoring to support your Wodicon life.'
  },

  // Header
  header: {
    title: 'WodiConsuke',
    subtitle: 'ウディこん助',
    description: 'WOLF RPG Editor Contest Game Management Tool',
    languageSelector: 'Language',
    japanese: '日本語',
    english: 'English'
  },

  // Navigation
  navigation: {
    overview: 'Overview',
    features: 'Features',
    installation: 'Installation',
    usage: 'Usage',
    download: 'Download',
    support: 'Support'
  },

  // Main Section
  main: {
    heroTitle: 'Make Your Wodicon Life<br>More Convenient',
    heroSubtitle: 'Chrome Extension',
    heroDescription: '"WodiConsuke" is an unofficial Chrome extension created by fans of the WOLF RPG Editor Contest (known as Wodicon).<br>Designed for game management, it perfectly supports checking played games, managing reviews, and detecting new releases and updates.<br>Make your Wodicon experience more comfortable.',
    currentVersion: 'Current Version',
    downloadButton: 'Chrome Web Store',
    githubButton: 'View on GitHub',
    officialSite: 'Official Wodicon Site'
  },

  // Features Section
  features: {
    sectionTitle: 'Key Features',
    sectionSubtitle: 'All the features you need for Wodicon game management',
    
    autoMonitoring: {
      title: '🔍 Automatic Site Monitoring',
      description: 'Automatically checks for new games and updates when you visit the Wodicon site. Desktop notifications keep you informed of new content.'
    },
    
    ratingSystem: {
      title: '📊 6-Category Rating System',
      description: 'Official Wodicon-compliant 6-category rating system (Engagement, Novelty, Story, Graphics/Audio, Usability, Other) with 10-point scale.'
    },
    
    reviewMemo: {
      title: '📝 Review Memo Function',
      description: 'Detailed review recording within 2000 characters. Character count function included to record your memories in detail.'
    },
    
    dataManagement: {
      title: '💾 Data Management',
      description: 'Data export/import in JSON/CSV format. Data protection is assured even when browser cache is cleared.'
    },
    
    votingSupport: {
      title: '🗳️ Voting Support Function',
      description: 'Bulk input function for rated games into voting forms. Streamlines the voting process.'
    },
    
    localStorage: {
      title: '🔒 Fully Local Operation',
      description: 'All data is stored in browser local storage. No external servers are used, protecting your privacy.'
    }
  },

  // Installation Section
  installation: {
    sectionTitle: 'Installation Guide',
    sectionSubtitle: 'Get started in 3 easy steps',
    
    step1: {
      title: 'Step 1: Download',
      description: 'Download the latest zip file using the download button above.'
    },
    
    step2: {
      title: 'Step 2: Extract',
      description: 'Extract the downloaded zip file to any location of your choice.'
    },
    
    step3: {
      title: 'Step 3: Load as Chrome Extension',
      description: 'On Chrome\'s "Extensions" page, select "Load unpacked" and specify the extracted folder.'
    },
    
    browserCompatibility: {
      title: 'Browser Compatibility',
      chrome: 'Google Chrome (Recommended)',
      edge: 'Microsoft Edge',
      brave: 'Brave Browser',
      note: 'Developed as a Chrome extension and works on Chromium-based browsers.'
    }
  },

  // Usage Section
  usage: {
    sectionTitle: 'How to Use',
    sectionSubtitle: 'Basic operation methods',
    
    basicOperations: {
      title: 'Basic Operations',
      items: [
        'Click game row → Go to detail screen',
        '👈Back button → Return to main screen',
        'Filter buttons to switch display (All/Rated/Unrated/New)',
        '⚙️Settings button → Open detailed settings screen'
      ]
    },
    
    webMonitoring: {
      title: 'Web Monitoring Function',
      items: [
        'Automatically check for new games and updates when visiting Wodicon site',
        'Auto-monitoring also executes when opening extension popup',
        'Manual monitoring button (🔍) for immediate monitoring execution',
        'Desktop notifications when new games or updates are found'
      ]
    },
    
    ratingSystem: {
      title: 'Rating System',
      items: [
        '6 categories × 10-point system (Official Wodicon compliant)',
        'Engagement, Novelty, Story, Graphics/Audio, Usability, Other',
        'Automatically sets played flag ON when rating is completed',
        'Average value bar display to understand your rating tendencies'
      ]
    }
  },

  // Support Section
  support: {
    sectionTitle: 'Support & Contact',
    sectionSubtitle: 'Feel free to contact us with any questions or requests',
    
    documentation: {
      title: '📚 Documentation',
      description: 'For detailed usage instructions and FAQ, please check the help page within the extension.'
    },
    
    github: {
      title: '🐙 GitHub',
      description: 'For source code review, feature requests, or bug reports, please visit our GitHub repository.',
      link: 'GitHub Repository'
    },
    
    contact: {
      title: '📧 Contact',
      description: 'For other questions or requests, please contact us through the following methods.',
      twitter: 'Twitter: @actpike',
      email: 'Or use the contact form within the extension'
    }
  },

  // Footer
  footer: {
    copyright: '© 2024 Pike (actpike). All rights reserved.',
    madeWith: 'Made with ❤️',
    version: 'Version',
    lastUpdated: 'Last Updated',
    officialContest: 'Official Wodicon Site',
    privacyNote: 'This extension operates fully locally and does not transmit personal information externally.'
  },

  // Common UI Elements
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    close: 'Close',
    more: 'More',
    less: 'Less',
    new: 'New',
    updated: 'Updated',
    beta: 'Beta'
  },

  // Accessibility
  accessibility: {
    skipToContent: 'Skip to content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    languageMenu: 'Language selection menu',
    mainContent: 'Main content',
    navigation: 'Navigation',
    backToTop: 'Back to top'
  }
};

// グローバルに公開
window.enWebsiteResources = enWebsiteResources;