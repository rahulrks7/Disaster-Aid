const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const DisasterReport = require('../models/DisasterReport');
const HelpRequest = require('../models/HelpRequest');
const VolunteerProfile = require('../models/VolunteerProfile');
const ResponseTask = require('../models/ResponseTask');
const Resource = require('../models/Resource');
const ResourceTransaction = require('../models/ResourceTransaction');
const Shelter = require('../models/Shelter');
const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      DisasterReport.deleteMany({}),
      HelpRequest.deleteMany({}),
      VolunteerProfile.deleteMany({}),
      ResponseTask.deleteMany({}),
      Resource.deleteMany({}),
      ResourceTransaction.deleteMany({}),
      Shelter.deleteMany({}),
      Alert.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Creating core users...');
    // 1. Admin
    const adminUser = await User.create({
      name: 'Dr. Evelyn Reed (Chief Coordinator)',
      email: 'admin@disasteraid.org',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98111 22233',
      address: 'Central Emergency Operations Center, Sector 1',
    });

    // 2. Volunteers
    const vol1 = await User.create({
      name: 'Alex Turner (Rescue Lead)',
      email: 'volunteer@disasteraid.org',
      password: 'volunteer123',
      role: 'volunteer',
      phone: '+91 98222 33344',
      address: 'North District Response Base',
    });

    const vol2 = await User.create({
      name: 'Dr. Priya Sharma (Medical EMT)',
      email: 'priya.sharma@disasteraid.org',
      password: 'volunteer123',
      role: 'volunteer',
      phone: '+91 98333 44455',
      address: 'Central Zone Health Clinic',
    });

    const vol3 = await User.create({
      name: 'Carlos Mendez (Logistics & Transport)',
      email: 'carlos.mendez@disasteraid.org',
      password: 'volunteer123',
      role: 'volunteer',
      phone: '+91 98444 55566',
      address: 'South Riverway Depot',
    });

    // 3. Citizens
    const citizen1 = await User.create({
      name: 'Rahul Verma',
      email: 'citizen@disasteraid.org',
      password: 'citizen123',
      role: 'citizen',
      phone: '+91 98555 66677',
      address: 'Flat 402, Green Valley Apartments, North Sector',
    });

    const citizen2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@gmail.com',
      password: 'citizen123',
      role: 'citizen',
      phone: '+91 98666 77788',
      address: 'House 12, Riverside Colony',
    });

    console.log('[Seed] Creating volunteer profiles...');
    await VolunteerProfile.create([
      {
        user: vol1._id,
        skills: ['Search & Rescue', 'First Aid', 'Driving/Logistics', 'Water Rescue'],
        experienceYears: 4,
        generalLocation: 'North District',
        locationCoordinates: [77.215, 28.625],
        availability: 'available',
        emergencyContact: '+91 98222 33300',
        completedTasksCount: 12,
        activeTasksCount: 1,
        bio: 'Certified wilderness first responder and rapid deployment rescue specialist.',
      },
      {
        user: vol2._id,
        skills: ['Medical Assistance', 'First Aid', 'Counselling', 'Triage'],
        experienceYears: 6,
        generalLocation: 'Central Zone',
        locationCoordinates: [77.200, 28.608],
        availability: 'available',
        emergencyContact: '+91 98333 44400',
        completedTasksCount: 19,
        activeTasksCount: 1,
        bio: 'Emergency medicine physician assisting in community disaster response.',
      },
      {
        user: vol3._id,
        skills: ['Driving/Logistics', 'Food Distribution', 'Heavy Equipment Support'],
        experienceYears: 3,
        generalLocation: 'South River Area',
        locationCoordinates: [77.220, 28.590],
        availability: 'available',
        emergencyContact: '+91 98444 55500',
        completedTasksCount: 8,
        activeTasksCount: 0,
        bio: 'Commercial truck driver providing relief supply transport and fleet coordination.',
      },
    ]);

    console.log('[Seed] Creating disaster reports...');
    const report1 = await DisasterReport.create({
      title: 'Flash Flood and River Overbank Inundation',
      category: 'flood',
      description:
        'Continuous torrential rains caused the local tributary to overflow. Street water levels have reached 4 feet. Over 50 residential homes cut off from main road.',
      severity: 'critical',
      locationName: 'Green Valley Sector 4 & Riverbank Road',
      location: { type: 'Point', coordinates: [77.215, 28.625] },
      affectedCount: 220,
      images: [
        'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      ],
      reporter: citizen1._id,
      verificationStatus: 'verified',
      responseStatus: 'response_in_progress',
      verifiedBy: adminUser._id,
      verifiedAt: new Date(Date.now() - 4 * 3600 * 1000),
      adminNotes: 'Field teams deployed with inflatable rescue rafts. Evacuation in progress.',
    });

    const report2 = await DisasterReport.create({
      title: 'Commercial Complex Electrical Fire Outbreak',
      category: 'fire',
      description:
        'Severe transformer explosion caused fire on 2nd and 3rd floors of commercial tower. Heavy smoke plume; evacuation required.',
      severity: 'critical',
      locationName: 'Apex Business Center, Central Boulevard',
      location: { type: 'Point', coordinates: [77.200, 28.608] },
      affectedCount: 85,
      images: [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      ],
      reporter: citizen2._id,
      verificationStatus: 'verified',
      responseStatus: 'response_in_progress',
      verifiedBy: adminUser._id,
      verifiedAt: new Date(Date.now() - 6 * 3600 * 1000),
      adminNotes: 'Fire trucks and medical triage ambulance unit on scene.',
    });

    const report3 = await DisasterReport.create({
      title: 'Major Hillside Landslide Blocking NH-44 Corridor',
      category: 'landslide',
      description:
        'Mud and massive boulders slid down blocking 300 meters of national highway. Multiple vehicles stranded in freezing temperature.',
      severity: 'high',
      locationName: 'National Highway 44, Mile Marker 28',
      location: { type: 'Point', coordinates: [77.230, 28.635] },
      affectedCount: 140,
      images: [
        'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&w=800&q=80',
      ],
      reporter: citizen1._id,
      verificationStatus: 'verified',
      responseStatus: 'reported',
      verifiedBy: adminUser._id,
      verifiedAt: new Date(Date.now() - 2 * 3600 * 1000),
      adminNotes: 'Heavy earthmovers requested from civil works department.',
    });

    const report4 = await DisasterReport.create({
      title: 'Severe Cyclone Wind Gale and Tree Fall Damaging Power Lines',
      category: 'cyclone',
      description:
        'Tropical cyclone gust speeds exceeded 90 km/h. Multiple fallen trees crushed electric lines causing localized blackout and roof damages.',
      severity: 'high',
      locationName: 'East Coastal Belt & Fishermen Colony',
      location: { type: 'Point', coordinates: [77.220, 28.59] },
      affectedCount: 310,
      images: [
        'https://images.unsplash.com/photo-1505672678570-b4670493ddb1?auto=format&fit=crop&w=800&q=80',
      ],
      reporter: citizen2._id,
      verificationStatus: 'verified',
      responseStatus: 'resolved',
      verifiedBy: adminUser._id,
      verifiedAt: new Date(Date.now() - 24 * 3600 * 1000),
      adminNotes: 'Power restored and debris cleared by civic rescue volunteers.',
    });

    const report5 = await DisasterReport.create({
      title: 'Bridge Structural Cracks Noticed After Tremors',
      category: 'earthquake',
      description:
        'Citizens observed visible deep cracks on the pillars of Old Canal Bridge after minor earthquake tremors. Requesting civil engineer inspection.',
      severity: 'medium',
      locationName: 'Old Canal Bridge, West Sector',
      location: { type: 'Point', coordinates: [77.195, 28.618] },
      affectedCount: 0,
      images: [],
      reporter: citizen1._id,
      verificationStatus: 'pending',
      responseStatus: 'reported',
      adminNotes: 'Pending field survey inspection.',
    });

    console.log('[Seed] Creating emergency help requests...');
    const helpReq1 = await HelpRequest.create({
      requestType: 'rescue',
      description:
        'Elderly couple (aged 78 and 82) trapped on second floor patio due to rapid flash flood waters. Require immediate raft rescue.',
      locationName: 'House 44B, Riverside Colony, Sector 4',
      location: { type: 'Point', coordinates: [77.215, 28.625] },
      affectedPeople: 2,
      priority: 'critical',
      status: 'in_progress',
      requester: citizen1._id,
      contactPhone: '+91 98555 66677',
      adminNotes: 'Assigned to Volunteer Alex Turner with emergency boat unit.',
    });

    const helpReq2 = await HelpRequest.create({
      requestType: 'medicine',
      description:
        'Diabetic patient lost insulin supplies in fire evacuation. Needs rapid delivery of Lantus insulin and syringes.',
      locationName: 'Apex Business Center Evacuation Zone / Shelter 1',
      location: { type: 'Point', coordinates: [77.200, 28.608] },
      affectedPeople: 1,
      priority: 'high',
      status: 'accepted',
      requester: citizen2._id,
      contactPhone: '+91 98666 77788',
      adminNotes: 'Dr. Priya Sharma dispatching medical kit.',
    });

    const helpReq3 = await HelpRequest.create({
      requestType: 'food',
      description:
        '18 stranded bus passengers and families at NH-44 landslide blockade have been without food and water for 7 hours.',
      locationName: 'NH-44 Mile 28 Roadside Stoppage',
      location: { type: 'Point', coordinates: [77.230, 28.635] },
      affectedPeople: 18,
      priority: 'high',
      status: 'pending',
      requester: citizen1._id,
      contactPhone: '+91 98555 66677',
    });

    console.log('[Seed] Creating response tasks...');
    const task1 = await ResponseTask.create({
      title: 'Water Rescue & Evacuation of Trapped Elderly Residents',
      description:
        'Deploy with raft to House 44B Riverside Colony to safely evacuate two stranded senior citizens to North District Community Shelter.',
      disasterReport: report1._id,
      helpRequest: helpReq1._id,
      assignedVolunteers: [vol1._id],
      priority: 'critical',
      locationName: 'House 44B, Riverside Colony, Sector 4',
      location: { type: 'Point', coordinates: [77.215, 28.625] },
      status: 'in_progress',
      createdBy: adminUser._id,
      statusHistory: [
        {
          status: 'assigned',
          changedBy: adminUser._id,
          timestamp: new Date(Date.now() - 3 * 3600 * 1000),
          note: 'Assigned to Alex Turner',
        },
        {
          status: 'in_progress',
          changedBy: vol1._id,
          timestamp: new Date(Date.now() - 2 * 3600 * 1000),
          note: 'Boat launched on Sector 4 water channel',
        },
      ],
    });
    helpReq1.assignedTask = task1._id;
    await helpReq1.save();

    const task2 = await ResponseTask.create({
      title: 'Emergency Medical Kit & Insulin Delivery',
      description:
        'Deliver specialized diabetic medication and sterile kits to triage desk at Apex Evacuation zone.',
      disasterReport: report2._id,
      helpRequest: helpReq2._id,
      assignedVolunteers: [vol2._id],
      priority: 'high',
      locationName: 'Apex Business Center Evacuation Zone',
      location: { type: 'Point', coordinates: [77.200, 28.608] },
      status: 'accepted',
      createdBy: adminUser._id,
      statusHistory: [
        {
          status: 'assigned',
          changedBy: adminUser._id,
          timestamp: new Date(Date.now() - 4 * 3600 * 1000),
          note: 'Assigned to Dr. Priya Sharma',
        },
        {
          status: 'accepted',
          changedBy: vol2._id,
          timestamp: new Date(Date.now() - 3 * 3600 * 1000),
          note: 'Medical supplies collected from Central Depot',
        },
      ],
    });
    helpReq2.assignedTask = task2._id;
    await helpReq2.save();

    await ResponseTask.create({
      title: 'Distribute 50 Food & Water Ration Packages to Stranded Travelers',
      description:
        'Coordinate food truck delivery containing high-energy meals and thermal blankets to NH-44 blockade point.',
      disasterReport: report3._id,
      helpRequest: helpReq3._id,
      assignedVolunteers: [],
      priority: 'high',
      locationName: 'NH-44 Mile 28 Roadside Stoppage',
      location: { type: 'Point', coordinates: [77.230, 28.635] },
      status: 'open',
      createdBy: adminUser._id,
    });

    console.log('[Seed] Creating relief resource inventory...');
    const resFood = await Resource.create({
      name: 'High-Calorie Ready-to-Eat Food Ration Packs',
      category: 'food_packages',
      availableQuantity: 420,
      unit: 'packs',
      storageLocation: 'Central Warehouse Depot Alpha, Bay 1',
      minStockLevel: 50,
    });

    const resWater = await Resource.create({
      name: 'Purified Potable Drinking Water Bottles (1L)',
      category: 'drinking_water',
      availableQuantity: 1250,
      unit: 'liters',
      storageLocation: 'Central Warehouse Depot Alpha, Bay 2',
      minStockLevel: 200,
    });

    const resMeds = await Resource.create({
      name: 'Standard Trauma & First-Aid Response Kits',
      category: 'medical_supplies',
      availableQuantity: 185,
      unit: 'kits',
      storageLocation: 'Medical Wing Cold Storage, Bay 4',
      minStockLevel: 30,
    });

    const resBlankets = await Resource.create({
      name: 'Thermal Fleece Emergency Blankets',
      category: 'blankets',
      availableQuantity: 380,
      unit: 'units',
      storageLocation: 'North Depot Sector 3',
      minStockLevel: 60,
    });

    const resVests = await Resource.create({
      name: 'Heavy-Duty Water Rescue Inflatable Life Vests',
      category: 'rescue_equipment',
      availableQuantity: 95,
      unit: 'units',
      storageLocation: 'Marine & Boat Unit Depot',
      minStockLevel: 25,
    });

    // Low stock demonstration item!
    const resAntibiotics = await Resource.create({
      name: 'Critical Antibiotics & Pediatric Burn Dressings',
      category: 'medical_supplies',
      availableQuantity: 8,
      unit: 'kits',
      storageLocation: 'Medical Wing Cold Storage, Bay 5',
      minStockLevel: 20,
    });

    console.log('[Seed] Creating resource transaction logs...');
    await ResourceTransaction.create([
      {
        resource: resFood._id,
        transactionType: 'addition',
        quantity: 500,
        reason: 'Government Disaster Relief Grant Intake',
        destination: 'Central Warehouse Depot Alpha',
        admin: adminUser._id,
        balanceAfter: 500,
      },
      {
        resource: resFood._id,
        transactionType: 'distribution',
        quantity: 80,
        reason: 'Dispatched to Flood Affected Sector 4',
        destination: 'Green Valley Shelter',
        admin: adminUser._id,
        balanceAfter: 420,
      },
      {
        resource: resWater._id,
        transactionType: 'addition',
        quantity: 1500,
        reason: 'Water Utility Restock',
        destination: 'Central Warehouse Depot Alpha',
        admin: adminUser._id,
        balanceAfter: 1500,
      },
      {
        resource: resWater._id,
        transactionType: 'distribution',
        quantity: 250,
        reason: 'Sent to North District Community Shelter',
        destination: 'North District Shelter',
        admin: adminUser._id,
        balanceAfter: 1250,
      },
    ]);

    console.log('[Seed] Creating relief shelters...');
    await Shelter.create([
      {
        name: 'North District Community Relief Center',
        address: 'Sector 7 Community Complex, North Avenue',
        location: { type: 'Point', coordinates: [77.218, 28.63] },
        totalCapacity: 250,
        currentOccupancy: 165,
        facilities: [
          'Food & Clean Water',
          'Medical Assistance Unit',
          'Sleeping Cots & Blankets',
          'Power Generators',
          'Sanitation & Showers',
        ],
        contactPhone: '+91 98111 88899',
        contactEmail: 'northshelter@disasteraid.org',
        operationalStatus: 'active',
        notes: 'Equipped with child play area and wheelchair accessibility ramps.',
      },
      {
        name: 'Central City High School Gymnasium Shelter',
        address: 'Block B, Central Education Precinct',
        location: { type: 'Point', coordinates: [77.205, 28.61] },
        totalCapacity: 400,
        currentOccupancy: 400,
        facilities: [
          'Food',
          'Drinking Water',
          'Emergency First Aid',
          'Sleeping Mats',
          'Backup Power',
        ],
        contactPhone: '+91 98111 77766',
        contactEmail: 'centralshelter@disasteraid.org',
        operationalStatus: 'full',
        notes: 'Currently at peak capacity. Incoming evacuees being redirected to South Zone Sports Complex.',
      },
      {
        name: 'South Zone Indoor Sports Arena',
        address: 'Sports City Road, South Sector 12',
        location: { type: 'Point', coordinates: [77.225, 28.585] },
        totalCapacity: 600,
        currentOccupancy: 120,
        facilities: [
          'Food & Nutrition',
          'Drinking Water',
          'Medical Doctor On-Site',
          'Accessible Facilities',
          'Separate Family Cabins',
        ],
        contactPhone: '+91 98111 55544',
        contactEmail: 'southshelter@disasteraid.org',
        operationalStatus: 'active',
        notes: 'Large parking area for relief convoys and rescue ambulances.',
      },
      {
        name: 'Riverside High Ground Temporary Camp',
        address: 'Hilltop Enclave, East River Ridge',
        location: { type: 'Point', coordinates: [77.235, 28.615] },
        totalCapacity: 150,
        currentOccupancy: 45,
        facilities: ['Food', 'Drinking Water', 'Tents & Cots', 'First Aid'],
        contactPhone: '+91 98111 33322',
        contactEmail: 'riversidecamp@disasteraid.org',
        operationalStatus: 'active',
        notes: 'Ideal staging post for river flood evacuations.',
      },
    ]);

    console.log('[Seed] Creating emergency alerts...');
    await Alert.create([
      {
        title: 'FLASH FLOOD EMERGENCY WARNING: North Tributary Overflow',
        description:
          'River water levels surging beyond critical danger mark. Residents in Green Valley and Sector 4 are advised to move to higher ground or proceed to North District Community Shelter immediately.',
        category: 'flood',
        severity: 'critical',
        affectedArea: 'North District & Riverside Sectors 1-6',
        location: { type: 'Point', coordinates: [77.215, 28.625] },
        startTime: new Date(),
        expiryTime: new Date(Date.now() + 48 * 3600 * 1000),
        createdBy: adminUser._id,
        isActive: true,
      },
      {
        title: 'TRAFFIC DIVERSION & ROAD BLOCK: NH-44 Landslide Hazard',
        description:
          'National Highway 44 blocked at Mile Marker 28 due to active landslide. All commercial and passenger transit diverted through State Highway 12.',
        category: 'landslide',
        severity: 'high',
        affectedArea: 'NH-44 North Corridor',
        location: { type: 'Point', coordinates: [77.23, 28.635] },
        startTime: new Date(),
        expiryTime: new Date(Date.now() + 36 * 3600 * 1000),
        createdBy: adminUser._id,
        isActive: true,
      },
      {
        title: 'SEVERE WEATHER WATCH: Gale Winds and Torrential Showers',
        description:
          'Meteorological department forecasts wind gusts up to 80 km/h with heavy thunderstorms for the next 24 hours. Avoid unnecessary travel and secure loose rooftop fixtures.',
        category: 'weather_warning',
        severity: 'medium',
        affectedArea: 'Entire Metropolitan Region & Coastal Belt',
        location: { type: 'Point', coordinates: [77.209, 28.6139] },
        startTime: new Date(),
        expiryTime: new Date(Date.now() + 24 * 3600 * 1000),
        createdBy: adminUser._id,
        isActive: true,
      },
    ]);

    console.log('[Seed] Creating initial notifications & audit logs...');
    await Notification.create([
      {
        recipient: citizen1._id,
        title: 'Report #RPT-2024-0001 Verified',
        message: 'Your incident report regarding Flash Flood has been verified by Administration. Rescue teams have been deployed.',
        type: 'report',
        link: '/citizen/my-reports',
        isRead: false,
      },
      {
        recipient: vol1._id,
        title: 'Critical Response Task Assigned',
        message: 'You have been assigned to task: "Water Rescue & Evacuation of Trapped Elderly Residents".',
        type: 'task',
        link: '/volunteer/my-tasks',
        isRead: false,
      },
    ]);

    await AuditLog.create([
      {
        user: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'SYSTEM_INITIALIZATION',
        targetModel: 'System',
        details: 'Initial DisasterAid emergency response operational database seeded with live baseline records.',
        ipAddress: '127.0.0.1',
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'ALERT_PUBLISHED',
        targetModel: 'Alert',
        details: 'Published critical flash flood emergency alert for North District.',
        ipAddress: '127.0.0.1',
      },
    ]);

    console.log('[Seed] Database seeded successfully with demo users and realistic emergency records!');
    console.log('----------------------------------------------------');
    console.log('DEMO LOGIN CREDENTIALS:');
    console.log('1. Admin:     admin@disasteraid.org     /  admin123');
    console.log('2. Volunteer: volunteer@disasteraid.org /  volunteer123');
    console.log('3. Citizen:   citizen@disasteraid.org   /  citizen123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

const autoSeedIfEmpty = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('[Seed] Empty database detected. Auto-seeding default demo dataset...');
    await seedData();
  }
};

if (require.main === module) {
  const { connectDB, closeDB } = require('../config/db');
  process.env.AUTO_SEED = 'false';
  connectDB()
    .then(async () => {
      await seedData();
      await closeDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedData, autoSeedIfEmpty };
