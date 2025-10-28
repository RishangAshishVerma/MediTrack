import mongoose from "mongoose";

const dailyTimeRangeSchema = new mongoose.Schema(
  {
    start: { type: String },
    end: { type: String },
  },
  { _id: false }
);

const availabilityRangeSchema = new mongoose.Schema(
  {
    startDate: { type: String },
    endDate: { type: String },
    excludedWeekdays: { type: [Number], default: [] },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    mobileNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['Doctor'],
      default: 'Doctor',
    },

    profileImage: {
      type: String,
      required: true,
    },

    specialization: {
      type: String,
      enum: [
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Pediatrics',
        'Gynecology',
        'Oncology',
        'Dermatology',
        'Radiology',
        'Emergency',
        'ENT',
        'Urology',
        'Gastroenterology',
        'Psychiatry',
        'General Surgery',
      ],
    },

    category: {
      type: String,
      enum: [
        'Primary Care',
        'Manage Your Condition',
        'Mental & Behavioral Health',
        'Sexual Health',
        "Children's Health",
        'Senior Health',
        "Women's Health",
        "Men's Health",
        'Wellness',
      ],
      required: false,
    },

    qualification: {
      type: String,
      required: false,
    },

    experience: {
      type: Number,
    },

    about: {
      type: String,
    },

    fees: {
      type: Number,
    },

    hospitalInfo: {
      name: { type: String },
      address: { type: String },
      city: { type: String },
    },

    availabilityRange: availabilityRangeSchema,

    dailyTimeRange: dailyTimeRangeSchema,

    slotDurationMinutes: {
      type: Number,
      default: 30,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isDelete: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true, });

export default mongoose.model('Doctor', doctorSchema);
