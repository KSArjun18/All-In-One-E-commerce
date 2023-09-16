const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
    maxLength: [100, "Product name cannot exceed 100 character"],
  },
  price: {
    type: Number,
    required: true,
    default: 0.0,
  },
  description: {
    type: String,
    required: [true, "Please enter product description"],
  },

  rating: {
    type: String,
    default: 0,
  },
  images: [
    {
      image: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please enter product category"],
    enum: {
      values: [
        "Electronics",
        "Mobile Phones",
        "Laptops",
        "Accessories",
        "Headphones",
        "Food",
        "Books",
        "Clothes/Shoes",
        "Beauty/Health",
        "Sports",
        "Outdoor",
        "Home",
      ],
      message: "Please select correct category",
    },
  },

  seller: {
    type: String,
    required: [true, "Please enter product seller"],
  },
  stock: {
    type: String,
    required: [true, "Please enter stock"],
    maxLength: [20, "Product stock cannot exceed 20"],
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
      },
      rating: {
        type: String,
        required: true,
      },

      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

let schema = mongoose.model("Product", productSchema);
module.exports = schema;
