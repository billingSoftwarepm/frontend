/**
 * India geography reference data used for the cascading
 * State → City → Pincode selectors across the app.
 *
 * - `INDIAN_STATES`  : all 28 states + 8 union territories (official names).
 * - `CITIES_BY_STATE`: a curated list of major cities/districts per state.
 *   Free-text entry is still allowed in the UI, so this list only needs to
 *   cover the common cases and act as autocomplete suggestions.
 * - Pincode validation uses India Post's regional first-digit scheme so we can
 *   flag an obviously wrong PIN (e.g. a Kerala PIN entered for a Delhi state)
 *   without shipping the full 150k-row pincode database.
 */

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const CITIES_BY_STATE: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Anantapur', 'Kadapa'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
  Assam: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Begusarai'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Nadiad'],
  Haryana: ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'],
  'Himachal Pradesh': ['Shimla', 'Solan', 'Dharamshala', 'Mandi', 'Kullu', 'Bilaspur', 'Baddi'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Shivamogga', 'Tumakuru'],
  Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Palakkad', 'Kottayam'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Satna', 'Rewa', 'Ratlam'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai', 'Kalyan', 'Nanded'],
  Manipur: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'],
  Meghalaya: ['Shillong', 'Tura', 'Jowai', 'Nongstoin'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Sikar'],
  Sikkim: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Secunderabad'],
  Tripura: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Noida', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Nainital'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Kharagpur'],
  'Andaman and Nicobar Islands': ['Port Blair'],
  Chandigarh: ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  Delhi: ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket', 'Pitampura', 'Janakpuri'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
  Ladakh: ['Leh', 'Kargil'],
  Lakshadweep: ['Kavaratti'],
  Puducherry: ['Puducherry', 'Karaikal', 'Yanam', 'Mahe'],
};

/**
 * First digit of an India Post PIN code by state (postal circle scheme).
 * Some states share a leading digit; a few large states span two leading
 * digits so the value can be an array.
 */
export const PIN_FIRST_DIGIT_BY_STATE: Record<string, string[]> = {
  Delhi: ['1'],
  Haryana: ['1'],
  Punjab: ['1'],
  'Himachal Pradesh': ['1'],
  'Jammu and Kashmir': ['1'],
  Ladakh: ['1'],
  Chandigarh: ['1'],
  'Uttar Pradesh': ['2'],
  Uttarakhand: ['2'],
  Rajasthan: ['3'],
  Gujarat: ['3'],
  'Dadra and Nagar Haveli and Daman and Diu': ['3'],
  Chhattisgarh: ['4'],
  'Madhya Pradesh': ['4'],
  Maharashtra: ['4'],
  Goa: ['4'],
  'Andhra Pradesh': ['5'],
  Telangana: ['5'],
  Karnataka: ['5'],
  Kerala: ['6'],
  'Tamil Nadu': ['6'],
  Puducherry: ['6'],
  Lakshadweep: ['6'],
  'West Bengal': ['7'],
  Odisha: ['7'],
  'Arunachal Pradesh': ['7'],
  Assam: ['7'],
  Manipur: ['7'],
  Meghalaya: ['7'],
  Mizoram: ['7'],
  Nagaland: ['7'],
  Tripura: ['7'],
  Sikkim: ['7'],
  'Andaman and Nicobar Islands': ['7'],
  Bihar: ['8'],
  Jharkhand: ['8'],
};

export function citiesForState(state?: string): string[] {
  if (!state) return [];
  return CITIES_BY_STATE[state] ?? [];
}

/** Flat, de-duplicated, sorted list of every city — used where no state field
 *  exists to drive a cascade (e.g. the invoice/receipt city autocomplete). */
export const ALL_CITIES: string[] = Array.from(
  new Set(Object.values(CITIES_BY_STATE).flat()),
).sort((a, b) => a.localeCompare(b));

/**
 * Validate an Indian PIN code. Returns an error string, or null when valid
 * (an empty value is treated as valid so the field can remain optional).
 * When a state is supplied we additionally check the leading digit against the
 * postal circle for that state.
 */
export function validatePincode(pincode?: string, state?: string): string | null {
  if (!pincode) return null;
  const value = pincode.trim();
  if (!/^\d{6}$/.test(value)) return 'PIN code must be 6 digits';
  if (value[0] === '0') return 'PIN code cannot start with 0';
  if (state && PIN_FIRST_DIGIT_BY_STATE[state]) {
    const allowed = PIN_FIRST_DIGIT_BY_STATE[state];
    if (!allowed.includes(value[0])) {
      return `PIN code for ${state} should start with ${allowed.join(' or ')}`;
    }
  }
  return null;
}
