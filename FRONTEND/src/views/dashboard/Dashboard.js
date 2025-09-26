
import axios from "axios";


import React, { Suspense, useEffect, useState} from 'react'


const Dashboard = () => {



  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  console.log("Token:", token)
  console.log("Usuario:", usuario?.nombre)

  const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  window.location.href = '/login'
  }

  return (
    <div className="p-6">
      

      <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
      
   
    </div>
      
    </div>

  )
}

export default Dashboard
