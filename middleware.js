const Listing=require("./models/listing");
const Review=require("./models/review");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");
const {reviewSchema}=require("./schema.js");


module.exports.isLoggedIn=(req,res,next)=>{

    if(!req.isAuthenticated()){
      req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged  in to create listing ");
       return  res.redirect("/login");
      }
      next();
};


module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  // Find the listing by ID and populate the owner field
  const listing = await Listing.findById(id);

  // Check if the listing exists
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  // Check if the listing has an owner and if the current user is logged in
  if (!listing.owner || !res.locals.currUser || !listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing.");
    return res.redirect(`/listings/${id}`);
  }

  // If the user is the owner, proceed to the next middleware
  next();
};

 
module.exports.validateListing=(req,res,next)=>{
  let {error}=listingSchema.validate(req.body);
  console.log(error);
  if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
   throw new ExpressError(400,errMsg);
  }
  else{
    next();
  }
};


module.exports. validateReview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
  console.log(error);
  if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
   throw new ExpressError(400,errMsg);

  }
  else{
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;

  // Find the review by its ID
  const review = await Review.findById(reviewId);

  // Check if the review exists
  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${id}`);
  }

  // Check if the current user is the author of the review
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review.");
    return res.redirect(`/listings/${id}`);
  }

  // If the user is the author, proceed to the next middleware
  next();
};
