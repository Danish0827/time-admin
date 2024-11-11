"use client";
import {
  Form,
  Modal,
  Table,
  Button,
  Input,
  DatePicker,
  Space,
  Select,
} from "antd";
import Swal from "sweetalert2";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useState } from "react";
import { BACKEND_URL } from "@/app/page";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import moment from "moment";
import dayjs from "dayjs";
import { getCookieToken } from "@/layouts/sidebars/Sidebar";

const UserplanComp = () => {
  const token = getCookieToken()

  const [render, setRender] = useState(false);

  //Table Section
  const [userSubData, setUserSubData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getPlanSubscription`,{
          headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        });

        if (response.ok) {
          const userSubData = await response.json();
          setUserSubData(userSubData);
        } else {
          console.error("Error Fetching Hadeeth Data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };
    fetchData();
  }, [render]);
  const columns = [
    {
      title: "Trustee Name",
      dataIndex: "trustee_name",
    },
    {
      title: "Masjid Name",
      dataIndex: "masjid_name",
    },
    {
      title: "Contact No",
      dataIndex: "trustee_number",
    },
    {
      title: "Start",
      dataIndex: "start_date",
    },
    {
      title: "End",
      dataIndex: "end_date",
    },
    {
      title: "Plan",
      dataIndex: "duration_type",
    },
    {
      title: "Currency",
      dataIndex: "country_currency",
    },
    {
      title: "Amount",
      dataIndex: "amount_paid",
    },
    {
      title: "Status",
      dataIndex: "payment_status",
    }
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

 

  const [convergencesData, setConvergenceData] = useState();
  const updateConvergence = async () => {
    const isConfirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You want to update latest convergence!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#fbc02d",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, update it!",
    });
    if (isConfirmed.isConfirmed) {
      try {
        const dataconvergence = await fetch(
          `https://open.er-api.com/v6/latest/AED`
        );
        if (dataconvergence.ok) {
          const convergenceData = await dataconvergence.json();
          setConvergenceData(convergenceData.rates);
        }
        const response = await fetch(`${BACKEND_URL}/api/updateConvergence`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ convergencesData }),
        });

        if (response.ok) {
          Swal.fire({
            title: "Success",
            text: "Updated Latest Convergence Successfully!",
            icon: "success",
          });
          setRender(!render);
        }
      } catch (error) {
        console.log("Error Deleting Product", error);
      }
    }
  };
  return (
    <>
      <div className="flex">
        <div className="w-1/2 text-left">
          <h1 className="font-bold text-lg">Our User Subscription Plan</h1>
        </div>
        <div className="w-1/2 text-right">
          <Button
            style={{ backgroundColor: "green" }}
            type="primary"
            onClick={updateConvergence}
          >
            Update Convergence
          </Button>          
        </div>
      </div>
      <Table
        className="pt-5"
        columns={columns}
        dataSource={userSubData}
        onChange={onChange}
        rowKey={(record) => record.hadeeth_id}
      />
    </>
  );
};

export default UserplanComp;
