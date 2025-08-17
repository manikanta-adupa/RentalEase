const Application = require('../models/Application');
const Property = require('../models/Property');
const User = require('../models/User');
const emailService = require('../services/emailService');

// @desc    Create new application (Tenant applies for property)
// @route   POST /api/applications
// @access  Private (Tenant only)
const createApplication = async (req, res) => {
  try {
    const {
      property,
      message,
      preferredMoveInDate,
      documents,
      tenantInfo
    } = req.body;

    // Validate tenant role
    // if (req.user.role !== 'tenant') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Only tenants can create applications'
    //   });
    // }

    // Check if property exists and is available
    const propertyDoc = await Property.findById(property);
    if (!propertyDoc) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (!propertyDoc.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for rent'
      });
    }

    // Simplified approach without transactions to avoid session conflicts
    // Re-check property availability and existing application
    const [updatedProperty, existingApplication] = await Promise.all([
      Property.findById(property),
      Application.findOne({
        tenant: req.user.id,
        property: property,
        isActive: true
      })
    ]);

    // Double-check property exists and is still available
    if (!updatedProperty || !updatedProperty.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Property is no longer available for rent'
      });
    }

    // Double-check no duplicate application exists
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this property',
        existingApplication: {
          id: existingApplication._id,
          status: existingApplication.status,
          applicationDate: existingApplication.applicationDate
        }
      });
    }

    // CRITICAL: Validate tenant cannot apply to own property
    if (updatedProperty.owner.toString() === req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Property owners cannot apply to their own properties'
      });
    }

    // Create new application
    const application = new Application({
      tenant: req.user.id,
      property,
      owner: updatedProperty.owner,
      message,
      preferredMoveInDate,
      documents: documents || [],
      tenantInfo: tenantInfo || {}
    });

    await application.save();

    // Populate for response and email notification
    await application.populate([
      { path: 'property', select: 'title address city state monthlyRent propertyType images' },
      { path: 'owner', select: 'name email phone' },
      { path: 'tenant', select: 'name email phone address' }
    ]);

    // Send owner notification email
    try {
      await Promise.all([
        emailService.sendNewApplicationEmail(
          application.owner.email,
          application.owner.name,
          application.tenant,
          application.property,
          application.message
        ),
      ]);
    } catch (error) {
      console.error('Error sending owner notification email:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });

  } catch (error) {
    console.error('Error creating application:', error);
    
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this property'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating application',
      error: error.message
    });
  }
};

// @desc    Get applications I have applied for (as tenant)
// @route   GET /api/applications/my
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await Application.find({ tenant: userId })
      .populate('property', 'title address city state monthlyRent propertyType images')
      .populate('owner', 'name email phone');
    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your applications',
      error: error.message
    });
  }
};

// @desc    Get applications received for my properties (as owner)
// @route   GET /api/applications/received
// @access  Private
const getApplicationsForMyProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all properties owned by the user
    const myPropertyIds = await Property.find({ owner: userId }).distinct('_id');
    // Find all applications for those properties
    const applications = await Application.find({ property: { $in: myPropertyIds } })
      .populate('property', 'title address city state monthlyRent propertyType images')
      .populate('tenant', 'name email phone');
    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications for your properties',
      error: error.message
    });
  }
};


// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    const application = await Application.findById(applicationId)
      .populate('tenant', 'name email phone profilePicture address')
      .populate({
        path: 'property',
        select: 'title description location pricing amenities images propertyType owner',
        populate: { path: 'owner', select: 'name email phone' }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Access: tenant or property owner
    const isTenant = application.tenant._id.toString() === userId;
    const isPropertyOwner = application.property.owner._id.toString() === userId;
    if (!isTenant && !isPropertyOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

// @desc    Update application status (Owner approves/rejects)
// @route   PUT /api/applications/:id
// @access  Private (Owner only)
const updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status, ownerResponse } = req.body;
    const userId = req.user.id;

    // Validate owner of the property not by role
    if (application.property.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update applications for your own properties'
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    // Find application
    const application = await Application.findById(applicationId)
      .populate('tenant', 'name email')
      .populate('property', 'title location');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the property
    if (application.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update applications for your own properties'
      });
    }

    // Check if application is still pending
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update application with status: ${application.status}`
      });
    }

    // Update application status
    if (status === 'approved') {
      await application.approve(ownerResponse);
    } else {
      await application.reject(ownerResponse);
    }

    // Reload with populated fields
    await application.populate([
      { path: 'tenant', select: 'name email phone' },
      { path: 'property', select: 'title location pricing' }
    ]);

    // Send email notifications
    const tenantEmail = application.tenant.email;
    const tenantName = application.tenant.name;
    const propertyTitle = application.property.title;

    try {
      await Promise.all([
        emailService.sendApplicationStatusEmailEnhanced(tenantEmail, tenantName, status, {property: propertyTitle, ownerMessage: ownerResponse}),
      ]);
    } catch (error) {
      console.error('Error sending email notifications:', error);
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

// @desc    Withdraw application (Tenant cancels their application)
// @route   PUT /api/applications/:id/withdraw
// @access  Private (Tenant only)
const withdrawApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    // Validate ony person who applied for the property can withdraw the application
    if (application.tenant.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the tenant who applied for the property can withdraw the application'
      });
    }

    // Find application
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the application
    if (application.tenant.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications'
      });
    }

    // Withdraw application
    await application.withdraw();

    // Populate for response
    await application.populate([
      { path: 'property', select: 'title location pricing' },
      { path: 'owner', select: 'name email phone' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application
    });

  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      message: 'Error withdrawing application',
      error: error.message
    });
  }
};

// @desc    Get applications for a specific property (Owner only)
// @route   GET /api/applications/property/:propertyId
// @access  Private (Owner only)
const getApplicationsByProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user.id;
    const { status } = req.query;

    // Validate only owner of the property can view the applications
    if (property.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only property owners can view property applications'
      });
    }

    // Check if user owns the property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view applications for your own properties'
      });
    }

    // Get applications for this property
    const options = {};
    if (status) options.status = status;

    const applications = await Application.findByProperty(propertyId, options);

    res.status(200).json({
      success: true,
      data: applications,
      property: {
        id: property._id,
        title: property.title,
        location: property.location
      }
    });

  } catch (error) {
    console.error('Error fetching property applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property applications',
      error: error.message
    });
  }
};

// @desc    Get application statistics (Dashboard data)
// @route   GET /api/applications/stats
// @access  Private
const getApplicationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Applications where user is the tenant (applied for)
    const myApplications = await Application.aggregate([
      { $match: { tenant: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 2. Applications for properties the user owns (received)
    // First, get all property IDs owned by the user
    const myPropertyIds = await Property.find({ owner: userId }).distinct('_id');
    const receivedApplications = await Application.aggregate([
      { $match: { property: { $in: myPropertyIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Helper to convert aggregation result to object
    const statsToObj = (arr) =>
      arr.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

    res.status(200).json({
      success: true,
      myApplications: statsToObj(myApplications),
      receivedApplications: statsToObj(receivedApplications)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application statistics',
      error: error.message
    });
  }
};

// Debug endpoint - get all applications (temporary)
const getAllApplicationsDebug = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('tenant', 'name email')
      .populate('owner', 'name email')
      .populate('property', 'title isAvailable currentTenant')
      .select('tenant owner property status isActive applicationDate autoRejected')
      .sort({ applicationDate: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Data migration endpoint - fix inconsistent application states
const fixInconsistentData = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    console.log('🔧 Starting data consistency fix...');
    
    // Step 1: Find all approved applications
    const approvedApplications = await Application.find({ 
      status: 'approved', 
      isActive: true 
    })
    .populate('property', 'title isAvailable currentTenant')
    .populate('tenant', 'name email');

    console.log(`Found ${approvedApplications.length} approved applications`);

    let fixedProperties = 0;
    let autoRejectedApplications = 0;
    const results = [];

    // Step 2: Process each approved application
    for (const approvedApp of approvedApplications) {
      const propertyId = approvedApp.property._id;
      const property = approvedApp.property;
      
      console.log(`\n📋 Processing approved application for: ${property.title}`);
      
      // Check if property needs fixing
      const needsPropertyUpdate = property.isAvailable === true || 
                                 property.currentTenant?.toString() !== approvedApp.tenant._id.toString();
      
      // Find other pending applications for this property
      const pendingApplications = await Application.find({
        property: propertyId,
        status: 'pending',
        isActive: true,
        _id: { $ne: approvedApp._id }
      }).populate('tenant', 'name email');

      console.log(`Found ${pendingApplications.length} pending applications to auto-reject`);

      // Start transaction for this property
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Fix property status if needed
        if (needsPropertyUpdate) {
          await Property.findByIdAndUpdate(
            propertyId,
            {
              isAvailable: false,
              rentedDate: approvedApp.decisionDate || approvedApp.applicationDate,
              currentTenant: approvedApp.tenant._id
            },
            { session }
          );
          fixedProperties++;
          console.log(`✅ Fixed property availability`);
        }

        // Auto-reject pending applications
        if (pendingApplications.length > 0) {
          const rejectionMessage = `Property has been rented to another applicant. Thank you for your interest. We encourage you to explore other available properties. (Auto-updated for data consistency)`;
          
          await Application.updateMany(
            {
              property: propertyId,
              status: 'pending',
              _id: { $ne: approvedApp._id }
            },
            {
              status: 'rejected',
              ownerResponse: rejectionMessage,
              decisionDate: new Date(),
              autoRejected: true
            },
            { session }
          );

          autoRejectedApplications += pendingApplications.length;
          console.log(`✅ Auto-rejected ${pendingApplications.length} pending applications`);
        }

        await session.commitTransaction();

        results.push({
          propertyId: propertyId,
          propertyTitle: property.title,
          approvedTenant: approvedApp.tenant.name,
          propertyFixed: needsPropertyUpdate,
          pendingApplicationsRejected: pendingApplications.length,
          rejectedTenants: pendingApplications.map(app => app.tenant.name)
        });

      } catch (error) {
        await session.abortTransaction();
        console.error(`❌ Error processing property ${property.title}:`, error.message);
        results.push({
          propertyId: propertyId,
          propertyTitle: property.title,
          error: error.message
        });
      } finally {
        session.endSession();
      }
    }

    console.log('\n🎯 Data consistency fix completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Properties fixed: ${fixedProperties}`);
    console.log(`   - Applications auto-rejected: ${autoRejectedApplications}`);

    res.status(200).json({
      success: true,
      message: 'Data consistency fix completed',
      summary: {
        approvedApplicationsProcessed: approvedApplications.length,
        propertiesFixed: fixedProperties,
        applicationsAutoRejected: autoRejectedApplications
      },
      results: results
    });

  } catch (error) {
    console.error('Error fixing inconsistent data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing inconsistent data',
      error: error.message
    });
  }
};

// Diagnostic endpoint - show data inconsistencies
const diagnoseDataInconsistencies = async (req, res) => {
  try {
    console.log('🔍 Diagnosing data inconsistencies...');

    // Find approved applications
    const approvedApplications = await Application.find({ 
      status: 'approved', 
      isActive: true 
    })
    .populate('property', 'title isAvailable currentTenant rentedDate')
    .populate('tenant', 'name email');

    const inconsistencies = [];

    for (const approvedApp of approvedApplications) {
      const property = approvedApp.property;
      const issues = [];

      // Check property availability
      if (property.isAvailable === true) {
        issues.push('Property still marked as available');
      }

      // Check current tenant
      if (!property.currentTenant || property.currentTenant.toString() !== approvedApp.tenant._id.toString()) {
        issues.push('Property currentTenant not set to approved tenant');
      }

      // Check for pending applications
      const pendingCount = await Application.countDocuments({
        property: property._id,
        status: 'pending',
        isActive: true,
        _id: { $ne: approvedApp._id }
      });

      if (pendingCount > 0) {
        issues.push(`${pendingCount} other pending applications still exist`);
      }

      if (issues.length > 0) {
        inconsistencies.push({
          propertyId: property._id,
          propertyTitle: property.title,
          approvedTenant: approvedApp.tenant.name,
          approvedDate: approvedApp.decisionDate,
          issues: issues,
          pendingApplicationsCount: pendingCount
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Data inconsistency diagnosis completed',
      totalApprovedApplications: approvedApplications.length,
      inconsistenciesFound: inconsistencies.length,
      inconsistencies: inconsistencies
    });

  } catch (error) {
    console.error('Error diagnosing data:', error);
    res.status(500).json({
      success: false,
      message: 'Error diagnosing data inconsistencies',
      error: error.message
    });
  }
};

module.exports = {
  createApplication,
  // getApplications,
  getMyApplications,
  getApplicationsForMyProperties,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationsByProperty,
  getApplicationStats,
  getAllApplicationsDebug,
  fixInconsistentData,
  diagnoseDataInconsistencies
}; 