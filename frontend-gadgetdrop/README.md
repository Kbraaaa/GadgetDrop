# GadgetDrop — frontend

This is the frontend for the GadgetDrop project (React + Vite + Tailwind).

Quick start

```powershell
cd frontend-gadgetdrop
npm install
npm run dev
```

Open the URL reported by Vite (e.g. http://localhost:5173 or http://localhost:5174).

Backend API: http://localhost:5000 (endpoints: `/api/productos`, `/api/auth`, `/api/pedidos`, `/api/admin/pedidos`)

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
