import SubscriptionComp from "@/components/subscription";
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
        }}
      >
        <SubscriptionComp />
      </div>
    </div>
  );
};

export default Trustee;
