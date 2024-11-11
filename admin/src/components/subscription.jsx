"use client";
import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form, Input, Checkbox, Select, Typography } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import TextArea from "antd/es/input/TextArea";
import { Switch, Space } from "antd";
import { BACKEND_URL } from "@/app/page";
import { getCookieToken } from "@/layouts/sidebars/Sidebar";

const { Title } = Typography;

const SubscriptionComp = () => {
const token = getCookieToken()
  const [render, setRender] = useState(false);
  // table part
  const [subscription, setSubscription] = useState([]);
  // console.log(subscription);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${BACKEND_URL}/api/getSubscription`,{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      try {
        if (response.ok) {
          const SubscriptionData = await response.json();
          // console.log(SubscriptionData,"asasas");
          setSubscription(SubscriptionData.plan);
        } else {
          console.error("Error fetching Subscription data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };
    // Fetch data when the component mounts
    fetchData();
  }, [render]);
  const [features, setFeatures] = useState([]);
  // console.log(features);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${BACKEND_URL}/api/getFeature`,{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      try {
        if (response.ok) {
          const featuresData = await response.json();
          setFeatures(featuresData.features);
        } else {
          console.error("Error fetching features data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };
    // Fetch data when the component mounts
    fetchData();
  }, [render]);

  const options = features
    .filter((feature) => feature.status === true)
    .map((feature) => ({
      label: feature.feature_name,
      value: feature.feature_id,
      disabled: false, // You can set disabled based on your condition
    }));
  const handleChange = (value) => {
    // console.log(`selected ${value}`);
  };


  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getCountry`,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });

        if (response.ok) {
          const countriesData = await response.json();
          setCountries(countriesData);
        } else {
          console.error("Error fetching countries data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };

    // Fetch data when the component mounts
    fetchData();
  }, [render]);

  const optionse = countries.map((country) => ({
    label: country.country_name,
    value: country.country_id,
    prefix: country.Symbol,
    disabled: false, // You can set disabled based on your condition

  }));

  const handleChanges = (value) => {
    console.log("Selected value:", value);
  };
 
  const columns = [
    {
      title: "Plan Name",
      dataIndex: "plan_name",
    },

    {
      title: "Plan Details",
      dataIndex: "plan_details",
    },
    // {
    //   title: "Plan Duration",
    //   dataIndex: "plan_duration",
    // },
    {
      title: 'Status',
      dataIndex: 'status',
      key: "status",
      render: (status,record) => {
        return record.status ? "Active" : "Inactive";
      },
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
            onClick={() => handleDelete(record.plan_id)}
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
  
  //  add trustee
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [status, setStatus] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState("Content of the modal");

  const handleSwitchChange = (checked) => {
    console.log(checked);
    setStatus(checked);
    // console.log(`switch to ${checked}`);
    // form.setFieldsValue({ status: checked ? true : false });
  };

  const showModal = () => {
    form.resetFields();
    form.setFieldValue('plan_feature', features.filter(item => item.status).map(option => option.feature_id))
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
    values.status = status;
    console.log(values);
    // Map the 'status' field to true or false based on the switch state

    try {
      const response = await fetch(`${BACKEND_URL}/api/addSubscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // Display success message using SweetAlert
        Swal.fire({
          icon: "success",
          title: "Subscription Added Successfully!",
          icon: "success",
          // showConfirmButton: false,
          // timer: 1500,
        });

        // Reset form values
        form.resetFields();
        setRender(!render);
        // You can redirect or perform any other action here
      } else {
        console.error("Error Adding Subscription. Please try again.");
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
  const [subscriptionid, setsubscriptionid] = useState(null);
  const showModals = (data) => {
    
    setsubscriptionid(data.plan_id);
    // console.log(data.plan_id);
    
    setStatus(data.plan_status);
    form.setFieldsValue(data);
    setStatus(data.status);
    // form.setFieldsValue(data.durations.duration_id);
    // form.setFieldValue('plan_feature', features.filter(item => item.status).map(option => option.feature_id))
  
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
        `${BACKEND_URL}/api/updateSubscription/${subscriptionid}`,
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
          text: "Subscription Updated Successfully!",
          icon: "success",
        });
        setRender(!render);
        // form.resetFields();
        // You can redirect, show a success message, or perform any other action here
      } else {
        console.error("Error Updating Subscription. Please try again.");
      }
    } catch (error) {
      console.error("Internal Server Error", error);
    }
  };

  // delete trustee

  const handleDelete = async (plan_id) => {
    // Show confirmation dialog
    const isConfirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this Subscription!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (isConfirmed.isConfirmed) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/deleteSubscription/${plan_id}`,
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
            text: "Subscription Deleted Successfully!",
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
          <h1 className="font-bold text-lg">Our Subscription</h1>
        </div>
        <div className="w-1/2 text-right">
          <Button
            style={{ backgroundColor: "green" }}
            type="primary"
            onClick={showModal}
          >
            Add Subscription
          </Button>
          <Modal
            title="Add Subscription"
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
                label="Plan Name"
                name="plan_name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Plan Details"
                name="plan_details"
                rules={[{ required: true }]}
              >
                <TextArea rows={2} />
              </Form.Item>

              <Form.Item
                label="Plan Features"
                name="plan_feature"
                rules={[{ required: false }]}
                labelCol={{ style: { alignItems: 'flex-end' } }}
              >
                <Select
                  mode="multiple"
                  style={{
                    width: "100%",
                    padding: "10px 0px"
                  }}
                  placeholder="Please select"
                  options={options}
                  onChange={handleChange}
                />
              </Form.Item>

              <Form.Item
                label="Country"
                name="country_id"
                rules={[{ required: false }]}
                initialValue={103}
              >
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="Please select"
                  options={optionse}
                  filterOption={(inputValue, option) =>
                    option.label.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                  }
                  onChange={handleChanges}
                />
              </Form.Item>

              <Form.Item
                label="Plan Duration"
                rules={[{ required: true }]}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Form.Item name="monthly" className="m-0" valuePropName="checked" initialValue={false}>
                      <Checkbox />
                    </Form.Item>
                    <Form.Item
                      label="Monthly"
                      name="monthly_price"
                      className="m-0"
                      initialValue={0}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (getFieldValue('monthly') && value <= 0) {
                              return Promise.reject('Value must be greater than 0');
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input style={{ width: "50%", color: "black" }} prefix={optionse.prefix} onFocus={(event) => event.target.select()}/>
                    </Form.Item>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <Form.Item name="quarterly" className="m-0" valuePropName="checked" initialValue={false}>
                      <Checkbox />
                    </Form.Item>
                    <Form.Item
                      label="Quarterly"
                      name="quarterly_price"
                      className="m-0"
                      initialValue={0}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (getFieldValue('quarterly') && value <= 0) {
                              return Promise.reject('Value must be greater than 0');
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input style={{ width: "50%", color: "black" }} prefix={optionse.prefix} onFocus={(event) => event.target.select()}/>
                    </Form.Item>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <Form.Item name="yearly" className="m-0" valuePropName="checked" initialValue={false}>
                      <Checkbox />
                    </Form.Item>
                    <Form.Item
                      label="Yearly"
                      name="yearly_price"
                      className="m-0"
                      initialValue={0}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (getFieldValue('yearly') && value <= 0) {
                              return Promise.reject('Value must be greater than 0');
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input style={{ width: "50%", color: "black" }} prefix={optionse.prefix} onFocus={(event) => event.target.select()}/>
                    </Form.Item>
                  </div>
                </div>
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

              <Form.Item label="">
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
        dataSource={subscription}
        onChange={onChange}
        rowKey={(record) => record.plan_id}
      />

      <Modal
        title="Update Subscription"
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
            label="Plan Name"
            name="plan_name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Plan Detail"
            name="plan_details"
            rules={[{ required: true }]}
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
                label="Plan Features"
                name="plan_feature"
                rules={[{ required: false }]}
                labelCol={{ style: { alignItems: 'flex-end' } }}
              >
                <Select
                  mode="multiple"
                  style={{
                    width: "100%",
                    padding: "10px 0px"
                  }}
                  placeholder="Please select"
                  options={options}
                  onChange={handleChange}
                />
              </Form.Item>
             

              <Form.Item
                label="Country"
                name="country_id"
                rules={[{ required: false }]}
                // initialValue={103}
              >
                <Select
                  showSearch
                  style={{ width: "100%", color: "black" }} 
                  placeholder={<span style={{ color: "black" }}>Please select</span>}
                  options={optionse}
                  filterOption={(inputValue, option) =>
                    option.label.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                  }
                  onChange={handleChanges}
                  disabled
                />
              </Form.Item>

              <Form.Item
                label="Plan Duration"
                rules={[{ required: true }]}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Form.Item name="monthly" className="m-0" valuePropName="checked">
                      <Checkbox disabled/>
                    </Form.Item>
                    <Form.Item
                      label="Monthly"
                      name="monthly_price"
                      className="m-0"
                      // initialValue={0}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (getFieldValue('monthly') && value <= 0) {
                              return Promise.reject('Value must be greater than 0');
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input style={{ width: "50%", color: "black" }} prefix={optionse.prefix} onFocus={(event) => event.target.select()} disabled/>
                    </Form.Item>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <Form.Item name="quarterly" className="m-0" valuePropName="checked">
                      <Checkbox disabled/>
                    </Form.Item>
                    <Form.Item
                      label="Quarterly"
                      name="quarterly_price"
                      className="m-0"
                      // initialValue={0}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (getFieldValue('quarterly') && value <= 0) {
                              return Promise.reject('Value must be greater than 0');
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input style={{ width: "50%", color: "black" }} prefix={optionse.prefix} onFocus={(event) => event.target.select()} disabled/>
                    </Form.Item>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <Form.Item name="yearly" className="m-0" valuePropName="checked">
                      <Checkbox disabled/>
                    </Form.Item>
                    <Form.Item
                      label="Yearly"
                      name="yearly_price"
                      className="m-0"
                      // initialValue={0}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (getFieldValue('yearly') && value <= 0) {
                              return Promise.reject('Value must be greater than 0');
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input style={{ width: "50%", color: "black" }} prefix={optionse.prefix} onFocus={(event) => event.target.select()} disabled/>
                    </Form.Item>
                  </div>
                </div>
              </Form.Item>

          <Form.Item label="Status" name="plan_status" rules={[{ required: false }]}>
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

export default SubscriptionComp;
