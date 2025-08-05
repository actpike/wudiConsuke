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
    title: 'Key Features',
    
    rating: {
      title: 'Rating & Review Management',
      description: 'Compatible with Wodicon\'s official 6-category rating system. Centralized management of ratings and reviews for played games. Average value display helps you understand your rating tendencies.'
    },
    
    memo: {
      title: 'Review Memo Function',
      description: 'Record detailed reviews for each game. Character count function included, perfect for reference when posting comments. Never forget your impressions of precious games.'
    },
    
    monitoring: {
      title: 'Auto Monitoring & Notifications', 
      description: 'Automatically checks for new games and updates when you open the Wodicon site. Never miss version updates or new submissions with desktop notifications.'
    },
    
    data: {
      title: 'Data Management',
      description: 'Export/import function for rating and review data. Keep your precious data safe and secure.'
    }
  },

  // Screenshots Section
  screenshots: {
    title: 'Screenshots',
    
    main: {
      title: 'Main Screen',
      description: 'View game list and rating status at a glance'
    },
    
    detail: {
      title: 'Detail Screen', 
      description: '6-category rating and review input'
    }
  },

  // Installation Section
  installation: {
    title: 'Installation',
    description: 'Available on Chrome Web Store! Choose easy installation or manual installation.',
    
    tabs: {
      webstore: 'Chrome Web Store',
      manual: 'Manual Installation'
    },
    
    webstore: {
      title: 'Easy Installation from Chrome Web Store',
      description: 'One-click installation from the official Chrome Web Store.',
      button: 'Get from Chrome Web Store',
      stepsTitle: 'Installation Steps',
      step1: 'Click the button above to open Chrome Web Store',
      step2: 'Click "Add to Chrome" button',
      step3: 'Click "Add extension" in the confirmation dialog',
      step4: 'Complete when the icon appears in your browser toolbar!'
    },
    
    manual: {
      title: 'Manual Installation (zip version)',
      description: 'If you want to try the development version or latest version, you can install it manually from here.'
    }
  },
  
  banner: {
    title: 'WOLF RPG Editor Contest in Progress',
    description: 'Join Wodicon and discover amazing games!'
  },
  
  specification: {
    title: 'Specifications and Responsibility',
    purpose: 'This tool (extension) is an unofficial tool created as a personal hobby with the thought "This might be convenient!"<br>It is not intended for profit or personal information collection.',
    privacy: 'Input data is generally not transmitted externally.<br>All data is stored locally (in the browser cache area).',
    dataDeleted: {
      title: 'Saved data will be deleted if you perform the following operations:',
      item1: 'Uninstalling the extension',
      item2: 'Pressing the "Delete All Data" button on the options screen',
      item3: 'Pressing the "Delete" button on each game page',
      item4: 'Clearing browser cache (depends on environment)'
    },
    dataPreserved: {
      title: 'Data will NOT be deleted for the following operations:',
      item1: 'Turning the extension ON/OFF',
      item2: 'Moving or overwriting extension folder (zip reinstallation, etc.)'
    },
    backup: 'If you want to carefully preserve your input ratings and reviews, we recommend performing "Data Export" from the settings screen.',
    disclaimer: 'The creator accepts no responsibility for any troubles or damages that may occur from using this tool.<br>Please understand this.'
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
    copyright: '© 2025 WodiConsuke',
    description: 'WOLF RPG Editor Contest Game Management Tool',
    contact: 'Developer Contact:',
    twitter: '@act_pike',
    portfolio: 'Developer Portfolio',
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