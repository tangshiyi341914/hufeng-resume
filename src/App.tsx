import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import MyResumesPage from './pages/MyResumesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/my-resumes" element={<MyResumesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
