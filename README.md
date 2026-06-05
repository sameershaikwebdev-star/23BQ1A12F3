# Campus Notifications System

## Overview

This project is a complete implementation of the AffordMed Campus Hiring Assessment.

The system consists of two major stages:

### Stage 1 - Priority Notification Algorithm

A Python-based notification prioritization engine that ranks notifications according to importance and recency.

### Stage 2 - Frontend Application

A Next.js-based frontend application that consumes notification APIs, displays notifications to users, supports filtering, read/unread management, and provides a Priority Inbox view.

---

# Technology Stack

## Frontend

* Next.js 16
* React
* TypeScript
* Material UI (MUI)

## Backend Integration

* AffordMed Notification API
* REST API communication using Fetch API

## Stage 1

* Python 3

---

# Project Structure

```text
# Project Structure

```text
23BQ1A12F3
│
├── stage1
│   ├── priority_inbox.py
│   └── Notification_System_Design.md
│
└── stage2
    ├── app
    │   ├── api
    │   │   └── notifications
    │   │       └── route.ts
    │   ├── components
    │   │   ├── FilterBar.tsx
    │   │   ├── NotificationCard.tsx
    │   │   ├── NotificationsClient.tsx
    │   │   └── ThemeRegistry.tsx
    │   ├── lib
    │   │   └── notifications.ts
    │   ├── utils
    │   │   └── logger.ts
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.module.css
    │   └── page.tsx
    │
    ├── public
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    │
    ├── .gitignore
    ├── eslint.config.mjs
    ├── next-env.d.ts
    ├── next.config.ts
    ├── package-lock.json
    ├── package.json
    └── tsconfig.json
    └── README.md
```

---

# Stage 1 - Priority Inbox Algorithm

## Objective

The objective of Stage 1 is to identify the most important notifications for students.

Instead of displaying all notifications equally, the system calculates a priority score.

## Factors Used

### Notification Type Weight

Placement notifications are considered most important.

```text
Placement = 3
Result = 2
Event = 1
```

### Recency Score

Newer notifications receive higher priority.

The algorithm normalizes timestamps and assigns higher scores to recent notifications.

### Final Score

```text
Priority Score =
(Type Weight × 10)
+
(Recency Score × 5)
```

### Output

Notifications are sorted according to their priority score and the Top N notifications are displayed inside the Priority Inbox.

---

# Stage 2 - Frontend Application

## Features Implemented

### 1. All Notifications View

Displays all notifications received from the API.

Information displayed:

* Notification ID
* Type
* Message
* Timestamp

---

### 2. Priority Inbox

Displays only the highest priority notifications.

Features:

* Top ranked notifications
* Sorted by priority score
* Rank assignment

---

### 3. Notification Filtering

Users can filter notifications by:

* Placement
* Result
* Event

This improves usability and allows quick navigation.

---

### 4. Read / Unread Tracking

Notifications are categorized into:

* Unread Notifications
* Previously Viewed Notifications

Features:

* Mark individual notifications as read
* Mark all notifications as read
* Unread count indicator

---

### 5. Refresh Support

Users can refresh notification data from the API.

---

# API Integration

The application integrates with the AffordMed Notification API.

## Endpoint

```text
GET /evaluation-service/notifications
```

The frontend retrieves notifications and updates the UI dynamically.

---

# Logging Middleware

## Purpose

A reusable logging middleware was implemented as required.

File:

```text
app/utils/logger.ts
```

### Responsibilities

* Log successful API requests
* Log API failures
* Centralized logging implementation

### Example

```typescript
await Log(
  "frontend",
  "info",
  "api",
  "Fetched notifications successfully"
);
```

---

# Error Handling

The system includes:

* API failure handling
* Network failure handling
* User-friendly error messages
* Try-catch protection

---

# Build Verification

The project successfully passes:

## Build

```bash
npm run build
```

Result:

```text
Compiled successfully
Finished TypeScript
Generating static pages
Finalizing page optimization
```

## Lint

```bash
npm run lint
```

No blocking errors remain.

---

# Design Document

The project includes:

```text
Notification_System_Design.md
```

The document explains:

* Architecture
* Data flow
* Priority ranking strategy
* Design decisions

---

# How To Run

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build production version:

```bash
npm run build
```

---

# Assessment Requirements Covered

| Requirement           | Status    |
| --------------------- | --------- |
| Stage 1 Algorithm     | Completed |
| Priority Inbox        | Completed |
| Next.js Frontend      | Completed |
| API Integration       | Completed |
| Read / Unread Support | Completed |
| Filtering             | Completed |
| Logging Middleware    | Completed |
| Error Handling        | Completed |
| Design Document       | Completed |
| Production Build      | Completed |

---

# Author

Sameer Shaik

AffordMed Campus Hiring Assessment Submission
