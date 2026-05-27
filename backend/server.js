const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let tasks = [];

// A hidden dictionary to store running node-schedule jobs
// This lets us find a specific timer by its ID and kill it!
let activeJobs = {};

app.get('/api/tasks', (req, res) => {  
    res.status(200).json(tasks);
});

app.post('/api/tasks', (req, res) => { 
    const { taskName, executionTime } = req.body;

    if(!taskName || !executionTime ) {
        return res.status(400).json({ error: "Missing taskName or executionTime!" });
    }

    const targetDate = new Date(executionTime);
    const now = new Date();

    if (targetDate <= now) {
        return res.status(400).json({ error: "Cannot schedule tasks in the past or current minute! Please pick a future time." });
    }

    const taskId = Date.now().toString();

    const newTask = {
        id: taskId,
        taskName: taskName,
        executionTime: executionTime,
        status: "Pending"
    }

    tasks.push(newTask);

    console.log(`[SCHEDULER] Setting alarm for "${taskName}" at ${targetDate.toLocaleString()}`);

    const job = schedule.scheduleJob(targetDate, function() {
        console.log(`\n⏰ [ALARM TRIGGERED]: "${taskName}"`);
        newTask.status = "Executed";
        
        delete activeJobs[taskId];
    });

    activeJobs[taskId] = job;

    res.status(201).json({ message: "Task added successfully!", task: newTask });
});

app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;

    if (activeJobs[id]) {
        activeJobs[id].cancel(); // Tells node-schedule to stop counting down
        delete activeJobs[id];   // Remove from memory dictionary
        console.log(`[SCHEDULER] Cancelled background timer for task ID: ${id}`);
    }

    const originalLength = tasks.length;
    tasks = tasks.filter(task => task.id !== id);

    if (tasks.length === originalLength) {
        return res.status(404).json({ error: "Task not found!" });
    }

    res.status(200).json({ message: "Task successfully deleted and cancelled!" });
});

app.listen(PORT, () => {
    console.log("Task scheduler Server is running on port 5000");
});