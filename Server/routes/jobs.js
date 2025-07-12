const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job'); // Import the Job model

const router = express.Router();

// POST route to add a job
router.post('/jobs', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add job', error });
  }
});

module.exports = router;