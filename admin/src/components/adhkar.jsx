'use client'
import { Button, Form, Modal, Select, Table, Input } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import {  EditOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import { BACKEND_URL } from '@/app/page';
import Swal from 'sweetalert2';
import DisabledContext from 'antd/es/config-provider/DisabledContext';
import { getCookieToken } from '@/layouts/sidebars/Sidebar';

const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 4,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 20,
        },
    },
};
const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 20,
            offset: 4,
        },
    },
};


const AdhkarComp = () => {
    const token = getCookieToken()

    const [render, setRender] = useState(false)

    //Add Adhkar
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [selected, setSelected] = useState(null)
    const [adhkarid, setAdhkarid] = useState(null);
    const [operationType, setOperationType] = useState('add');

    const showModal = (record, type) => {
        if (type === 'add') {
            setOperationType('add')
            form.resetFields(null)
        } else {
            setOperationType('update')
            form.setFieldsValue(record)
            setAdhkarid(record.adhkar_id)
        }
        setOpen(true);
    }

    const handleCancel = () => {
        setOpen(false);
    }

    const handleChange = (values) => {
        console.log(`${values}`);
    }

    const onFinish = async (values) => {
        console.log(values);
        try {
            let url = `${BACKEND_URL}/api/addAdhkar`;
            let method = 'POST';
        
            if (operationType === 'update') {
              url = `${BACKEND_URL}/api/updateAdhkar/${adhkarid}`;
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
                title: operationType === 'add' ? "Adhkar Added Successfully" : "Adhkar Updated Successfully",
              });
        
              form.resetFields();
              setRender(!render);
              setOpen(false);
            } else {
              console.error("Error Adding/Updating Adhkar. Please try again");
            }
          } catch (error) {
            console.error("Internal Server Error", error);
          }
    }

    const onFinishFailed = async (errorInfo) => {
        console.log("Failes:", errorInfo);
    }

    //Table Section
  const [adhkar, setAdhkar] = useState([])
 
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/getAdhkar`,{
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
        })

        if (response.ok) {
          const adhkarData = await response.json();
          setAdhkar(adhkarData)
        } else {
          console.error("Error Fetching Hadeeth Data");
        }
      } catch (error) {
        console.error("Internal Server Error", error);
      }
    }
    fetchData();
  });
  
  const columns = [
    
    {
      title: "Namaz",
      dataIndex: "anamaz_type",
    },  
    {
        title: "Adhkar",
        dataIndex: "adhkar",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <>
          <Button
            className="bg-yellow-700 hover:bg-yellow-900 px-4 pb-8 mr-2 mb-2 font-bold"
            type="primary"
            onClick={() => showModal(record, 'update')}
          >
            <EditOutlined className="text-white text-lg flex m-auto" /> Update Adhkar        
          </Button>
        </>
      ),
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };




    return (
        <>
            <div className="flex">
                <div className="w-1/2 text-left">
                    <h1 className="font-bold text-lg">Our Adhkar</h1>
                </div>
                <div className="w-1/2 text-right">
                    {/* <Button style={{ backgroundColor: 'green' }} type='primary' onClick={() => showModal(null, 'add')} >
                        Add Adhkar
                    </Button> */}
                    <Modal title="Add Adhkar" open={open} footer={null} onCancel={handleCancel}>
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
                            <Form.Item label="Namaz" name="anamaz_type" rules={[{ required: true }]} >
                                <Select placeholder='Select namaz' style={{ width: '87%',color:'black' }} onChange={handleChange} disabled >
                                    <Select.Option value="Fajr">Fajr</Select.Option>
                                    <Select.Option value="Zohar">Zohar</Select.Option>
                                    <Select.Option value="Asr">Asr</Select.Option>
                                    <Select.Option value="Maghrib">Maghrib</Select.Option>
                                    <Select.Option value="Isha">Isha</Select.Option>
                                    <Select.Option value="Jumma">Jumma</Select.Option>
                                    <Select.Option value="Jumma Asr">Jumma Asr</Select.Option>
                                    <Select.Option value="Takbeer">Takbeer</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.List name="adhkar"
                                rules={[
                                    {
                                        validator: async (_, names) => {
                                            if (!names || names.length < 1) {
                                                return Promise.reject(new Error('At least 2 Adhkar'));
                                            }
                                        },
                                    },
                                ]}
                            >
                                {(fields, { add, remove }, { errors }) => (
                                    <>
                                        {fields.map((field, index) => (
                                            <Form.Item
                                                {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                                                label={index === 0 ? 'Adhkar' : ''}
                                                required={true}
                                                key={field.key}
                                            >
                                                <Form.Item
                                                    {...field}
                                                    validateTrigger={['onChange', 'onBlur']}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            whitespace: true,
                                                            message: "Please input passenger's name or delete this field.",
                                                        },
                                                    ]}
                                                    noStyle
                                                >
                                                    <TextArea className='ml-8'
                                                        placeholder="Enter adhkar here" rows={3}
                                                        style={{
                                                            width: '80%',
                                                        }}
                                                    />
                                                </Form.Item>
                                                {fields.length > 1 ? (
                                                    <MinusCircleOutlined
                                                        className="dynamic-delete-button"
                                                        onClick={() => remove(field.name)}
                                                    />
                                                ) : null}
                                            </Form.Item>
                                        ))}
                                        <Form.Item>
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                style={{
                                                    width: '25%',
                                                    display: 'block',
                                                    margin: 'auto'
                                                }}
                                                icon={<PlusOutlined />}
                                            >
                                                Add field
                                            </Button>                                            
                                            <Form.ErrorList className='mt-2' errors={errors} />
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>


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
            dataSource={adhkar}
            onChange={onChange}
            rowKey={(record) => record.adhkar_id}
            />
        </>
    )
}

export default AdhkarComp