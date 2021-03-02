const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectdb = require('../database/mongodb');
const user = require('../routes/user');

require('dotenv').config();
connectdb();

const app = express();
const port = process.env.PORT || 2600;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(morgan('dev'));
app.use('/api', user);

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
