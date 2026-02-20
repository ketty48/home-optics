import mongoose, { Document, Schema } from 'mongoose';

const EAST_AFRICAN_COUNTRIES = [
  'Rwanda',
  'Kenya',
  'Uganda',
  'Tanzania',
  'Burundi',
  'South Sudan',
  'Democratic Republic of the Congo',
  'Somalia'
];

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderItems: Array<{
    name: string;
    qty: number;
    image: string;
    price: number;
    product: mongoose.Types.ObjectId;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  guestDetails?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  orderNotes?: string;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { 
        type: String, 
        required: true,
        enum: EAST_AFRICAN_COUNTRIES,
        default: 'Rwanda'
      },
      phone: { type: String, required: true },
    },
    guestDetails: {
      firstName: { type: String },
      lastName: { type: String },
      email: { type: String },
    },
    orderNotes: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    status: { type: String, required: true, default: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
  },
  {
    timestamps: true,
  }
);

// Middleware to enforce free delivery in Rwanda
orderSchema.pre('save', function (next) {
  if (this.shippingAddress && this.shippingAddress.country === 'Rwanda') {
    this.shippingPrice = 0;
  }
  next();
});

export default mongoose.model<IOrder>('Order', orderSchema);