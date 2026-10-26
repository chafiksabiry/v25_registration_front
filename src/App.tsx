import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { getAppRouter } from './router';

function App() {
  const router = React.useMemo(() => getAppRouter(), []);
  return <RouterProvider router={router} />;
}

export default App;
