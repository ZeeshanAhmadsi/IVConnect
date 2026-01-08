import { useUser } from '@clerk/clerk-react';
import { Navigate, Route, Routes } from 'react-router';
import HomePage from './Pages/HomePage';
import ProblemsPage from './Pages/ProblemsPage';
import ProblemPage from './Pages/problemPage';
import {Toaster} from 'react-hot-toast';
import DashboardPage from './Pages/DashboardPage';

/**
 * Render the application's top-level routes and toast container based on authentication state.
 *
 * While authentication is loading, returns `null` to prevent UI flicker. Once loaded,
 * renders route definitions for "/", "/dashboard", "/problems", and "/problem/:id",
 * conditionally showing pages or redirecting based on whether the user is signed in,
 * and includes a Toaster with a 3000ms duration.
 *
 * @returns {JSX.Element | null} A React element tree containing the Routes and Toaster, or `null` while auth is loading.
 */
function App() {
  const{isSignedIn,isLoaded} = useUser();

  //this will get rid of flickering effect
  if(!isLoaded) return null;
  return (
    <>
    <Routes>
      <Route path="/" element={!isSignedIn ? <HomePage/> : <Navigate to={"/dashboard"}/>}/>
      <Route path="/dashboard" element={isSignedIn ? <DashboardPage/> : <Navigate to={"/"}/>}/>
      <Route path="/problems" element={isSignedIn ? <ProblemsPage/> : <Navigate to={"/"}/>}/>
      <Route path="/problem/:id" element = {isSignedIn ? <ProblemPage/> : <Navigate to={"/"}/>}/>
    </Routes>
    <Toaster toastOptions={{duration:3000}}/>
    </>
  )
}

export default App