"use client";
import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form, Input, Select, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { BACKEND_URL } from "@/app/page";
import { getCookieToken } from "@/layouts/sidebars/Sidebar";

const { Option } = Select;
const TrusteeComp = () => {
  const token = getCookieToken();
  const [render, setRender] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  // console.log(countryCode, "countryCodecountryCode");
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://backend.salahpulse.com/api/getCountry`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const countriesData = await response.json();
          setCountries(countriesData);
          // console.log(countriesData);
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
    value: country.country_name,
    prefix: country.Symbol,
    disabled: false, // You can set disabled based on your condition
  }));

  const options = countries.map((country) => ({
    label: `+${country.phone}`,
    value: country.phone,
    // prefix: country.Symbol,
    disabled: false,
  }));

  const handleChange = (value) => {
    const countrycode = `+${value}`;
    setCountryCode(countrycode);
    updatePhone(countrycode, phoneNumber);
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setPhoneNumber(phone);
    updatePhone(countryCode, phone);
  };

  const updatePhone = (countryCode, phone) => {
    const fullPhone = `${countryCode} ${phone}`;
    form.setFieldsValue({ phone: fullPhone });
  };
  const handleChanges = (value) => {
    // console.log("Selected value:", value);
  };

  // table part
  const [users, setUsers] = useState([]);
  // console.log(users);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getUsers`, {
          method: "GET",
          headers: {
            "content-Type": "Application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const usersData = await response.json();
          setUsers(usersData.users);
        } else {
          console.error("Error fetching users data");
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
      title: "Trustee Name",
      dataIndex: "trustee_name",
    },
    {
      title: "Phone",
      dataIndex: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
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
      dataIndex: "area",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <>
          <Button
            className="bg-yellow-700 hover:bg-yellow-900 px-4 pb-8 mr-2 mb-2"
            type="primary"
            onClick={() => showModals(record)}
          >
            <EditOutlined className="text-white text-lg flex m-auto" />
          </Button>
          <Button
            className="bg-red-700 hover:bg-red-900 px-4 pb-8 mb-2"
            type="primary"
            onClick={() => handleDelete(record.user_id)}
          >
            <DeleteOutlined className="text-white text-lg flex m-auto" />
          </Button>
        </>
      ),
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    // console.log("params", pagination, filters, sorter, extra);
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
    // setSelectedState("");
    // setSelectedCity("");
    const selectedCountryObj = countriesDatas.find(
      (country) => country.iso2 === selectedIso2
    );
    setFinalCountry(selectedCountryObj ? selectedCountryObj.name : "");
  };
  const [finalState, setFinalState] = useState();
  const handleStateChange = (value) => {
    const selectedIso3 = value;
    setSelectedState(selectedIso3);
    // setSelectedCity("");
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

  // add trustee
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState("Content of the modal");
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
    // console.log("Clicked cancel button");
    setOpen(false);
  };

  const onFinish = async (values) => {
    values.country = finalCountry;
    values.state = finalState;
    const cleanedCountryCode = countryCode.replace("+", "");
    const newValues = {
      ...values,
      phone: `${cleanedCountryCode} ${phoneNumber}`,
    };

    console.log(newValues, "add");
    // return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/addUsers`, {
        method: "POST",
        headers: {
          "content-Type": "Application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newValues),
      });

      if (response.ok) {
        // Display success message using SweetAlert
        Swal.fire({
          icon: "success",
          title: "Trustee Added Successfully!",
          // showConfirmButton: false,
          // timer: 1500,
        });

        // Reset form values
        form.resetFields();
        setRender(!render);
        // You can redirect or perform any other action here
      } else {
        console.error("Error adding user. Please try again.");
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
  const [userid, setUserid] = useState(null);
  const showModals = (data) => {
    const { phone, ...restData } = data;
    const countryCode = phone.slice(0, phone.indexOf(" ") + 1);
    const phoneNumber = phone.slice(phone.indexOf(" ") + 1);

    setUserid(data.user_id);
    form.setFieldsValue({ ...restData, countryCode, phoneNumber });
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
    // console.log("Clicked cancel button");
    setOpens(false);
  };

  const onFinishs = async (values) => {
    values.country = finalCountry;
    values.state = finalState;
    const cleanedCountryCode = countryCode.replace("+", "");
    const newValues = {
      ...values,
      phone: `${cleanedCountryCode} ${phoneNumber}`,
    };

    // console.log(newValues, "edit");
    // return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/updateUser/${userid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newValues),
      });

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Trustee Updated Successfully",
          icon: "success",
        });
        setRender(!render);
        // You can redirect, show a success message, or perform any other action here
      } else {
        console.error("Error updating user. Please try again.");
      }
    } catch (error) {
      console.error("Internal Server Error", error);
    }
  };

  // delete trustee

  const handleDelete = async (user_id) => {
    // Show confirmation dialog
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
          `${BACKEND_URL}/api/deleteUser/${user_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setRender(!render);
          Swal.fire({
            title: "Success",
            text: "Trustee Deleted Successfully!",
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
          <h1 className="font-bold text-lg">Our Trustees</h1>
        </div>
        <div className="w-1/2">
          <Button
            style={{ backgroundColor: "green" }}
            type="primary"
            onClick={showModal}
          >
            Add Trustee
          </Button>
          <Modal
            title="Add Trustee"
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
                label="Trustee Name"
                name="trustee_name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true }]}
              >
                <Space.Compact className="w-full">
                  <Select
                    showSearch
                    style={{ width: "25%", color: "black" }}
                    defaultValue="Select"
                    onChange={handleChange}
                    // options={options}
                  >
                    {" "}
                    {uniqueCountries.map((country) => (
                      <option key={country.id} value={`${country.value}`}>
                        {`${country.label} `}
                      </option>
                    ))}
                  </Select>

                  <Input type="number" onChange={handlePhoneChange} />
                </Space.Compact>
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true }]}
              >
                <Input type="email" />
              </Form.Item>

              <Form.Item
                label="Country"
                name="country"
                rules={[
                  { required: true, message: "Please select a country!" },
                ]}
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
                // rules={[{ required: true, message: "Please select a city!" }]}
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

              <Form.Item label="Area" name="area" rules={[{ required: true }]}>
                <Input />
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
        dataSource={users}
        onChange={onChange}
        rowKey={(record) => record.user_id}
      />

      <Modal
        title="Update Trustee"
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
            label="Trustee Name"
            name="trustee_name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
            <Space.Compact className="w-full">
              <Select
                showSearch
                style={{ width: "25%", color: "black" }}
                defaultValue="Select"
                onChange={handleChange}
                // options={options}
              >
                {" "}
                {uniqueCountries.map((country) => (
                  <option key={country.id} value={`${country.value}`}>
                    {`${country.label} `}
                  </option>
                ))}
              </Select>

              <Input type="number" onChange={handlePhoneChange} />
            </Space.Compact>
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ required: true }]}>
            <Input type="email" />
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
            // rules={[{ required: true, message: "Please select a city!" }]}
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

          <Form.Item label="Area" name="area" rules={[{ required: true }]}>
            <Input />
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

export default TrusteeComp;
