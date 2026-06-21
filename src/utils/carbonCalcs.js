// Carbon Footprint Emission Factors (in kg of CO2 equivalent per unit)

export const EMISSION_FACTORS = {
  transport: {
    // values per km
    carPetrol: 0.170,
    carDiesel: 0.171,
    carHybrid: 0.103,
    carElectric: 0.047,
    train: 0.035,
    bus: 0.096,
    flightShort: 0.150, // < 1500km
    flightLong: 0.190,  // >= 1500km
  },
  energy: {
    // values per kWh
    electricity: 0.380, // average grid intensity
    gas: 0.180,
  },
  diet: {
    // values per meal
    beefLamb: 7.2,
    poultryPork: 2.1,
    vegetarian: 0.8,
    vegan: 0.5,
  },
  goods: {
    // values per item
    clothing: 10.0,
    electronics: 150.0,
    packagingPlastic: 1.5,
  }
};

// Micro-action CO2 savings in kg
export const MICRO_ACTIONS = [
  {
    id: "unplug_standby",
    label: "Unplugged Standby Power",
    description: "Switched off unused chargers or standby electronics.",
    savings: 0.05, // 50g CO2
    category: "energy",
    icon: "PlugZap"
  },
  {
    id: "cold_shower",
    label: "Cold or Shorter Shower",
    description: "Kept shower under 5 mins or washed in cold water.",
    savings: 0.15, // 150g CO2
    category: "energy",
    icon: "ShowerHead"
  },
  {
    id: "reusable_item",
    label: "Used Reusable Containers",
    description: "Avoided single-use plastic water bottles, cups, or bags.",
    savings: 0.08, // 80g CO2
    category: "waste",
    icon: "ShoppingBag"
  },
  {
    id: "recycle_waste",
    label: "Recycled Waste",
    description: "Sorted and recycled plastic, metal, glass, or paper.",
    savings: 0.10, // 100g CO2
    category: "waste",
    icon: "Recycle"
  },
  {
    id: "compost",
    label: "Composted Scraps",
    description: "Composted organic food waste instead of throwing it away.",
    savings: 0.12, // 120g CO2
    category: "waste",
    icon: "Leaf"
  },
  {
    id: "walk_short",
    label: "Walked / Biked short trip",
    description: "Chose active transit instead of driving a short distance (~2km).",
    savings: 0.34, // 340g CO2
    category: "transport",
    icon: "Footprints"
  },
  {
    id: "dry_clothes",
    label: "Air-Dried Laundry",
    description: "Used clothesline/rack instead of a tumble dryer load.",
    savings: 0.40, // 400g CO2
    category: "energy",
    icon: "Wind"
  },
  {
    id: "lower_hvac",
    label: "Adjusted Thermostat",
    description: "Turned down heating / turned up AC for 2 hours.",
    savings: 0.60, // 600g CO2
    category: "energy",
    icon: "Thermometer"
  }
];

// Daily carbon footprint budget (target in kg CO2 equivalent)
// Global target to reach net zero by 2050 is roughly ~3.0 - 4.0 tonnes per person annually
// 4000kg / 365 days = ~11.0 kg/day per person
export const DAILY_BUDGET = 11.0;

/**
 * Calculates carbon emissions (in kg) based on category and parameters.
 */
export function calculateEmission(category, type, quantity) {
  const numQty = parseFloat(quantity) || 0;
  if (category === 'transport') {
    return (EMISSION_FACTORS.transport[type] || 0) * numQty;
  }
  if (category === 'energy') {
    return (EMISSION_FACTORS.energy[type] || 0) * numQty;
  }
  if (category === 'diet') {
    return (EMISSION_FACTORS.diet[type] || 0) * numQty;
  }
  if (category === 'goods') {
    return (EMISSION_FACTORS.goods[type] || 0) * numQty;
  }
  return 0;
}
