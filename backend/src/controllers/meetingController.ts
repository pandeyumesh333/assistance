import { Request, Response } from 'express';
import { Meeting } from '../models/Meeting';

export const getMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const meetings = await Meeting.find({ userId: req.userId }).sort({ time: 1 });
    res.json(meetings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, time, location, notes, reminderTime } = req.body;

    const meeting = await Meeting.create({
      userId: req.userId,
      title,
      time,
      location,
      notes,
      reminderTime,
    });

    res.status(201).json(meeting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedMeeting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }

    res.json({ message: 'Meeting removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
