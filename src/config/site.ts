// src/config/site.ts
export const WORKING_HOURS = [
  { label: 'Monday - Friday:', time: '9:00 AM - 7:00 PM' },
  { label: 'Saturday:',        time: '10:00 AM - 5:00 PM' },
  { label: 'Sunday:',          time: 'By Appointment' },
];

export const CONTACT = {
  phones: ['+91 99202 14015', '+91 022 2352 2092', '+91 022 2351 3703'],
  emails: ['sahaiestates@yahoo.co.in', 'sahaiestates@gmail.com'],
  addressLine1: '#131, 1st Floor, Arun Chamber,',
  addressLine2: 'Tardeo, Mumbai - 400034',
  rera: 'A51900001512',
  // “Mon-Sat…” label shown under phones in ContactForm box
  phoneAvailability: 'Mon-Sat, 10:00 AM - 7:00 PM',
  // WhatsApp
  whatsappNumberIntl: '919920214015', // no "+" and no leading zeros
  whatsappMessage:
    'Hi, I am interested in learning more about your luxury properties in South Mumbai.',
};

export const SOCIALS = {
  facebook: 'https://www.facebook.com/sahaiestates/',
  x: 'https://twitter.com/sahaiestates131',
  website: 'https://www.sahaiestates.com/',
  // instagram: 'https://instagram.com/yourhandle', // add if needed
};
