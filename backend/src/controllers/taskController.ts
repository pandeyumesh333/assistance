import { Request, Response } from 'express';
import { Task } from '../models/Task';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({
      completed: 1,
      createdAt: -1,
    });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, priority, dueDate, recurring } = req.body;

    const task = await Task.create({
      userId: req.userId,
      title,
      description,
      priority,
      dueDate,
      recurring,
    });

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // Handle recurring tasks completion logic
    if (req.body.completed === true && task.recurring !== 'none') {
      const nextDueDate = new Date(task.dueDate || new Date());
      
      if (task.recurring === 'daily') nextDueDate.setDate(nextDueDate.getDate() + 1);
      else if (task.recurring === 'weekly') nextDueDate.setDate(nextDueDate.getDate() + 7);
      else if (task.recurring === 'monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      // Create next occurrence
      await Task.create({
        userId: req.userId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        recurring: task.recurring,
        dueDate: nextDueDate,
        completed: false,
      });
    }

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({ message: 'Task removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
