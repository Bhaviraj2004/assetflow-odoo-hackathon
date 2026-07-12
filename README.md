# AssetFlow

AssetFlow is a modern, intuitive asset management platform designed to simplify workflows and bring complete visibility to your organization's resources. Built for the Odoo Hackathon.

## Features

- Role-Based Access Control: Specialized dashboards and workflows for Admin, Asset Manager, Department Head, and Employee roles.
- Asset Management: Complete lifecycle management from registration to disposal.
- Resource Booking: Allow employees to request and book assets.
- Maintenance Tracking: Schedule and track maintenance tasks for all hardware.
- Audits: Built-in tools for performing and logging asset audits.
- Analytics and Reporting: Visual charts for total assets, allocations, maintenance, and status.
- Activity Logs: Track all system actions for security and compliance.

## Technology Stack

- Frontend: React, Vite, Tailwind CSS
- Routing: React Router
- Charts: Recharts
- Icons: Lucide React
- Backend / Database: Firebase Realtime Database
- Authentication: Firebase Authentication

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Firebase Account

### Installation

1. Clone the repository
2. Install dependencies:
   npm install

3. Set up Firebase:
   - Create a Firebase project and enable Authentication (Email/Password) and Realtime Database.
   - Configure your Firebase credentials in src/lib/firebase.js.

4. Run the development server:
   npm run dev

5. Open your browser and navigate to http://localhost:5173.

## Roles Overview

- Admin: Full system access, user management, global reports.
- Asset Manager: Manage inventory, approve bookings, schedule maintenance.
- Department Head: View department assets, approve departmental requests.
- Employee: View assigned assets, request new resources, report issues.

## License

This project was created for the Odoo Hackathon.
