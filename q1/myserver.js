const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

const WINDOW_SIZE = 10;
const numbers = {
  p: [], // primes
  f: [], // Fibonacci
  e: [], // even
  r: [], // random
};

// Helper functions to handle fetching and storing numbers
const fetchNumbers = async (type) => {
  try {
    const response = await axios.get(`https://third-party-server/api/${type}`, { timeout: 500 });
    return response.data.numbers;
  } catch (error) {
    console.error('Error fetching numbers:', error.message);
    return [];
  }
};

const updateNumbers = (type, newNumbers) => {
  const uniqueNumbers = newNumbers.filter(num => !numbers[type].includes(num));
  numbers[type].push(...uniqueNumbers);
  if (numbers[type].length > WINDOW_SIZE) {
    numbers[type] = numbers[type].slice(-WINDOW_SIZE);
  }
};

const calculateAverage = (nums) => {
  if (nums.length === 0) return 0;
  const sum = nums.reduce((acc, num) => acc + num, 0);
  return (sum / nums.length).toFixed(2);
};

// Endpoint to handle requests
app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  if (!['p', 'f', 'e', 'r'].includes(numberid)) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const prevState = [...numbers[numberid]];
  const newNumbers = await fetchNumbers(numberid);
  updateNumbers(numberid, newNumbers);
  const currState = [...numbers[numberid]];
  const avg = calculateAverage(numbers[numberid]);

  res.json({
    windowPrevState: prevState,
    windowCurrState: currState,
    numbers: newNumbers,
    avg: parseFloat(avg)
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
