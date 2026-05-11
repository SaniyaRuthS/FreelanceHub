const Gig = require('../models/Gig');

// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private (Seller only)
const createGig = async (req, res) => {
  try {
    console.log('--- GIG CREATION START ---');
    const { title, description, category, subcategory, packages, images, price } = req.body;
    
    // 1. Strict Validation
    if (!title || title.length < 5) {
      return res.status(400).json({ success: false, message: 'Title is required and must be at least 5 characters.' });
    }
    if (!description || description.length < 20) {
      return res.status(400).json({ success: false, message: 'Description is required and must be at least 20 characters.' });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    if (!req.user) {
      console.log('❌ GIG ERROR: No user in request');
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Determine price: Use provided price (buyer) or packages[0].price (seller)
    const finalPrice = price || (packages && packages[0]?.price);
    
    if (!finalPrice || finalPrice <= 0) {
      return res.status(400).json({ success: false, message: 'A valid price or budget is required.' });
    }

    // 2. Persistent Save
    const gig = await Gig.create({
      sellerId: req.user._id,
      createdBy: req.user._id,
      role: req.user.role === 'buyer' ? 'buyer' : 'seller',
      title,
      description,
      category,
      subcategory,
      projectLink: req.body.projectLink,
      tags: req.body.tags || [],
      packages: packages || [],
      images: images || [],
      price: finalPrice
    });

    console.log('✅ GIG CREATED PERMANENTLY:', gig._id);

    return res.status(201).json({
      success: true,
      message: 'Gig Created Successfully',
      data: gig
    });
  } catch (error) {
    console.error('❌ GIG PERSISTENCE ERROR:', error.message);
    return res.status(500).json({ 
      success: false,
      message: 'Database save failed. Please try again.' 
    });
  }
};

// @desc    Get all gigs
// @route   GET /api/gigs
// @access  Public
const getGigs = async (req, res) => {
  try {
    const keyword = req.query.keyword ? {
      title: {
        $regex: req.query.keyword,
        $options: 'i',
      },
    } : {};

    const category = req.query.category ? { category: req.query.category } : {};
    const subcategory = req.query.subcategory ? { subcategory: req.query.subcategory } : {};
    const sellerId = req.query.sellerId ? { sellerId: req.query.sellerId } : {};

    const gigs = await Gig.find({ ...keyword, ...category, ...subcategory, ...sellerId }).populate('sellerId', 'name email');
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get gig by ID
// @route   GET /api/gigs/:id
// @access  Public
const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('sellerId', 'name email');
    if (gig) {
      res.json(gig);
    } else {
      res.status(404).json({ message: 'Gig not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a gig
// @route   PUT /api/gigs/:id
// @access  Private
const updateGig = async (req, res) => {
  try {
    let gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    // Ensure user owns the gig
    if (gig.sellerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this gig' });
    }

    gig = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a gig
// @route   DELETE /api/gigs/:id
// @access  Private
const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    // Ensure user owns the gig
    if (gig.sellerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this gig' });
    }

    await Gig.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gig removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's gigs
// @route   GET /api/gigs/my
// @access  Private
const getMyGigs = async (req, res) => {
  try {
    console.log('--- FETCHING MY GIGS ---');
    console.log('User ID:', req.user._id, 'Role:', req.user.role);
    const gigs = await Gig.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    console.log('Found Gigs Count:', gigs.length);
    res.json(gigs);
  } catch (error) {
    console.error('❌ GET MY GIGS ERROR:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGig,
  getGigs,
  getGigById,
  getMyGigs,
  updateGig,
  deleteGig
};
