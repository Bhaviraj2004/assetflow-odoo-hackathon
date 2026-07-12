# AssetFlow - Enterprise Asset Management Platform

AssetFlow is a modern, intuitive asset management platform designed to simplify workflows and bring complete visibility to your organization's resources. Built for the Odoo Hackathon, it streamlines the entire lifecycle of hardware and software assets from procurement to disposal.

## Key Features

- **Role-Based Access Control**: Specialized dashboards and workflows tailored for Admin, Asset Manager, Department Head, and Employee roles.
- **User Profile Management**: Users can view and edit their profiles, including uploading profile pictures (compressed in-browser and hosted via Cloudinary).
- **Asset Management**: Complete lifecycle management, tracking, and organization of organizational assets.
- **Resource Booking**: Employees can seamlessly request and book assets for temporary use.
- **Maintenance Tracking**: Schedule, log, and track maintenance tasks for all hardware to reduce downtime.
- **Asset Audits**: Built-in tools for performing and logging comprehensive asset audits.
- **Analytics and Reporting**: Visual charts representing total assets, allocations, maintenance schedules, and overall system status.
- **Activity Logs**: Track all system actions and modifications for security and compliance purposes.

## Technology Stack

- **Frontend**: React, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Backend & Database**: Firebase Realtime Database
- **Authentication**: Firebase Authentication
- **Media Hosting**: Cloudinary API (for Profile Pictures)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase Account
- A Cloudinary Account (for image uploads)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bhaviraj2004/assetflow-odoo-hackathon.git
   cd assetflow-odoo-hackathon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   - Create a Firebase project.
   - Enable Authentication (Email/Password provider).
   - Enable Realtime Database.
   - Update the Firebase configuration object in `src/lib/firebase.js` with your project's credentials.
   - Apply the database security rules found in `firebaseextra/database.rules.json`.

4. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Cloudinary credentials for profile picture uploads:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   Open your browser and navigate to `http://localhost:5173`.

## Roles & Permissions Overview

- **Admin**: Full system access, global user management, global reports, and overarching platform control.
- **Asset Manager**: Manage inventory, approve or reject asset bookings, schedule maintenance, and perform audits.
- **Department Head**: View department-specific assets, approve departmental requests, and monitor team usage.
- **Employee**: View personally assigned assets, request new resources, report issues, and manage their own profile.

## License

This project was specifically created for the Odoo Hackathon.
