import mongoose, { Document, Schema } from 'mongoose';

/** Interface representing a saved neighborhood comparison */
export interface ISavedComparison extends Document {
  neighborhoodIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SavedComparisonSchema = new Schema<ISavedComparison>(
  {
    neighborhoodIds: { type: [String], required: true },
  },
  { timestamps: true }
);

export const SavedComparison = mongoose.model<ISavedComparison>(
  'SavedComparison',
  SavedComparisonSchema
);
