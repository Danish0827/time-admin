"use client";
import React, {useEffect, useState } from "react";
import { Button, Modal, Table, Form, Input } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import TextArea from "antd/es/input/TextArea";
import { Switch, Space } from "antd";
import { BACKEND_URL } from "@/app/page";
import { getCookieToken } from "@/layouts/sidebars/Sidebar";
// import featureRow from "@/context/context";

const FeaturesComp = () => {
const token = getCookieToken()
  const [render, setRender] = useState(false);
  // table part
  const [features, setFeatures] = useState([]);
  // console.log(feature);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getFeature`, {
          method:"GET",
          headers:{
            'content-Type':'Application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const featureData = await response.json();
          setFeatures(featureData.features);
        } else {
          console.error("Error fetching feature data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };
    // Fetch data when the component mounts
    fetchData();
  }, [render]);
  
  const columns = [
    {
      title: "Name",
      dataIndex: "feature_name",
    },

    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (status ? "Active" : "Inactive"),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <>
          <Button
            className="bg-yellow-700 hover:bg-yellow-900 px-4 pb-8 mr-2"
            type="primary"
            onClick={() => showModals(record)}
          >
            <EditOutlined className="text-white text-lg flex m-auto" />
          </Button>
          <Button
            className="bg-red-700 hover:bg-red-900 px-4 pb-8"
            type="primary"
            onClick={() => handleDelete(record.feature_id)}
          >
            <DeleteOutlined className="text-white text-lg flex m-auto" />
          </Button>
        </>
      ),
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  //  add features
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [status, setStatus] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState("Content of the modal");

  const handleSwitchChange = (checked) => {
    // console.log(checked);
    setStatus(checked);

    // form.setFieldsValue({ status: checked ? true : false });
  };

  const showModal = () => {
    form.resetFields();
    setOpen(true);
  };
  const handleOk = () => {
    setModalText("The modal will be closed after two seconds");
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };
  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  const onFinish = async (values) => {
    // console.log(values);
    // Map the 'status' field to true or false based on the switch state
    values.status = status;
    try {
      const response = await fetch(`${BACKEND_URL}/api/addFeature`, {
        method: "POST",
        headers:{
          'content-Type':'Application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // Display success message using SweetAlert
        Swal.fire({
          icon: "success",
          title: "Feature Added Successfully!",
          // showConfirmButton: false,
          // timer: 1500,
        });

        // Reset form values
        form.resetFields();
        setRender(!render);
        // You can redirect or perform any other action here
      } else {
        console.error("Error adding feature. Please try again.");
      }
    } catch (error) {
      console.error("Internal Server Error", error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // Update trustee
  const [opens, setOpens] = useState(false);
  const [confirmLoadings, setConfirmLoadings] = useState(false);
  const [modalTexts, setModalTexts] = useState("Content of the moddsdsdsl");
  const [featureId, setfeatureId] = useState(null);
  const showModals = (data) => {
    setfeatureId(data.feature_id);
    // console.log(data.feature_id);
    form.setFieldsValue(data);
    // console.log(data.status);
    setStatus(data.status);
    setOpens(true);
  };

  const handleOks = () => {
    setModalTexts("The modal will be closed after two seconds");
    setConfirmLoadings(true);
    setTimeout(() => {
      setOpens(false);
      setConfirmLoadings(false);
    }, 2000);
  };

  const handleCancels = () => {
    console.log("Clicked cancel button");
    setOpens(false);
  };

  const onFinishs = async (values) => {
    // console.log(values);
    values.status = status;
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/updateFeature/${featureId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Feature Updated Successfully!",
          icon: "success",
        });
        setRender(!render);
        form.resetFields();
        // You can redirect, show a success message, or perform any other action here
      } else {
        console.error("Error updating feature. Please try again.");
      }
    } catch (error) {
      console.error("Internal Server Error", error);
    }
  };

  // delete trustee

  const handleDelete = async (feature_id) => {
    // Show confirmation dialog
    const isConfirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this feature!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (isConfirmed.isConfirmed) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/deleteFeature/${feature_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
          }
        );

        if (response.ok) {
          setRender(!render);
          Swal.fire({
            title: "Success",
            text: "Feature Deleted Successfully!",
            icon: "success",
          });
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
          <h1 className="font-bold text-lg">Our Features</h1>
        </div>
        <div className="w-1/2 text-right">
          <Button
            style={{ backgroundColor: "green" }}
            type="primary"
            onClick={showModal}
          >
            Add Feature
          </Button>
          <Modal
            title="Add Feature"
            open={open}
            onOk={handleOk}
            footer={null}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
            okButtonProps={{ style: { backgroundColor: "green" } }}
          >
            {/* <p>{modalText}</p> */}

            <Form
              form={form}
              className="pt-4"
              name="add"
              labelCol={{ flex: "110px" }}
              labelAlign="left"
              labelWrap
              wrapperCol={{ flex: 1 }}
              colon={false}
              style={{ maxWidth: 600 }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                className=""
                label="Feature Name"
                name="feature_name"
                rules={[{ required: false }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true }]}
              >
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: false }]}
              >
                <Space direction="vertical">
                  <Switch
                    className="bg-black"
                    checked={status}
                    onChange={handleSwitchChange}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                  />
                </Space>
              </Form.Item>

              <Form.Item label=" ">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-green-600"
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
      <Table
        className="pt-5"
        columns={columns}
        dataSource={features}
        onChange={onChange}
        rowKey={(record) => record.feature_id}
      />

      <Modal
        title="Update Feature"
        open={opens}
        onOk={handleOks}
        confirmLoading={confirmLoadings}
        footer={null}
        onCancel={handleCancels}
        okButtonProps={{ style: { backgroundColor: "#fbc02d" } }}
      >
        {/* <p>{modalTexts}</p> */}
        <Form
          form={form}
          className="pt-4"
          name="wraps"
          labelCol={{ flex: "110px" }}
          labelAlign="left"
          labelWrap
          wrapperCol={{ flex: 1 }}
          colon={false}
          style={{ maxWidth: 600 }}
          onFinish={onFinishs}
        >
          {/* Your Form.Item components go here */}
          <Form.Item
            className=""
            label="Feature Name"
            name="feature_name"
            rules={[{ required: false }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Status" name="status" rules={[{ required: false }]}>
            <Space direction="vertical">
              <Switch
                className="bg-black"
                checked={status}
                onChange={handleSwitchChange}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </Space>
          </Form.Item>

          <Form.Item label=" ">
            <Button type="primary" htmlType="submit" className="bg-yellow-700">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FeaturesComp;
