import { useUser } from '@clerk/clerk-react';
import { Navigate, Route, Routes } from 'react-router';
import HomePage from './Pages/HomePage';
import ProblemsPage from './Pages/ProblemsPage';
import {Toaster} from 'react-hot-toast';

/**
 * Root application component that defines routing and global toast configuration.
 *
 * Renders the HomePage at "/" and renders ProblemsPage at "/problems" when the user is signed in,
 * otherwise redirects to "/". Also mounts a global Toaster with a 3000ms default duration.
 *
 * @returns {JSX.Element} The application's rendered routes and global Toaster.
 */
function App() {
  const{isSignedIn} = useUser();
  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/problems" element={isSignedIn ? <ProblemsPage/> : <Navigate to={"/"}/>}/>
    </Routes>
    <Toaster toastOptions={{duration:3000}}/>
    </>
  )
}

export default App