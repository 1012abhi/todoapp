# Todo Assignment

A full-stack Todo application built with **React Native**, **Node.js**, **Express.js**, and **MongoDB**.

The application allows authenticated users to create, view, update, complete, and delete their personal tasks.

---

## 🚀 Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Protected API routes
- Logout functionality
- User-specific todos

### Todo Management

- Create a todo
- View all todos
- Update todo status
- Mark todo as completed
- Delete todo
- Add task description
- Set task date and time
- Set deadline
- Set task priority

### Priority Levels

- Low
- Medium
- High

### Mobile App

- React Native
- TypeScript
- Native Android support
- Pull-to-refresh
- Add Todo modal
- Date and time picker
- Deadline picker
- Loading states
- Error handling
- Empty state
- Responsive UI

---

# 🏗️ Project Structure

```text
TodoAssignment/
│
├── backend/
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── todo.controller.ts
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Todo.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── todo.routes.ts
│   │   │
│   │   ├── services/
│   │   │   └── ...
│   │   │
│   │   ├── config/
│   │   │   └── db.ts
│   │   │
│   │   └── server.ts
│   │
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/
│   │
│   ├── src/
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── HomeScreen.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   └── todoService.ts
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   │
│   │   └── ...
│   │
│   ├── android/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
