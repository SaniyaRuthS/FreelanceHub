const Project = require('../models/Project');
const FreelancerProfile = require('../models/FreelancerProfile');

// @desc    Get all projects (or by freelancer ID / user ID)
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const { freelancerId, user } = req.query;
    const filter = {};
    if (freelancerId) filter.freelancerId = freelancerId;
    if (user)         filter.user         = user;

    const projects = await Project.find(filter).sort('-createdAt');
    res.status(200).json(projects);
  } catch (error) {
    console.error('Get Projects Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a project
// @route   POST /api/projects
// @access  Private (Freelancer only)
const addProject = async (req, res) => {
  try {
    // ── Debug: confirm middleware attached user ──
    console.log('[addProject] req.user:', req.user);

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized — no user on request' });
    }

    const { title, description, demoUrl } = req.body;

    // ── Field validation ──
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // ── Look up the freelancer profile ──
    let freelancer = await FreelancerProfile.findOne({ userId: req.user._id });
    console.log('[addProject] freelancer profile found:', freelancer ? freelancer._id : 'NOT FOUND — will create one');

    // ── Auto-create profile if it doesn't exist yet ──
    // This handles accounts registered before the profile-creation fix was applied.
    if (!freelancer) {
      freelancer = await FreelancerProfile.create({
        userId:     req.user._id,
        title:      'Freelancer',
        skills:     [],
        hourlyRate: 0,
        category:   'general',
      });
      console.log('[addProject] auto-created FreelancerProfile:', freelancer._id);
    }

    // ── Create the project ──
    const project = await Project.create({
      user:          req.user._id,
      freelancerId:  freelancer._id,   // ← Populated from DB, never from frontend
      title,
      description,
      demoUrl:       demoUrl || undefined,
      demoAvailable: !!demoUrl,
    });

    console.log('[addProject] project created:', project._id);
    res.status(201).json(project);

  } catch (error) {
    console.error('[addProject] ERROR:', error.message, error.errors || '');
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, addProject };
