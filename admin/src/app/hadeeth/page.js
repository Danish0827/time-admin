import HadeethComp from '@/components/hadeeth'
import  Sidebar  from '@/layouts/sidebars/Sidebar'
import React from 'react'

const Hadeeth = () => {
  return (
    <div className="flex">
      <Sidebar />

      <div
        style={{
          padding: 24,
          minHeight: 360,
          width: "100%",
        //   textAlign: "right",
        }}
      >
        <HadeethComp />
      </div>
    </div>
  )
}

export default Hadeeth