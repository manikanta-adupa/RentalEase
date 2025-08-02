const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Core relationships
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tenant is required'],
    index: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property is required'],
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property owner is required'],
    index: true
  },

  // Application status
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'withdrawn', 'expired'],
      message: 'Status must be pending, approved, rejected, withdrawn, or expired'
    },
    default: 'pending',
    index: true
  },

  // Tenant application details
  message: {
    type: String,
    required: [true, 'Application message is required'],
    trim: true,
    minlength: [10, 'Application message must be at least 10 characters'],
    maxlength: [1000, 'Application message cannot exceed 1000 characters']
  },

  preferredMoveInDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return date >= new Date();
      },
      message: 'Preferred move-in date must be in the future'
    }
  },

  // Documents uploaded by tenant
  documents: [{
    type: {
      type: String,
      enum: ['id_proof', 'salary_slip', 'bank_statement', 'reference_letter', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Owner response
  ownerResponse: {
    type: String,
    trim: true,
    maxlength: [500, 'Owner response cannot exceed 500 characters']
  },

  // Timestamps
  applicationDate: {
    type: Date,
    default: Date.now,
    index: true
  },

  decisionDate: {
    type: Date
  },

  // Auto-rejection tracking
  autoRejected: {
    type: Boolean,
    default: false,
    index: true
  },

  // System fields
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  // Additional tenant information
  tenantInfo: {
    occupation: {
      type: String,
      trim: true,
      maxlength: [100, 'Occupation cannot exceed 100 characters']
    },
    monthlyIncome: {
      type: Number,
      min: [0, 'Monthly income must be positive']
    },
    familySize: {
      type: Number,
      min: [1, 'Family size must be at least 1'],
      max: [20, 'Family size cannot exceed 20']
    },
    haspets: {
      type: Boolean,
      default: false
    },
    smokingAllowed: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
applicationSchema.index({ tenant: 1, property: 1 }, { unique: true }); // One application per tenant per property
applicationSchema.index({ property: 1, status: 1 }); // Owner queries
applicationSchema.index({ tenant: 1, status: 1 }); // Tenant queries
applicationSchema.index({ owner: 1, status: 1, applicationDate: -1 }); // Owner dashboard
applicationSchema.index({ status: 1, applicationDate: -1 }); // Admin queries

// Virtual for application age in days
applicationSchema.virtual('applicationAgeInDays').get(function() {
  return Math.floor((new Date() - this.applicationDate) / (1000 * 60 * 60 * 24));
});

// Virtual for response time (if decided)
applicationSchema.virtual('responseTimeInDays').get(function() {
  if (!this.decisionDate) return null;
  return Math.floor((this.decisionDate - this.applicationDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
applicationSchema.pre('save', async function(next) {
  // Set decision date when status changes from pending
  if (this.isModified('status') && this.status !== 'pending' && !this.decisionDate) {
    this.decisionDate = new Date();
  }

  // Validate that tenant and owner are different
  if (this.tenant.toString() === this.owner.toString()) {
    throw new Error('Property owner cannot apply to their own property');
  }

  next();
});

// CRITICAL FIX: Add application expiry logic
applicationSchema.statics.expireOldApplications = async function() {
  try {
    // Expire applications older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await this.updateMany(
      {
        status: 'pending',
        applicationDate: { $lt: thirtyDaysAgo },
        isActive: true
      },
      {
        status: 'expired',
        decisionDate: new Date(),
        ownerResponse: 'Application automatically expired after 30 days of no response'
      }
    );
    
    console.log(`Expired ${result.modifiedCount} old applications`);
    return result;
  } catch (error) {
    console.error('Error expiring old applications:', error);
    throw error;
  }
};

// Virtual to check if application should be expired
applicationSchema.virtual('shouldExpire').get(function() {
  if (this.status !== 'pending') return false;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.applicationDate < thirtyDaysAgo;
});

// Pre-save middleware to populate owner from property
applicationSchema.pre('save', async function(next) {
  // Skip validation if owner is already set (transaction scenario from controller)
  if (this.owner) {
    return next();
  }
  
  if (this.isNew || this.isModified('property')) {
    try {
      const Property = mongoose.model('Property');
      const property = await Property.findById(this.property);
      
      if (!property) {
        throw new Error('Property not found');
      }
      
      if (!property.isAvailable) {
        throw new Error('Cannot apply to unavailable property');
      }
      
      this.owner = property.owner;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static methods
//find applications by tenant
applicationSchema.statics.findByTenant = function(tenantId, options = {}) {
  const query = { tenant: tenantId, isActive: true };
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('property', 'title location pricing images propertyType')
    .populate('owner', 'name email phone')
    .sort({ applicationDate: -1 });
};

//find applications by owner
applicationSchema.statics.findByOwner = function(ownerId, options = {}) {
  const query = { owner: ownerId, isActive: true };
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('tenant', 'name email phone profilePicture')
    .populate('property', 'title location pricing')
    .sort({ applicationDate: -1 });
};

//find applications by property
applicationSchema.statics.findByProperty = function(propertyId, options = {}) {
  const query = { property: propertyId, isActive: true };
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('tenant', 'name email phone profilePicture')
    .sort({ applicationDate: -1 });
};

// Instance methods
//approve application
applicationSchema.methods.approve = async function(ownerResponse) {
  const mongoose = require('mongoose');
  
  if (this.status !== 'pending') {
    throw new Error('Can only approve pending applications');
  }
  
  // Start a transaction to ensure data consistency
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Approve this application
  this.status = 'approved';
  this.ownerResponse = ownerResponse;
  this.decisionDate = new Date();
    await this.save({ session });
    
    // 2. Mark property as unavailable
    const Property = mongoose.model('Property');
    await Property.findByIdAndUpdate(
      this.property,
      { 
        isAvailable: false,
        rentedDate: new Date(),
        currentTenant: this.tenant
      },
      { session }
    );
    
    // 3. Auto-reject all other pending applications for this property
    const rejectionMessage = `Property has been rented to another applicant. Thank you for your interest. We encourage you to explore other available properties.`;
    
    await mongoose.model('Application').updateMany(
      {
        property: this.property,
        status: 'pending',
        _id: { $ne: this._id }
      },
      {
        status: 'rejected',
        ownerResponse: rejectionMessage,
        decisionDate: new Date(),
        autoRejected: true
      },
      { session }
    );
    
    await session.commitTransaction();
    return this;
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

//reject application
applicationSchema.methods.reject = function(ownerResponse) {
  if (this.status !== 'pending') {
    throw new Error('Can only reject pending applications');
  }
  
  this.status = 'rejected';
  this.ownerResponse = ownerResponse;
  this.decisionDate = new Date();
  
  return this.save();
};

//withdraw application
applicationSchema.methods.withdraw = function() {
  if (this.status !== 'pending') {
    throw new Error('Can only withdraw pending applications');
  }
  
  this.status = 'withdrawn';
  this.decisionDate = new Date();
  
  return this.save();
};

// Export model
module.exports = mongoose.model('Application', applicationSchema); 