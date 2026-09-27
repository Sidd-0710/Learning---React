// Entry point: this is where React takes over the page.
// Lesson 01 (JSX & rendering) explains every line of this file.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './viewer.css';
import LessonViewer from './LessonViewer.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LessonViewer />
  </StrictMode>,
);
