import { BACKEND_URL } from '@/app/page';
import React, { useState } from 'react';


const Postgress = () => {
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState('');

  const handleChange = (event, setValueFunc) => {
    setValueFunc(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/sahihaidost?value=${value}&value2=${value2}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(event) => handleChange(event, setValue)}
        placeholder="Enter value"
            className='border border-gray-400 p-2 mr-4'
/>
      <input
        type="text"
        value={value2}
        onChange={(event) => handleChange(event, setValue2)}
        placeholder="Enter value2"
        className='border border-gray-400 p-2'
      />
      <button className='bg-red-500 px-4 py-2 text-white rounded-lg font-bold mx-4' onClick={handleSubmit}>Send</button>
    </div>
  );
};

export default Postgress;