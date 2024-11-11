import Sidebar from "@/layouts/sidebars/Sidebar";
import DashboardComp from "@/components/dashboard";
import React from "react";

const Dashboard = () => {
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
        <DashboardComp />
      </div>
    </div>
  );
};

export default Dashboard;
