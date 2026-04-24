import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { User } from '../models/User';

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
    const { title, description, priority, dueDate, recurring, audioNoteUrl, reminderOffset } = req.body;

    let xpReward = 10;
    if (priority === 'medium') xpReward = 20;
    else if (priority === 'high') xpReward = 50;

    const task = await Task.create({
      userId: req.userId,
      title,
      description,
      priority,
      dueDate,
      recurring,
      audioNoteUrl,
      reminderOffset,
      xpReward,
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

    const wasCompleted = task.completed;
    const isNowCompleted = req.body.completed === true;

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // Award XP and handle streaks if newly completed
    if (!wasCompleted && isNowCompleted) {
      const user = await User.findById(req.userId);
      if (user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastCompleted = user.lastTaskCompletedDate 
          ? new Date(user.lastTaskCompletedDate) 
          : null;
        if (lastCompleted) lastCompleted.setHours(0, 0, 0, 0);

        // Update XP
        user.xp += task.xpReward;
        user.totalTasksCompleted += 1;

        // Level Up logic
        const xpForNextLevel = user.level * 100;
        if (user.xp >= xpForNextLevel) {
          user.level += 1;
          // Note: XP keeps accumulating, but we could reset if preferred
        }

        // Streak logic
        if (!lastCompleted) {
          user.streak = 1;
        } else {
          const diffDays = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            user.streak += 1;
          } else if (diffDays > 1) {
            user.streak = 1;
          }
          // If diffDays === 0, streak stays same
        }

        user.lastTaskCompletedDate = new Date();
        await user.save();
      }
    }

    // Handle recurring tasks completion logic
    if (isNowCompleted && task.recurring !== 'none') {
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
