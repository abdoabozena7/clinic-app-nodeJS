# Medical Center Reservation System – Enhanced Features

This project is a full‑stack medical appointment booking system.  It consists of a Node.js/Express backend with a MySQL database (via Sequelize) and a React (Vite) frontend built with Tailwind CSS.  The enhanced version adds support for profile photo uploads, reschedule requests with approval, emergency appointments, manual phone bookings, doctor/rescheduling actions, notification centre, and a user profile page.  It also includes a suite of Jest/Supertest integration tests.

## Getting Started

### Prerequisites

* Node.js (≥ 18.x) and npm
* MySQL (or MariaDB) – install via XAMPP or a local server
* Optional: Git, curl, etc.

### Installation

1. **Clone or extract the repository**

    ```bash
    git clone <repo-url>
    cd final-app
    ```

2. **Backend setup**

    ```bash
    cd server
    npm install
    ```

    The backend expects a `.env` file in `server/` with the following variables (example shown):

    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=clinic_db
    DB_PORT=3306
    JWT_SECRET=supersecret
    PORT=7000
    ```

3. **Database migration & seeding**

    Import the SQL file `server/seed/seed.sql` into your MySQL server.  You can do this via phpMyAdmin:

    * Open phpMyAdmin, create a database named `clinic_db` (if it doesn’t already exist).
    * Click **Import** and choose `seed.sql` from `server/seed/`.
    * Execute the import.

    This will create the necessary tables and seed an admin user (`admin@example.com`/`admin123`), doctors, schedules, and some sample appointments.

4. **Start the backend**

    ```bash
    npm start
    ```

    The backend runs on port `7000` by default.  If you want to develop against a different port, set `PORT` in the `.env` file.

5. **Frontend setup**

    ```bash
    cd ../client
    npm install
    npm run dev
    ```

    The frontend will start on port `3000` and proxy API requests to the backend on port `7000`.

### Tests

The backend includes a small Jest/Supertest test suite to illustrate key flows such as patient reschedule requests and manual bookings.

Run tests from the `server` directory:

```bash
cd server
npm test
```

The test environment uses an in‑memory SQLite DB (via Sequelize) and does not start the HTTP listener.

### Important Endpoints

* **POST /api/auth/register** – Register a patient.
* **POST /api/auth/login** – Log in and receive a JWT.
* **PUT /api/auth/profile** – Update name/email/phone.
* **POST /api/auth/profile/photo** – Upload a profile photo (multipart/form‑data field `photo`).
* **PUT /api/auth/profile/password** – Change password (requires `currentPassword` and `newPassword`).
* **POST /api/appointments** – Book an appointment as a patient.
* **PUT /api/appointments/:id** – Reschedule (patient, doctor or admin).  Patients’ requests go into `pending_reschedule` status until approved by doctor/admin.
* **DELETE /api/appointments/:id** – Cancel (patient, doctor or admin, subject to 24‑hour rule).
* **PUT /api/appointments/:id/complete** – Mark appointment as completed (doctor/admin).  Sends notifications to patient and admin with names.
* **POST /api/admin/appointments/manual** – Admin manual booking using phone number; unregistered numbers are stored in `manualPhone`.
* **GET /api/admin/doctors/:doctorId/bookings** – Admin can view a doctor’s bookings and schedule.
* **GET /api/notifications** – Notification centre for logged‑in users (read/unread, timestamped).

Refer to the controllers and routes for further endpoints (e.g. reschedule approvals, emergency requests).

### Assets & Libraries

* **Tailwind CSS** for styling (configured in `tailwind.config.js`).
* **Lucide React** icons for the notification bell and other icons.  Install via `npm install lucide-react` in the `client` directory if not already installed.
* **Framer Motion** is included for minor animations; you can extend it.  For a richer UI, consider integrating [Lightswind UI](https://lightswind.com) and [Lottie](https://lottiefiles.com/).  This demo uses a minimalist theme; you can customise colours and fonts via Tailwind.
* **Fonts**: In `client/index.html` you can include Google Fonts for Arabic/Latin support:

    ```html
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
    ```

### Developer Notes

* **Profile Photo Location** – Uploaded profile photos are stored on the backend in `server/uploads/profile_photos/` and served statically via the `/uploads/profile_photos/<filename>` path.  When you upload a new photo, the backend returns the relative path; update your frontend to load it via that path.
* **Manual Bookings** – Admins can create appointments by phone number; if the phone matches an existing patient, the appointment is linked.  Otherwise it stays as a `manualPhone` booking for later follow‑up.
* **Reschedule Requests** – When a patient reschedules, the appointment status changes to `pending_reschedule` and a record is inserted into `reschedule_requests`.  Doctors or admins must approve it by using the reschedule requests API (e.g. `/api/reschedule-requests/:id/approve`).
* **Emergency Bookings** – Use the `/api/emergency` routes to create and respond to emergency appointments.  The system will send notifications and automatically schedule if both doctor and admin approve.  You can extend this to hold slots with a TTL.
* **Notifications** – All important actions create notification records.  Users can mark notifications as read individually or all at once.  Notifications include names when possible (e.g. doctor and patient names in completion messages).

### Demo Script

To demonstrate the emergency booking flow:

1. **Patient logs in** and navigates to a doctor’s profile page.  They click **Emergency Response** and choose a slot.
2. The system creates an emergency request (status `pending_emergency`) and sends notifications to the doctor and admins.
3. The doctor logs in, sees the pending request in their dashboard under **Pending Approvals**, and clicks **Approve**.
4. The admin also sees the request in the admin dashboard and approves it.  Once both parties approve, the appointment is created with status `confirmed_emergency` and notifications are sent to the patient.
5. The patient’s dashboard shows the emergency appointment with a special badge.

### Deployment Checklist

1. **Install dependencies** in both `server` and `client` directories (`npm install`).
2. **Configure environment variables** and update `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET` and `PORT`.
3. **Run database migrations** by importing `seed.sql` or using Sequelize migrations if preferred.
4. **Start backend** (`npm start`) and **frontend** (`npm run dev`).  Verify that both communicate correctly (check CORS).
5. **Run tests** to ensure core APIs work (`cd server && npm test`).
6. **Set up CDN or self‑hosted copies** of fonts and Lottie animations if using external assets.
7. **Enable SSL and environment‑specific settings** for production (e.g., environment variables, database credentials, logging).

This completes the enhanced Medical Center Reservation System with new business rules, approval workflows, and a refined user experience.