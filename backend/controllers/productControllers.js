const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const APIFeatures = require("../utils/apiFeatures");

//Get Products- /api/v1/products
exports.getProducts = async (req, res, next) => {
  const resPerPage = 3;
  let buildQuery = () => {
    return new APIFeatures(Product.find(), req.query).search().filter();
  };
  const filteredProductCount = await buildQuery().query.countDocuments({});
  const totalProductsCount = await Product.countDocuments({});
  let productsCount = totalProductsCount;

  if (filteredProductCount !== totalProductsCount) {
    productsCount = filteredProductCount;
  }

  const products = await buildQuery().paginate(resPerPage).query;
  res.status(200).json({
    sucess: true,
    count: productsCount,
    resPerPage,
    products,
  });
};

//create Product - /api/v1/product/new
exports.newProduct = catchAsyncError(async (req, res, next) => {
  let images=[]
  let BASE_URL=process.env.BACKEND_URL
  if(process.env.NODE_ENV==="production"){
    BASE_URL=`${req.protocol}://${req.get('host')}`
  }
  if(req.files.length >0){
req.files.forEach(file=>{
  let url=`${BASE_URL}/uploads/produt/${file.originalname}`
  images.push({image:url})
})
  }
  req.body.images=images
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({
    sucess: true,
    product,
  });
});

//get single product-/product/:id
exports.getSingleproduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('reviews.user','name email')

  if (!product) {
    return next(new ErrorHandler("product not found ", 400));
  }

  res.status(201).json({
    success: true,
    product,
  });
};

//update product-/product/:id

exports.updateProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  //uploading images
  let images=[]
  if(req.body.imagesCleared === "false"){
  images=product.images
  }
  let BASE_URL=process.env.BACKEND_URL
  if(process.env.NODE_ENV==="production"){
    BASE_URL=`${req.protocol}://${req.get('host')}`
  }
  if(req.files.length >0){
req.files.forEach(file=>{
  let url=`${BASE_URL}/uploads/produt/${file.originalname}`
  images.push({image:url})
})
  }
  req.body.images=images

  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
  });
};

//delete product-/product/:id

exports.deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product Deleted",
  });
};
//create review-api/v1/review
exports.createReview = catchAsyncError(async (req, res, next) => {
  const { productId, rating, comment } = req.body;
  const review = {
    user: req.user.id,
    rating,
    comment,
  };
  const product = await Product.findById(productId);
  //finding user  review exceed
  const isReviewed = product.reviews.find((review) => {
    return review.user.toString() == req.user.id.toString();
  });
  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() == req.user.id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  //find the average of the product reviews
  product.ratings =
    product.reviews.reduce((acc, review) => {
      return review.rating + acc;
    }, 0) / product.reviews.length;
  product.ratings = isNaN(product.ratings) ? 0 : product.ratings;
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

//Get reviews-api/v1/reviews
exports.getReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id).populate('reviews.user','name email')
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//Detele reviews-api/v1/review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  const reviews = product.reviews.filter((review) => {
    return review._id.toString() !== req.query.id.toString();
  });
  const numOfReviews = reviews.length;
  let ratings =
    reviews.reduce((acc, review) => {
      return review.rating + acc;
    }, 0) / reviews.length;
  ratings = isNaN(ratings) ? 0 : ratings;
  await Product.findByIdAndUpdate(req.query.productId, {
    reviews,
    numOfReviews,
    ratings,
  });
  res.status(200).json({
    success: true,
  });
});

//get admin prdocuts-api/vi/admin/products
exports.getAdminProducts=catchAsyncError(async(req,res,next)=>{
  const products=await Product.find()
  res.status(200).send({
    success:true,
    products
  })
})