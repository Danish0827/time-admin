import TrusteeComp from "@/components/trustee";
import Sidebar from "@/layouts/sidebars/Sidebar";
import React from "react";

const Trustee = () => {
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
        <TrusteeComp />
      </div>
    </div>
  );
};

export default Trustee;
