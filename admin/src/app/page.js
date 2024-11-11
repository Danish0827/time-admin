// import Login from '@/components/login'
import React from 'react'
import Dashboard from './dashboard/page';

const Home = () => {
  console.log(process.env.BACKEND);
  return (
    <>
    <Dashboard />
    </>
   
  )
}

export default Home
export const BACKEND_URL = process.env.BACKEND