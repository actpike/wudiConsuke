/**
 * English Resource File
 * English UI texts and messages for WodiConsuke Chrome Extension
 */

const enResources = {
  // Rating Category Translation Map (Top-level for easy access)
  categoryMap: {
    '熱中度': 'Engagement',
    '斬新さ': 'Novelty',
    '物語性': 'Story',
    '画像音声': 'Graphics/Audio',
    '遊びやすさ': 'Usability',
    'その他': 'Other'
  },

  // UI Elements
  ui: {
    // Header
    header: {
      title: 'WudiConsuke',
      subtitle: 'WOLF RPG Editor Contest Game Management Tool'
    },

    // Buttons
    buttons: {
      save: 'Save',
      cancel: 'Cancel',
      reset: 'Reset',
      delete: 'Delete',
      export: 'Export',
      import: 'Import',
      settings: 'Settings',
      help: 'Help',
      close: 'Close',
      confirm: 'Confirm',
      back: '👈Back',
      next: 'Next',
      retry: 'Retry',
      refresh: 'Refresh',
      monitor: 'Manual Monitor',
      monitorStatus: 'Monitor Status',
      backgroundUpdate: 'Background Update',
      fillAllForms: 'Fill Voting Forms with Rated Games',
      clearUpdates: 'Clear Updates',
      voteForm: 'Fill Vote Form'
    },

    // Labels & Items
    labels: {
      // Rating Categories
      rating: 'Rating',
      ratingHeat: 'Engagement',
      ratingNovelty: 'Novelty',
      ratingStory: 'Story',
      ratingGraphicsAudio: 'Graphics/Audio',
      ratingUsability: 'Usability',
      ratingOther: 'Other',
      
      // Rating Categories (Short form for table headers)
      ratingHeatShort: 'Eng',
      ratingNoveltyShort: 'Nov',
      ratingStoryShort: 'Sto',
      
      // Detail page items
      author: 'Author',
      genre: 'Genre',
      updateDate: 'Updated',
      unknown: 'Unknown',
      ratingGraphicsAudioShort: 'G/A',
      ratingUsabilityShort: 'Use',
      ratingOtherShort: 'Oth',
      
      // Basic Information
      gameTitle: 'Game Title',
      author: 'Author',
      genre: 'Genre',
      lastUpdate: 'Update',
      playStatus: 'Play Status',
      totalRating: 'Total',
      
      // Filters
      filterAll: 'All',
      filterPlayed: 'Rated',
      filterUnplayed: 'Unrated',
      filterNew: 'New',
      
      // Sort
      sortByNo: 'No.',
      sortByTitle: 'Title',
      sortByRating: 'Rating',
      sortByUpdate: 'Updated',
      
      // Others
      review: 'Review',
      comment: 'Comments',
      characterCount: 'Characters',
      maxCharacters: '2000 chars',
      language: 'Language',
      options: 'Options',
      average: 'Ave'
    },

    // Section Titles
    sections: {
      gameInfo: '■ Game Information',
      rating: '■ Rating',
      review: '■ Comments (Max 2000 chars)',
      settings: '■ Settings',
      monitor: '■ Web Monitor',
      export: '■ Data Export/Import',
      yearSelection: 'Year Selection',
      dataManagement: 'Data Management'
    },

    // Messages
    messages: {
      // Success Messages
      saved: 'Data saved successfully',
      loaded: 'Data loaded successfully',
      exported: 'Export completed successfully',
      imported: 'Import completed successfully',
      monitorSuccess: 'Monitoring completed successfully',
      deleted: 'Data deleted successfully',
      reset: 'Data reset successfully',
      
      // Error Messages
      saveError: 'Failed to save data',
      loadError: 'Failed to load data',
      networkError: 'Network error occurred',
      parseError: 'Failed to parse data',
      storageError: 'Storage quota exceeded',
      permissionError: 'Insufficient permissions',
      timeoutError: 'Request timed out',
      
      // Confirmation Messages
      confirmDelete: 'Are you sure you want to delete? This action cannot be undone.',
      confirmReset: 'Are you sure you want to reset? All data will be lost.',
      confirmImport: 'Import data? Existing data will be overwritten.',
      
      // Information Messages
      noData: 'No data available',
      noGames: 'No games found',
      loading: 'Loading...',
      processing: 'Processing...',
      completed: 'Completed',
      
      // Status Messages
      saveStatus: 'Save Status',
      autoSave: 'Auto Save',
      readOnly: 'Read Only',
      offline: 'Offline'
    },

    // Placeholders
    placeholders: {
      search: 'Search...',
      review: 'Enter your review...',
      gameTitle: 'Enter game title',
      author: 'Enter author name',
      ratingIndicator: 'Rating indicators will be displayed here',
      totalRatingIndicator: 'Overall rating indicator will be displayed here'
    },

    // Dynamic String Templates
    templates: {
      totalRating: '{score}/{maxScore} pts',
      characterCount: '{count}/{maxCount} chars',
      saveReady: '💾 Ready',
      saveStatus: '💾 Save Status'
    },

    // Status Messages
    status: {
      loadComplete: '💾 Load Complete',
      loadError: '❌ Load Failed - New Entry',
      saving: '💾 Saving...',
      saveComplete: '✅ Save Complete',
      saveError: '❌ Save Failed',
      hasChanges: '💾 Changes Auto-Saved',
      ready: '💾 Ready',
      confirmReset: 'You have unsaved changes. Reset anyway?',
      confirmDeleteGame: 'Delete rating and review data for "{title}"?\n\nThis action cannot be undone.',
      appReady: 'WudiConsuke Ready',
      confirmOpenVotePage: 'Opening vote page. Please press this button again after the page loads.',
      votePageRequired: 'Please run this on the vote page.',
      confirmBulkInput: 'Input data for {count} rated games into the form?'
    },


    // Tooltips
    tooltips: {
      settings: 'Settings',
      help: 'Help',
      refresh: 'Refresh',
      monitor: 'Manual Monitor',
      monitorStatus: '📊 Check Monitor Status',
      backgroundUpdate: 'Background Update',
      fillAllForms: 'Fill voting forms with rated games',
      clearUpdates: 'Clear all new/update marks',
      delete: 'Delete',
      reset: 'Reset'
    }
  },

  // Rating Indicators
  ratings: {
    // Category Names
    categories: {
      heat: 'Engagement',
      novelty: 'Novelty',
      story: 'Story',
      graphicsAudio: 'Graphics/Audio',
      usability: 'Usability',
      other: 'Other'
    },

    // Rating Indicator Texts (English translations)
    indicators: {
      'Engagement': {
        1: '【1】★ Quit immediately',
        2: '【2】★ Barely enjoyed it',
        3: '【3】★★ Some enjoyable parts',
        4: '【4】★★ More unengaging than engaging',
        5: '【5】★★★ Half engaging, half not',
        6: '【6】★★★ About 60% engaging',
        7: '【7】★★★★ About 70% engaging',
        8: '【8】★★★★ About 80% engaging',
        9: '【9】★★★★★ Almost completely engaging',
        10: '【10】★★★★★ Completely engaging from start to finish'
      },
      'Novelty': {
        1: '【1】★ Nothing new at all',
        2: '【2】★ Not exactly the same as existing ones',
        3: '【3】★★ Some different parts',
        4: '【4】★★ Feel some personality and creativity',
        5: '【5】★★★ Decent novelty',
        6: '【6】★★★ Sufficient personality and novelty',
        7: '【7】★★★★ Very fresh for me',
        8: '【8】★★★★ Rarely seen novelty',
        9: '【9】★★★★★ Almost never seen this type of game',
        10: '【10】★★★★★ Never seen a game like this before'
      },
      'Story': {
        1: '【1】★ No story or atmosphere at all',
        2: '【2】★ Story/atmosphere almost eliminated',
        3: '【3】★★ Effort in story/atmosphere is noticeable',
        4: '【4】★★ Some story/atmosphere present',
        5: '【5】★★★ Moderate story quality',
        6: '【6】★★★ More than sufficient story quality',
        7: '【7】★★★★ Solid story quality',
        8: '【8】★★★★ High-level story compared to others',
        9: '【9】★★★★★ Very high-quality story',
        10: '【10】★★★★★ Unlikely to encounter better story'
      },
      'Graphics/Audio': {
        1: '【1】★ No attention to materials at all',
        2: '【2】★ Effort in materials but poor impression',
        3: '【3】★★ Some unsatisfying aspects in materials',
        4: '【4】★★ Immature but effort in materials is felt',
        5: '【5】★★★ Some freshness and consistency in materials',
        6: '【6】★★★ Decent consistency and freshness, reliable',
        7: '【7】★★★★ Fresh materials with no complaints',
        8: '【8】★★★★ High-level fresh materials and usage',
        9: '【9】★★★★★ Excellent materials and usage',
        10: '【10】★★★★★ Definitely the best materials and usage'
      },
      'Usability': {
        1: '【1】★ Unacceptable unreasonableness or complexity',
        2: '【2】★ Harsh unreasonableness/complexity but manageable',
        3: '【3】★★ Barely tolerable unreasonableness/complexity',
        4: '【4】★★ Many unreasonable/complex parts but got used to it',
        5: '【5】★★★ Some difficult parts but not bothersome',
        6: '【6】★★★ Slightly difficult parts but within tolerance',
        7: '【7】★★★★ Minor complaints but sufficiently appropriate',
        8: '【8】★★★★ Much consideration for players felt',
        9: '【9】★★★★★ Almost completely comfortable, no complaints',
        10: '【10】★★★★★ Completely comfortable throughout'
      },
      'Other': {
        0: '【+0】Above content sufficiently evaluates the game',
        1: '【+1】★ Other good points exist ※Comment required',
        2: '【+2】★ Other very good points exist ※Comment required',
        3: '【+3】★★ Other extremely good points exist ※Comment required',
        4: '【+4】★★ Charm not explainable above ※Comment required',
        5: '【+5】★★★ Many charms not explainable above ※Comment required',
        6: '【+6】★★★ Too many charms not explainable above ※Comment required',
        7: '【+7】★★★★ Above barely evaluates the goodness ※Comment required',
        8: '【+8】★★★★ Above explains nothing about goodness ※Comment required',
        9: '【+9】★★★★★ Everything else besides above is tremendously good ※Comment required',
        10: '【+10】★★★★★ Everything else besides above is legendary good ※Comment required'
      }
    }
  },

  // Settings Screen
  settings: {
    title: 'Settings',
    language: {
      title: 'Language Settings',
      japanese: '日本語',
      english: 'English',
      description: 'Select display language'
    },
    monitor: {
      title: 'Web Monitor Settings',
      enabled: 'Enable monitoring',
      interval: 'Monitor interval',
      description: 'Auto-monitoring settings for Wodicon site'
    },
    data: {
      title: 'Data Management',
      export: 'Data Export',
      import: 'Data Import',
      reset: 'Data Reset',
      description: 'Game data management operations'
    }
  },

  // Web Monitor
  monitor: {
    title: 'Web Monitor',
    status: {
      enabled: 'Enabled',
      disabled: 'Disabled',
      running: 'Running',
      completed: 'Completed',
      error: 'Error'
    },
    messages: {
      newGames: 'Found {count} new games',
      updatedGames: '{count} games were updated',
      noChanges: 'No changes found',
      monitorError: 'Error occurred during monitoring'
    }
  },

  // Notification Messages
  notifications: {
    newGame: 'New game added: {title}',
    updatedGame: 'Game updated: {title}',
    monitorComplete: 'Web monitoring completed',
    dataExported: 'Data export completed',
    dataImported: 'Data import completed'
  },

  // Time & Date
  time: {
    now: 'Now',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: '{days} days ago',
    hoursAgo: '{hours} hours ago',
    minutesAgo: '{minutes} minutes ago',
    justNow: 'Just now'
  },

  // Help Content
  help: {
    title: '🌊 WudiConsuke User Guide',
    basicOperations: {
      title: '【Basic Operations】',
      items: [
        '• Click game row → Go to detail screen',
        '• 👈Back button → Return to main screen',
        '• Filter buttons to switch display (All/Rated/Unrated/New)',
        '• ⚙️Settings button → Open detailed settings screen',
        '• 🔄Background update button → Execute manual monitoring'
      ]
    },
    webMonitoring: {
      title: '【Web Monitoring Function】',
      items: [
        '• Automatically check for new games and updates when visiting Wodicon site',
        '• Auto-monitoring also executes when opening extension popup',
        '• Manual monitoring button (🔍) for immediate monitoring execution',
        '• Desktop notifications when new games or updates are found'
      ]
    },
    ratingSystem: {
      title: '【Rating System】',
      items: [
        '• 6 categories × 10-point system (Official Wodicon compliant)',
        '• Engagement, Novelty, Story, Graphics/Audio, Usability, Other',
        '• Automatically sets played flag ON when rating is completed',
        '• Average value bar display to understand your rating tendencies'
      ]
    },
    reviewMemo: {
      title: '【Review Memo Function】',
      items: [
        '• Detailed review records within 2000 characters',
        '• Character count function included'
      ]
    },
    votingSupport: {
      title: '【Voting Support Function】',
      items: [
        '• Individual data input to voting forms (from detail screen)',
        '• Bulk input of rated games (from 🗳️ button)'
      ]
    },
    dataSaving: {
      title: '【Data Saving】',
      items: [
        '• Changes are automatically saved'
      ]
    },
    dataManagement: {
      title: '【Data Management】',
      warning: '⚠️ Important: About Data Protection',
      description: 'Saved rating and review data may be lost when clearing browser cache or reinstalling the extension.\n(Data will NOT be lost by simply turning the extension ON/OFF)',
      items: [
        '• Data export/import available from settings screen',
        '• Supports JSON/CSV format data management'
      ]
    },
    detailInfo: {
      title: '【Detailed Information】',
      officialPage: 'Official page: https://wudi-consuke.vercel.app/website/release/index.html'
    }
  }
};

// Export as ES6 module
export default enResources;