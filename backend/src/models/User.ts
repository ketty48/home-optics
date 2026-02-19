import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    isDefault: boolean;
  }>;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    addresses: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true, default: 'Rwanda' },
        zipCode: { type: String },
        isDefault: { type: Boolean, default: false }
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRE || '30d') as any
  });
};

export default mongoose.model<IUser>('User', userSchema);
