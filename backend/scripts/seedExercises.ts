import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { ExerciseLibrary } from '../src/models/health/ExerciseLibrary';

dotenv.config({ path: path.join(__dirname, '../.env') });

const exercises = [
  // --- GYM EXERCISES ---
  {
    exerciseName: 'Bench Press',
    exerciseType: 'gym',
    muscleGroup: 'Chest',
    difficultyLevel: 'intermediate',
    instructions: ['Lie on bench', 'Lower bar to chest', 'Push back up'],
    recommendedDuration: 10,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/l3vR8IAtvPQC8Wbvy/giphy.gif'
  },
  {
    exerciseName: 'Squat',
    exerciseType: 'gym',
    muscleGroup: 'Legs',
    difficultyLevel: 'advanced',
    instructions: ['Bar on shoulders', 'Lower hips until thighs parallel', 'Stand up'],
    recommendedDuration: 15,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/3o7TKpVfK1L3A8K16o/giphy.gif'
  },
  {
    exerciseName: 'Deadlift',
    exerciseType: 'gym',
    muscleGroup: 'Back',
    difficultyLevel: 'advanced',
    instructions: ['Grip bar on floor', 'Lift with legs and back', 'Lock out at top'],
    recommendedDuration: 15,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/26ueYUlPAmUkT7OT6/giphy.gif'
  },
  {
    exerciseName: 'Bicep Curl',
    exerciseType: 'gym',
    muscleGroup: 'Arms',
    difficultyLevel: 'beginner',
    instructions: ['Hold dumbbells', 'Curl towards shoulders', 'Lower slowly'],
    recommendedDuration: 10,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/3o7TKVUn7XYMgbzgQs/giphy.gif'
  },
  {
    exerciseName: 'Shoulder Press',
    exerciseType: 'gym',
    muscleGroup: 'Shoulders',
    difficultyLevel: 'intermediate',
    instructions: ['Sit or stand', 'Push weight overhead', 'Lower to shoulder level'],
    recommendedDuration: 10,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/3o7TKp7uV5vWzVvW68/giphy.gif'
  },

  // --- HOME EXERCISES ---
  {
    exerciseName: 'Pushups',
    exerciseType: 'home',
    muscleGroup: 'Chest',
    difficultyLevel: 'intermediate',
    instructions: ['Plank position', 'Lower chest to floor', 'Push back up'],
    recommendedDuration: 10,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/3o7TKpVfK1L3A8K16o/giphy.gif'
  },
  {
    exerciseName: 'Plank',
    exerciseType: 'home',
    muscleGroup: 'Core',
    difficultyLevel: 'beginner',
    instructions: ['Forearms on floor', 'Hold body straight', 'Tighten core'],
    recommendedDuration: 5,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/3o7TKpVfK1L3A8K16o/giphy.gif'
  },
  {
    exerciseName: 'Lunges',
    exerciseType: 'home',
    muscleGroup: 'Legs',
    difficultyLevel: 'beginner',
    instructions: ['Step forward', 'Lower back knee', 'Push back to start'],
    recommendedDuration: 10,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/3o7TKpVfK1L3A8K16o/giphy.gif'
  },
  {
    exerciseName: 'Burpees',
    exerciseType: 'home',
    muscleGroup: 'Full Body',
    difficultyLevel: 'advanced',
    instructions: ['Squat down', 'Kick feet back', 'Jump back up'],
    recommendedDuration: 10,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/3o7TKpVfK1L3A8K16o/giphy.gif'
  },

  // --- YOGA ---
  {
    exerciseName: 'Sun Salutation',
    exerciseType: 'yoga',
    muscleGroup: 'Full Body',
    difficultyLevel: 'intermediate',
    instructions: ['Sequence of 12 poses', 'Focus on breathing', 'Flow smoothly'],
    recommendedDuration: 20,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/3o7TKpVfK1L3A8K16o/giphy.gif'
  },
  {
    exerciseName: 'Downward Dog',
    exerciseType: 'yoga',
    muscleGroup: 'Full Body',
    difficultyLevel: 'beginner',
    instructions: ['Inverted V shape', 'Heels towards floor', 'Relax head'],
    recommendedDuration: 5,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/3o7TKpVfK1L3A8K16o/giphy.gif'
  },
  {
    exerciseName: 'Warrior II',
    exerciseType: 'yoga',
    muscleGroup: 'Legs',
    difficultyLevel: 'beginner',
    instructions: ['Wide stance', 'Front knee bent', 'Arms horizontal'],
    recommendedDuration: 5,
    videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z4Z3Z/3o7TKpVfK1L3A8K16o/giphy.gif'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/life-assistant');
    console.log('Connected to MongoDB');

    await ExerciseLibrary.deleteMany({});
    console.log('Cleared existing exercises');

    await ExerciseLibrary.insertMany(exercises);
    console.log(`Successfully seeded ${exercises.length} exercises!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding exercises:', error);
    process.exit(1);
  }
}

seed();
