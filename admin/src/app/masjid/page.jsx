import React from "react";
import Sidebar from "@/layouts/sidebars/Sidebar";
import MasjidComp from "@/components/masjid";


const Masjid = () => {
  return (
    <div className="flex">
      <Sidebar />

      <div
        style={{
          padding: 24,
          minHeight: 360,
          width: "100%",
          textAlign: "right",
        }}
      >
        <MasjidComp />
      </div>
    </div>
  );
};
export default Masjid