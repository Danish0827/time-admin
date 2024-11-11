"use client";
import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form, Input, Select } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { BACKEND_URL } from "@/app/page";
import { getCookieToken } from "@/layouts/sidebars/Sidebar";
import { FIRESTORE_DB } from "../../firebase";
import { addDoc, collection } from "@firebase/firestore";

const { Option } = Select;

const MasjidComp = () => {
  const token = getCookieToken();
  const [render, setRender] = useState(false);

  const [trustee, setTrustee] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getUsers`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const trusteeData = await response.json();
          setTrustee(trusteeData.users);
        } else {
          console.error("Error fetching users data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };

    fetchData();
  }, [render]);

  const optionse = trustee.map((trustee) => ({
    label: trustee.trustee_name,
    value: trustee.user_id,
    disabled: false,
  }));

  const [selectedValue, setSelectedValue] = useState(null);

  const handleChanges = (value) => {
    console.log("Selected value:", value);
    setSelectedValue(value);
  };

  const [masjid, setMasjid] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getMasjid`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const masjidData = await response.json();
          setMasjid(masjidData.masjid);
          console.log(masjidData.masjid, "masjidData.masjid");
        } else {
          console.error("Error fetching masjid data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    };
    fetchData();
  }, [render]);

  const columns = [
    {
      title: "Masjid Name",
      dataIndex: "masjid_name",
    },
    {
      title: "Trustee Name",
      dataIndex: "trustee_name",
    },

    // {
    //   title: "Maslak",
    //   dataIndex: "maslak",
    // },
    {
      title: "Country",
      dataIndex: "country",
    },
    {
      title: "State",
      dataIndex: "state",
    },
    {
      title: "City",
      dataIndex: "city",
    },
    {
      title: "Area",
      dataIndex: "location",
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
            onClick={() => handleDelete(record.masjid_id)}
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

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const countriesDatas = [
    {
      id: 1,
      name: "UNITED ARAB EMIRATES",
      label: "+971",
      value: 971,
      iso2: "AE",
    },
    {
      id: 2,
      name: "QATAR",
      label: "+974",
      value: 974,
      iso2: "QA",
    },
    {
      id: 3,
      name: "KUWAIT",
      label: "+965",
      value: 965,
      iso2: "KW",
    },
    {
      id: 4,
      name: "UNITED STATES",
      label: "+1",
      value: 1,
      iso2: "US",
    },
    {
      id: 5,
      name: "CANADA",
      label: "+1",
      value: 1,
      code: "CA",
    },
    {
      id: 6,
      name: "AUSTRALIA",
      label: "+61",
      value: 61,
      iso2: "AU",
    },
    {
      id: 7,
      name: "NEW ZEALAND",
      label: "+64",
      value: 64,
      iso2: "NZ",
    },
    {
      id: 8,
      name: "INDIA",
      label: "+91",
      value: 91,
      iso2: "IN",
    },
  ];
  const uniqueCountries = Array.from(
    new Set(countriesDatas.map((country) => country.value))
  ).map((value) => countriesDatas.find((country) => country.value === value));

  const fetchStates = async () => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/states.json"
      );
      const data = await response.json();
      setStates(data);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/cities.json"
      );
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  useEffect(() => {
    fetchStates();
    fetchCities();
  }, []);
  const [finalCountry, setFinalCountry] = useState();
  const handleCountryChange = (value) => {
    const selectedIso2 = value;
    setSelectedCountry(selectedIso2);
    setSelectedState("");
    setSelectedCity("");
    const selectedCountryObj = countriesDatas.find(
      (country) => country.iso2 === selectedIso2
    );
    setFinalCountry(selectedCountryObj ? selectedCountryObj.name : "");
  };
  const [finalState, setFinalState] = useState();
  const handleStateChange = (value) => {
    const selectedIso3 = value;
    setSelectedState(selectedIso3);
    setSelectedCity("");
    const selectedState = filteredStates.find(
      (state) => state.state_code === value
    );
    setFinalState(selectedState ? selectedState.name : "");
    // form.setFieldsValue({ state: selectedState.name });
    // formEdit.setFieldsValue({ state: selectedState.name });
  };

  const handleCityChange = (value) => {
    setSelectedCity(value);
    // const selectedCity = filteredCities.find((city) => city.id === value);
    // form.setFieldsValue({ city: selectedCity.name });
    // formEdit.setFieldsValue({ city: selectedCity.name });
  };

  const filteredStates = states.filter(
    (state) => state.country_code === selectedCountry
  );
  const filteredCities = cities.filter(
    (city) =>
      city.country_code === selectedCountry && city.state_code === selectedState
  );

  // Add masjid modal
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const showModal = () => {
    form.resetFields();
    setOpen(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onFinish = async (values) => {
    // Send the codes to backend
    values.country = finalCountry;
    values.state = finalState;
    values.city = selectedCity;
    // console.log(finalState, "finalState");
    console.log(values, "addvalue");
    // return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/addMasjid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Masjid Added Successfully!",
        });

        form.resetFields();
        setRender(!render);
        setOpen(false);
      } else {
        console.error("Error adding masjid");
      }
    } catch (error) {
      console.error("Internal Server Error", error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // Edit masjid modal
  const [openEdit, setOpenEdit] = useState(false);
  const [formEdit] = Form.useForm();
  const [selectedMasjid, setSelectedMasjid] = useState(null);
  const showModals = (record) => {
    console.log(record.masjid_id, "shaikh");
    setSelectedMasjid(record);
    setSelectedCountry(record.country);
    setSelectedState(record.state);
    setSelectedCity(record.city);

    const selectedCountry = uniqueCountries.find(
      (country) => country.iso2 === record.country
    );
    const selectedState = filteredStates.find(
      (state) => state.state_code === record.state
    );
    const selectedCity = filteredCities.find((city) => city.id === record.city);

    formEdit.setFieldsValue({
      masjid_name: record.masjid_name,
      user_id: record.user_id,
      location: record.location,
      maslak: record.maslak,
      country: selectedCountry ? selectedCountry.name : record.country,
      state: selectedState ? selectedState.name : record.state,
      city: selectedCity ? selectedCity.name : record.city,
    });

    setOpenEdit(true);
  };

  const handleOks = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setOpenEdit(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancels = () => {
    setOpenEdit(false);
  };

  const onFinishEdits = async (values) => {
    values.country = finalCountry;
    values.state = finalState;
    values.city = selectedCity;
    values.masjid_id = selectedMasjid.masjid_id;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/updateMasjid/${values.masjid_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Masjid Updated Successfully!",
        });

        formEdit.resetFields();
        setRender(!render);
        setOpenEdit(false);
      } else {
        console.error("Error updating masjid");
      }
    } catch (error) {
      console.error("Internal Server Error", error);
    }
  };

  const onFinishFaileds = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // Delete masjid
  const handleDelete = async (masjidId) => {
    const isConfirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (isConfirmed.isConfirmed) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/deleteMasjid/${masjidId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Masjid Deleted Successfully!",
          });
          setRender(!render);
        } else {
          console.error("Error deleting masjid");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    }
  };

  return (
    <>
      <div className="flex">
        <div className="w-1/2 text-left">
          <h1 className="font-bold text-lg">Our Masjid</h1>
        </div>
        <div className="w-1/2">
          <Button
            style={{ backgroundColor: "green" }}
            type="primary"
            onClick={showModal}
          >
            Add Masjid
          </Button>
        </div>
      </div>
      <Modal
        title="Add Masjid"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        footer={null}
      >
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
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Masjid Name"
            name="masjid_name"
            rules={[{ required: true, message: "Please enter masjid name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Trustee Name"
            name="user_id"
            rules={[{ required: true, message: "Please select trustee name!" }]}
          >
            <Select
              showSearch
              placeholder="Select a trustee"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={optionse}
            />
          </Form.Item>

          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: "Please select a country!" }]}
          >
            <Select
              showSearch
              placeholder="Select a country"
              onChange={handleCountryChange}
            >
              {uniqueCountries.map((country) => (
                <Option key={country.iso2} value={country.iso2}>
                  {country.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="State"
            name="state"
            rules={[{ required: true, message: "Please select a state!" }]}
          >
            <Select
              showSearch
              placeholder="Select a state"
              value={selectedState}
              onChange={handleStateChange}
              disabled={!selectedCountry}
            >
              {filteredStates.map((state) => (
                <Option key={state.state_code} value={state.state_code}>
                  {state.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: "Please select a city!" }]}
          >
            <Select
              showSearch
              placeholder="Select a city"
              value={selectedCity}
              onChange={handleCityChange}
              disabled={!selectedState}
            >
              {filteredCities.map((city) => (
                <Option key={city.id} value={city.name}>
                  {city.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Area"
            name="location"
            rules={[{ required: true, message: "Please enter location!" }]}
          >
            <Input />
          </Form.Item>
          {/* <Form.Item
            label="Maslak"
            name="maslak"
            rules={[{ required: true, message: "Please enter maslak!" }]}
          >
            <Input />
          </Form.Item> */}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="bg-green-600">
              Add Masjid
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Masjid"
        open={openEdit}
        onOk={handleOks}
        confirmLoading={confirmLoading}
        onCancel={handleCancels}
        footer={null}
      >
        <Form
          form={formEdit}
          className="pt-4"
          name="wraps"
          labelCol={{ flex: "110px" }}
          labelAlign="left"
          labelWrap
          wrapperCol={{ flex: 1 }}
          colon={false}
          style={{ maxWidth: 600 }}
          onFinish={onFinishEdits}
          onFinishFailed={onFinishFaileds}
        >
          <Form.Item
            label="Masjid Name"
            name="masjid_name"
            rules={[{ required: true, message: "Please enter masjid name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Trustee Name"
            name="user_id"
            rules={[{ required: true, message: "Please select trustee name!" }]}
          >
            <Select
              showSearch
              placeholder="Select a trustee"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={optionse}
            />
          </Form.Item>
          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: "Please select a country!" }]}
          >
            <Select
              showSearch
              placeholder="Select a country"
              onChange={handleCountryChange}
            >
              {uniqueCountries.map((country) => (
                <Option key={country.iso2} value={country.iso2}>
                  {country.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="State"
            name="state"
            rules={[{ required: true, message: "Please select a state!" }]}
          >
            <Select
              showSearch
              placeholder="Select a state"
              value={selectedState}
              onChange={handleStateChange}
              disabled={!selectedCountry}
            >
              {filteredStates.map((state) => (
                <Option key={state.state_code} value={state.state_code}>
                  {state.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: "Please select a city!" }]}
          >
            <Select
              showSearch
              placeholder="Select a city"
              value={selectedCity}
              onChange={handleCityChange}
              disabled={!selectedState}
            >
              {filteredCities.map((city) => (
                <Option key={city.id} value={city.name}>
                  {city.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Area"
            name="location"
            rules={[{ required: true, message: "Please enter location!" }]}
          >
            <Input />
          </Form.Item>
          {/* <Form.Item
            label="Maslak"
            name="maslak"
            rules={[{ required: true, message: "Please enter maslak!" }]}
          >
            <Input />
          </Form.Item> */}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="bg-green-600">
              Update Masjid
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        className="pt-5"
        columns={columns}
        dataSource={masjid}
        // loading={loading}
        rowKey="masjid_id"
      />
    </>
  );
};

export default MasjidComp;
