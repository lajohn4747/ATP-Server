import './App.css';
import React, { useState } from 'react';

export function DateInput({ labelText, onChangeMethod }) {
  const [date, setDate] = useState('');

  const handleDateChange = (e) => {
    const enteredDate = e.target.value;

    // Check if the entered date matches the YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(enteredDate) || enteredDate === '') {
      setDate(enteredDate);
      onChangeMethod(enteredDate);
    }
  };

  return (
    <div>
      <label htmlFor="dateInput">{labelText}: </label>
      <input
        id="dateInput"
        type="date"
        value={date}
        onChange={handleDateChange}
        pattern="\d{4}-\d{2}-\d{2}"
      />
    </div>
  );
}

function App() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const handleButtonClick = async () => {
    console.log(startDate)
    console.log(endDate)
    if (startDate && endDate) {
      setLoading(true)
      try {
        const response = await fetch(`/api/data?startDate=${startDate}&endDate=${endDate}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download',`${startDate}-${endDate}.csv`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } else {
          console.error('Error:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error.message);
      } finally {
        setLoading(false); // Set loading to false when the request is completed (success or error)
      }
    } else {
      console.error('Please select both start and end dates');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Date Input For Output CSV</h1>
      <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', marginTop: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <DateInput labelText="Enter Start Date: " value={startDate} onChangeMethod={(value) => {
            setStartDate(value)
          }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <DateInput labelText="Enter End Date: " value={endDate} onChangeMethod={(value) => setEndDate(value)} />
        </div>
        <button onClick={handleButtonClick}>Send Request</button>
      </div>
      {/* Display loading message while loading is true */}
      {loading && (
        <div className="spinner-container">
          <div>
            <p>Loading</p>
            <div className="spinner"></div> {/* Apply the spinner CSS here */}
          </div>
        </div>
      )}
    </div>
  );
}


export default App;
