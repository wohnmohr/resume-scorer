# AI Resume Reviewer

A micro-SaaS application that uses AI to analyze and improve resumes. Built with Next.js, TypeScript, TailwindCSS, and OpenAI GPT-4.

## Features

- **PDF Upload & Preview**: Upload PDF resumes with in-browser preview using PDF.js
- **AI Analysis**: Get instant feedback with scores (0-100) and actionable suggestions
- **Resume Regeneration**: AI-powered resume rewriting for improved impact
- **Free Tier**: One free analysis per user
- **Payment Integration**: Razorpay integration for premium features
- **Modern UI**: Clean, responsive design with TailwindCSS

## Tech Stack

- **Frontend**: Next.js 15.5.4, React 19.1.0, TypeScript 5, TailwindCSS 4
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4 (openai 5.23.1)
- **PDF Processing**: pdf-parse 1.1.1, pdf-lib 1.17.1
- **Payments**: Razorpay 2.9.6
- **File Upload**: react-dropzone 14.3.8
- **Development**: ESLint 9, Turbopack (Next.js)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- Razorpay account (for payments)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd resume-critique
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your API keys:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Razorpay Keys (Test Mode)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

5. Run the development server:

```bash
npm run dev
```

The development server uses Turbopack for faster builds and hot reloading.

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### `/api/extract-pdf`

- **Method**: POST
- **Body**: `FormData with PDF file`
- **Response**: `{ text: string, pageCount: number, characterCount: number, metadata: object }`
- **Description**: Extracts text content from uploaded PDF files

### `/api/analyze`

- **Method**: POST
- **Body**: `{ text: string }`
- **Response**: `{ score: number, suggestions: string[], hasUsedFreeTier: boolean }`
- **Description**: Analyzes resume text and provides scoring with suggestions

### `/api/regenerate`

- **Method**: POST
- **Body**: `{ text: string }`
- **Response**: `{ text: string }` (requires premium)
- **Description**: Generates improved resume content using AI

### `/api/create-order`

- **Method**: POST
- **Body**: `{ amount: number }`
- **Response**: `{ orderId: string, amount: number, currency: string }`
- **Description**: Creates Razorpay payment order for premium features

### `/api/verify-payment`

- **Method**: POST
- **Body**: `{ razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }`
- **Response**: `{ success: boolean, isPremium: boolean }`
- **Description**: Verifies Razorpay payment and grants premium access

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts
│   │   ├── extract-pdf/route.ts
│   │   ├── create-order/
│   │   ├── regenerate/
│   │   └── verify-payment/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AnalysisResults.tsx
│   ├── FileUploader.tsx
│   └── PDFPreview.tsx
└── types/
```

## Key Components

### FileUploader

- Drag and drop PDF upload
- File validation
- Visual feedback for upload states

### PDFPreview

- PDF rendering using PDF.js
- Text extraction for analysis
- Page navigation for multi-page PDFs

### AnalysisResults

- Score display with visual indicators
- Suggestion list with actionable items
- Tabbed interface for analysis vs. improved resume
- Payment integration for premium features

## Payment Flow

1. User uploads and analyzes resume (free)
2. User clicks "Generate Improved Resume"
3. If not premium, Razorpay checkout modal opens
4. After successful payment, user gains premium access
5. User can now regenerate resume unlimited times

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 access | Yes |
| `RAZORPAY_KEY_ID` | Razorpay public key | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | Yes |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay key for frontend | Yes |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Production Considerations

1. **Database**: Replace in-memory storage with a proper database (PostgreSQL, MongoDB)
2. **User Authentication**: Implement proper user accounts
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Error Monitoring**: Add error tracking (Sentry)
5. **Analytics**: Add usage analytics
6. **Security**: Implement proper security headers and validation

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support, email support@airesumereviewer.com or create an issue in the repository.