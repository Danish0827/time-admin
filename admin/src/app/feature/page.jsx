import React from "react";
import FeaturesComp from "@/components/features";
import Sidebar from "@/layouts/sidebars/Sidebar";

const Features = () => {
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
        <FeaturesComp />
      </div>
    </div>
  );
};

export default Features;
