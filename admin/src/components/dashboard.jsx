"use client";
import React, { useContext } from "react";
import { Card, Col, Row } from "antd";
import UserContext from "@/context/context";
import Link from "next/link";
import Postgress from "./Demo";

const DashboardComp = () => {
  const { user } = useContext(UserContext);
  const { masjids } = useContext(UserContext);
  const { features } = useContext(UserContext);
  const { splan } = useContext(UserContext);
  const { hadeeths } = useContext(UserContext);

  // console.log(user);
  return (
    <>
      <div className="flex">
        <div className="w-1/2 text-left">
          <h1 className="font-bold text-lg">Our Dashboard</h1>
        </div>
        <div className="w-1/2 text-right"></div>
      </div>
      <Row className="pt-3 my-3" gutter={16}>
        <Col className="mb-3 rounded-lg" span={8}>
          <Link href="/trustee">
            <Card
              style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
              className="bg-[#a07ff9] text-white text-xl"
              title={<h3 className="text-white">Our Trustees</h3>}
              bordered={false}
            >
              Total Trustees : {user || 0}
            </Card>
          </Link>
        </Col>
        <Col className="mb-3 rounded-lg" span={8}>
          <Link href="/masjid">
            <Card
              style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
              className=" bg-[#4bbd88] text-white text-xl"
              title={<h3 className="text-white">Our Masjid</h3>}
              bordered={false}
            >
              Total Masjid : {masjids || 0}
            </Card>
          </Link>
        </Col>
        <Col className="mb-3 rounded-lg" span={8}>
          <Link href="/feature">
            <Card
              style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
              className=" bg-[#a71193] text-white text-xl"
              title={<h3 className="text-white">Our Features</h3>}
              bordered={false}
            >
              Total Features : {features || 0}
            </Card>
          </Link>
        </Col>
        <Col className="mb-3 rounded-lg" span={8}>
          <Link href="/hadeeth">
            <Card
              style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
              className=" bg-[#aeb82a] text-white text-xl"
              title={<h3 className="text-white">Our Hadeeth</h3>}
              bordered={false}
            >
              Total Hadeeth : {hadeeths || 0}
            </Card>
          </Link>
        </Col>
        <Col className="mb-3 rounded-lg" span={8}>
          <Link href="/subscription">
            <Card
              style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
              className=" bg-[#ff3300] text-white text-xl"
              title={<h3 className="text-white">Our Subscription</h3>}
              bordered={false}
            >
              Total Subscription : {splan || 0}
            </Card>
          </Link>
        </Col>
      </Row>
      {/* {
      window.innerWidth > 3000 && 
      <Postgress/>
 } */}
    </>
  );
};

export default DashboardComp;
