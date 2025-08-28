# LazyCal - Local Events Management

A modern, client-side event management application with support for both local storage and Google Sheets synchronization.

## Features

- **Dual View Modes**: Calendar and List views for optimal event visualization
- **Full CRUD Operations**: Create, read, update, and delete events
- **Recurring Events**: Support for daily, weekly, monthly, and yearly recurring patterns
- **Multi-language Support**: English and Italian translations
- **Flexible Data Storage**: Choose between local storage or Google Sheets
- **Geolocation Integration**: Location-based features for events
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Offline-First**: Full functionality without internet connection (local storage mode)

## Data Storage Options

### Local Storage (Default)
- Events stored locally in your browser
- No internet connection required
- Data persists across browser sessions
- Private and secure

### Google Sheets Integration
- Sync events with your Google Sheets
- Access from any device
- Real-time collaboration
- Built-in backup and version history
- Easy data export and sharing

## Google Sheets Setup

To enable Google Sheets integration, you need to:

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. **Create Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

4. **Set up OAuth 2.0**:
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add your domain to authorized origins
   - Copy the client ID

5. **Update Configuration**:
   - Replace the placeholder values in `src/App.tsx`:
   ```typescript
   const GOOGLE_SHEETS_CONFIG = {
     clientId: 'your-actual-client-id.apps.googleusercontent.com',
     apiKey: 'your-actual-api-key',
   };
   ```

## Usage

1. **Local Storage Mode** (Default):
   - Start creating events immediately
   - All data stored locally in your browser

2. **Google Sheets Mode**:
   - Click the settings icon in the header
   - Select "Google Sheets" option
   - Click "Sign in with Google"
   - Authorize the application
   - Your events will be synced to a new Google Spreadsheet

## Event Features

- **Basic Information**: Title, description, URL
- **Location Support**: Name, address, and geolocation coordinates
- **Flexible Timing**: All-day events, specific times, date ranges
- **Recurring Patterns**: Daily, weekly, monthly, yearly with custom intervals
- **End Conditions**: Limit by occurrence count or end date

## Technical Architecture

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Data Layer**: Abstracted service pattern for easy backend integration
- **APIs**: Google Sheets API v4 with OAuth 2.0
- **Storage**: localStorage for local mode, Google Sheets for cloud mode

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Browser Compatibility

- Modern browsers with ES2020 support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers on iOS and Android

## Privacy & Security

- **Local Storage**: All data remains on your device
- **Google Sheets**: Data stored in your personal Google account
- **No Third-party Tracking**: No analytics or tracking scripts
- **OAuth 2.0**: Secure authentication with Google