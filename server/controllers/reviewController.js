import Review from "../models/Review.js";
import { reviewCode } from "../services/aiService.js";

// Submit Code for Review
export const createReview = async (req, res) => {
  try {
    const { code, language, reviewType } = req.body;

    const aiResponse = await reviewCode({
      code,
      language,
      reviewType,
    });

    let savedReview = null;

    if (req.user?._id) {
      savedReview = await Review.create({
        user: req.user._id,
        code,
        language,
        review: aiResponse,
      });
    }

    res.status(201).json({
      success: true,
      review: savedReview?.review ?? aiResponse,
      savedReview,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      reviews,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};