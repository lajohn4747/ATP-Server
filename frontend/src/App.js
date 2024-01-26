import './App.css';
import React, { useEffect, useState } from 'react';

function DateInput({ labelText, onChangeMethod }) {
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
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      if (loading) {
        console.log(`Fetching file`);
        fetchData(); // Function to fetch data from the server
      }
    }, 1000 * 20); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount or component update
  }, [loading]);

  const fetchData = async () => {
    try {
      let url = `/api/get_file?fileName=${fileName}`
      const response = await fetch(url);
      console.log(url)
      if (response.status == 200) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setLoading(false)
      } else {
        console.error('Failed to fetch data:', response.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleButtonClick = async () => {
    console.log(startDate)
    console.log(endDate)
    if (startDate && endDate) {
      try {
        let fileName = `${startDate}-${endDate}.csv`
        setFileName(fileName)
        fetch(`/api/create_data?startDate=${startDate}&endDate=${endDate}`);
        setLoading(true);
      } catch (error) {
        console.error('Error:', error.message);
      }
    } else {
      console.error('Please select both start and end dates');
    }
  };

  const handleSalesClick = async () => {
    console.log(startDate)
    console.log(endDate)
    if (startDate && endDate) {
      try {
        let fileName = `sales-mix-${startDate}-${endDate}.csv`
        setFileName(fileName)
        fetch(`/api/get_sales_mix_data?startDate=${startDate}&endDate=${endDate}`);
        setLoading(true);
      } catch (error) {
        console.error('Error:', error.message);
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
          <DateInput disabled={loading} labelText="Enter Start Date: " value={startDate} onChangeMethod={(value) => {
            setStartDate(value)
          }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <DateInput disabled={loading} labelText="Enter End Date: " value={endDate} onChangeMethod={(value) => setEndDate(value)} />
        </div>
        <button disabled={loading} onClick={handleButtonClick}>Get Location Metrics</button>
        <button disabled={loading} onClick={handleSalesClick}>Get Sales Mix</button>
      </div>
      {/* Display loading message while loading is true */}
      {loading && (
        <div className="spinner-container">
          <div>
            <p>Loading, please do not leave or reload page.</p>
            <div className="spinner"></div> {/* Apply the spinner CSS here */}
          </div>
        </div>
      )}
    </div>
  );
}


export default App;
