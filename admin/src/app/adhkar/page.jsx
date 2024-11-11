import AdhkarComp from '@/components/adhkar'
import Sidebar  from '@/layouts/sidebars/Sidebar'
import React from 'react'
import '@/app/adhkar/adhkarcss.css'

const Adhkar = () => {
  return (
    <div className="flex">
        <Sidebar />
        <div
        style={{
            padding: 24,
            minHeight: 360,
            width: "100%",
            // textAlign:'right'
        }}
        >
        <AdhkarComp />
        </div>
  </div>
  )
}

export default Adhkar