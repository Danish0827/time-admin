"use client"
import { Form, Modal, Table, Button, Input, DatePicker, Space, Select } from 'antd'
import Swal from "sweetalert2";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useState } from 'react'
import { BACKEND_URL } from '@/app/page';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import dayjs from 'dayjs';
import { getCookieToken } from '@/layouts/sidebars/Sidebar';

const HadeethComp = () => {
  const token = getCookieToken()
  const [render,setRender] = useState(false)
  // Add Hadeeth 
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState(null);
  const [hadeethid,setHadeethid]= useState(null);
  const [operationType, setOperationType] = useState('add');

  const showModal = (record, type) => {
    if (type === 'add') {
      setOperationType('add');
      form.resetFields();
    } else {
      setOperationType('update');
      // Convert the date format before setting it as the field value
      const formattedDate = dayjs(record.date, 'DD-MM').format('DD MMM YYYY');
      form.setFieldsValue({ ...record, hdate: dayjs(formattedDate, 'DD MMM YYYY') });
      setHadeethid(record.hadeeth_id);
    }
    setOpen(true);
  };
  
  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  const onFinish = async (values) => {
    console.log(values);
    try {
      let url = `${BACKEND_URL}/api/addHadeeth`;
      let method = 'POST';
  
      if (operationType === 'update') {
        url = `${BACKEND_URL}/api/updateHadeeth/${hadeethid}`;
        method = 'PUT';
      }
  
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });
  
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: operationType === 'add' ? "Hadeeth Added Successfully" : "Hadeeth Updated Successfully",
        });
  
        form.resetFields();
        setRender(!render);
        setOpen(false);
      } else {
        console.error("Error Adding/Updating Hadeeth. Please try again");
      }
    } catch (error) {
      console.error("Internal Server Error", error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  
  //Table Section
  const [hadeeth, setHadeeth] = useState([])
 
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getHadeeth`,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });

        if (response.ok) {
          const hadeethData = await response.json();
          setHadeeth(hadeethData.hadeeth)
        } else {
          console.error("Error Fetching Hadeeth Data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    }
    fetchData();
  },[render]);
  const columns = [
    {
      title: "Hadeeth",
      dataIndex: "hadeeth",
    },
    {
      title: "Namaz Type",
      dataIndex: "namaz_type",
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (date) => {
      // Format the date according to the desired format
      const formattedDate = moment(date, 'DD-MM-YYYY').format('dddd, D MMMM YYYY');
      return formattedDate;
    },
    },   
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <>
          <Button
            className="bg-yellow-700 hover:bg-yellow-900 px-4 pb-8 mr-2 mb-2"
            type="primary"
            onClick={() => showModal(record, 'update')}
          >
            <EditOutlined className="text-white text-lg flex m-auto" />
          </Button>
          <Button
            className="bg-red-700 hover:bg-red-900 px-4 pb-8 mb-2"
            type="primary"
          onClick={() => handleDelete(record.hadeeth_id)}
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


  
  // Delete Hadeeth
  const handleDelete =async(hadeeth_id)=>{
    const isConfirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this feature!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if(isConfirmed.isConfirmed){
      try{
      const response = await fetch(`${BACKEND_URL}/api/deleteHadeeth/${hadeeth_id}`,{
        method:'DELETE',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
    });

      if(response.ok){
        Swal.fire({
          title: "Success",
          text: "Hadeeth Deleted Successfully!",
          icon: "success",
        });
        setRender(!render);
      }
    }catch(error){
      console.log("Error Deleting Product", error);
    }
  }  
}
  return (
    <>
      <div className="flex">
        <div className="w-1/2 text-left">
          <h1 className="font-bold text-lg">Our Hadeeth</h1>
        </div>
        <div className="w-1/2 text-right">
          <Button
            style={{ backgroundColor: "green" }}
            type="primary"
            onClick={() => showModal(null, 'add')}
          >
            Add Hadeeth
          </Button>
          <Modal
            title="Add Hadeeth"
            open={open}
            footer={null}
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
              
              <Form.Item label="Date" name="hdate" rules={[{ required: true }]}>
                <DatePicker className='w-full' format="DD MMM YYYY" />
              </Form.Item>

              <Form.Item label="Namaz" name="namaz_type" rules={[{ required: true }]} >
                <Select placeholder='Select namaz' style={{ width: '100%' }} onChange={handleChange}>
                  <Select.Option value="Fajr">Fajr</Select.Option>
                  <Select.Option value="Zohar">Zohar</Select.Option>
                  <Select.Option value="Asr">Asr</Select.Option>
                  <Select.Option value="Maghrib">Maghrib</Select.Option>
                  <Select.Option value="Isha">Isha</Select.Option>
                  <Select.Option value="Jumma">Jumma</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Hadeeth"
                name="hadeeth"
                rules={[{ required: true }]}
              >
                <TextArea placeholder="Enter hadeeth here" rows={4} />
              </Form.Item>

              <div className='block text-center'>
                <Button type="primary" htmlType="submit" className="bg-green-600" >
                  Submit
                </Button>
                <Button type="primary" className="bg-yellow-900 ml-2" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
      </div>
      <Table
        className="pt-5"
        columns={columns}
        dataSource={hadeeth}
        onChange={onChange}
        rowKey={(record) => record.hadeeth_id}
      />
    </>
  )
}

export default HadeethComp