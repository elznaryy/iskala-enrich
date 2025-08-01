# iSkala Enrich App

A full-stack web application for enriching leads with phone numbers and email addresses using the BetterContact API.

## Features

- **Individual Lookup**: Manually input contact data to retrieve phone numbers, email addresses, or both
- **File Enrichment**: Upload CSV or XLSX files for bulk lead enrichment
- **Real-time Progress Tracking**: Monitor enrichment requests with automatic polling
- **Export Results**: Download enriched data in CSV format
- **Modern UI**: Built with Next.js, React, and TailwindCSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS
- **File Processing**: PapaParse (CSV), XLSX (Excel)
- **API Integration**: BetterContact API v2
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- BetterContact API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iskala-enrich
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your BetterContact API key to `.env.local`:
```env
BETTERCONTACT_API_KEY=your_bettercontact_api_key_here
NEXT_PUBLIC_APP_NAME=iSkala Enrich
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Individual Lookup

1. Navigate to `/enrich/individual`
2. Select enrichment type:
   - **Email** (1 credit): First name, Last name, Company name or Domain
   - **Phone** (10 credits): LinkedIn profile URL
   - **Both** (11 credits): All fields above
3. Fill in required fields
4. Click "Start Enrichment"
5. Wait for results (polling every 10 seconds)
6. Export results to CSV

### File Enrichment

1. Navigate to `/enrich/file`
2. Upload CSV or XLSX file
3. Select enrichment type
4. Map columns to required fields
5. Click "Start Enrichment"
6. Monitor progress and download results

## API Endpoints

### Individual Enrichment
- `POST /api/enrich/individual`
  - Body: `{ data: [...], enrich_email: boolean, enrich_phone: boolean }`

### File Enrichment
- `POST /api/enrich/file`
  - Body: `{ data: [...], enrich_email: boolean, enrich_phone: boolean, fileName: string, sheetName?: string }`

### Results Polling
- `GET /api/enrich/results?requestId={id}`

## File Structure

```
/app
  /api/enrich
    /individual/route.ts
    /file/route.ts
    /results/route.ts
  /enrich
    /individual/page.tsx
    /file/page.tsx
  /globals.css
  /layout.tsx
  /page.tsx
/components
  /InputField.tsx
  /ResultTable.tsx
  /ColumnMapper.tsx
/utils
  /betterContactApi.ts
  /parseFile.ts
```

## BetterContact API Integration

The app integrates with BetterContact API v2 for lead enrichment:

- **Async API**: Uses `/api/v2/async` for batch processing
- **Polling**: Checks status every 10 seconds until completion
- **Custom Fields**: Adds UUID and list name for tracking
- **Error Handling**: Graceful error handling with user feedback

## Pricing

- Email Address Enrichment: 1 credit per lookup
- Phone Number Enrichment: 10 credits per lookup
- Both Email & Phone: 11 credits per lookup

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

- `BETTERCONTACT_API_KEY` - Your BetterContact API key
- `NEXT_PUBLIC_APP_NAME` - Application name

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 