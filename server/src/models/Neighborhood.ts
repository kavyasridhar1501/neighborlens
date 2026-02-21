import mongoose, { Document, Schema } from 'mongoose';

/** Interface representing a cached neighborhood document */
export interface INeighborhood extends Document {
  name: string;
  zip: string;
  lat?: number;
  lng?: number;
  cachedAt: Date;
  rawData: Record<string, unknown>;
  sentimentScore: number;
  vibeSummary: string;
  lifestyleTags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NeighborhoodSchema = new Schema<INeighborhood>(
  {
    name: { type: String, required: true },
    zip: { type: String, required: true, unique: true },
    lat: { type: Number },
    lng: { type: Number },
    cachedAt: { type: Date, required: true },
    rawData: { type: Schema.Types.Mixed },
    sentimentScore: { type: Number, required: true, min: 0, max: 1 },
    vibeSummary: { type: String, required: true },
    lifestyleTags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Neighborhood = mongoose.model<INeighborhood>(
  'Neighborhood',
  NeighborhoodSchema
);
