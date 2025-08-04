# 🌊 WodiConsuke

[日本語](README.md) | [English](README.en.md)

WodiConsuke is a Chrome extension that enhances the game playing experience for Wodicon (WOLF RPG Editor Contest) entries, making it more comfortable and convenient.

## ✨ Main Features

### 🎮 Game Play Support
- **Game List Management**: Efficient list display for up to 80 games
- **Wodicon Official-Compliant Evaluation**: Detailed evaluation system with 6 categories × 10-point scale
- **Review Recording**: Detailed review/comment function up to 2000 characters
- **Played Game Management**: Automatic played flag update when evaluation is completed
- **Local Folder Integration**: Game launching via file:// protocol

### 🖥️ Intuitive UI
- **2-Screen Layout**: Main screen (list) ↔ Detail screen (editing)
- **Auto-Save**: Automatic data saving every 3 seconds
- **Responsive**: Optimized layout at 550px×500px
- **List Display**: Efficient table format for game management

### 💾 Data Management
- **Completely Local**: Safe storage with chrome.storage.local
- **Import/Export**: Data migration with JSON files
- **Statistics**: Visualization of play status

## 🚀 Installation

### Development Version (Recommended)
1. Download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked extension"
5. Select the `WudiConsuke` folder

### Permissions
**Permissions used by WodiConsuke and their purposes:**
- **storage**: Local storage of game evaluations, reviews, and play status
- **notifications**: Desktop notifications for new/updated games
- **activeTab**: Get active tab information, page analysis during manual monitoring
- **host_permissions**: Information retrieval from Wodicon official site (silversecond.com)

**Monitoring Feature**: Check for new games when visiting site, opening popup, or manual execution

**Completely Local Operation**: No data transmission, tracking, or advertisements

**To use Local Folder Feature:**
1. Click "Details" of the extension
2. Enable "Allow access to file URLs"

## 📖 How to Use

### Basic Operations
1. **Add Games**: Sample data will be automatically loaded
2. **Input Evaluations**: Click game row → Evaluate 6 categories in detail screen
3. **Record Reviews**: Input up to 2000 characters of reviews in detail screen
4. **Folder Settings**: Register local game folder paths

### Screen Navigation
- **Main → Detail**: Click game row
- **Detail → Main**: 👈Back button or × button
- **Auto-Save**: Edits are automatically saved

## 🔧 Technical Specifications

### Supported Environment
- Google Chrome (Manifest V3)
- Windows / macOS / Linux

### Technologies Used
- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Storage**: chrome.storage.local (5MB limit)
- **Permissions**: storage, notifications, activeTab, host_permissions

## 📝 License

This project is released under the MIT License.

## 🤝 Contact

For bug reports or feature requests, please contact @act_pike on X (formerly Twitter).

# Specifications and Responsibilities

- This tool (extension) is an unofficial tool created for personal hobby with the thought "It might be convenient!" It is not intended for profit or personal information collection.

- Input data is not transmitted externally in principle. All data is stored locally (in the browser's cache area).

- Saved data will be deleted if you perform the following operations:
  - Uninstall the extension
  - Press the "Delete All Data" button on the options screen
  - Press the "Delete" button on each game page
  - Clear browser cache (*depends on environment)

- Note that data will NOT be deleted by the following operations:
  - Turning the extension ON/OFF
  - Relocating/overwriting the extension folder (zip reinstallation, etc.)

- If you want to safely preserve your input evaluations and reviews, we recommend performing "Data Export" from the settings screen.

- The creator assumes no responsibility for any troubles or damages that may occur from using this tool. Please understand this.

---

**Developer**: Pike
**Version**: 1.0.3
**Last Updated**: 2025-08-04


### v1.0.3 (2025/08/04)
- Localization support (Japanese/English)
- Evaluation indicator display

### v1.0.2 (2025/07/30)
- Added year-based data retention feature
- Added CSV-compatible data export/import feature
- Real-time average bar updates in individual game screens
- Light orange indication when 'Other' > 0 and 'Review' is empty
- Fixed bugs related to new/update notifications (cases where fewer than actual were displayed)
- Other minor fixes (added links to options, UI adjustments, etc.)

### v1.0.1 (2025/7/23)
- Tick marks for each evaluation item in individual screens and adjustment of "average" text position
- Fixed voting page bulk input button to open web page when pressed
- Added update icon clear button (displayed when [New] button is pressed)

### v1.0.0 (2025/7/20)
- Added input button to voting page (bulk/individual)
- Notification: Fixed to display game numbers

### v0.0.6 (2025/7/17)
- Chrome Store review completed!
- Review of privacy information. Removed alarms and scripts permissions

### v0.0.5 (2025/7/15)
- Set lower limit of 'Other' evaluation to 0
- Added evaluation tick marks and other minor fixes

### v0.0.4 (2025/7/14)
- Changed notification icon for new registrations
- Added notifications for version updates