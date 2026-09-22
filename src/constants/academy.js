/* Destinations shared by the Academy nav and every page that links out to the
   same places. They live here rather than in each view because the nav now
   renders on five pages: a copy per page is a copy that can drift, and a nav
   whose "Apply now" goes somewhere different depending on which page you
   clicked it from is the exact bug this file exists to prevent. */

// Where every "Apply" button on the site sends you: the internal registration
// route (the same place ACADEMY_URL points — applying is joining, and the
// enrollment form lives on that page). It was an external Google Form opened in
// a new tab; it is one constant precisely so all the Apply buttons move together
// and can't drift apart.
export const APPLY_URL = '/registration'

// Member sign-in.
export const LOGIN_URL = '/login'

// "Academy" points at the enrollment form rather than the tour: someone
// clicking it wants to join, and the tour is already what they are looking at.
export const ACADEMY_URL = '/registration'

// Partner / sponsor portal — the live sign-in + monitoring page at
// views/school-portal/PartnerPage.vue (route /school/partner, alias /partner).
// It used to point at the "/partners" coming-soon placeholder; now "Partners"
// in the nav opens the real portal.
export const PARTNERS_URL = '/school/partner'

// The tour itself — where the "Programs" anchor lives.
export const TOUR_URL = '/academy'

// Tech-Team "coming soon" page. The nav's "Tech-Team" item used to scroll to
// the Programs section on the tour; now it lands here instead.
export const TECH_TEAM_URL = '/tech-team'

// Route name of the tour. Checked instead of the path because /academy also
// answers to /BoiAcademy, /boiacademy and /boi-academy, and a path comparison
// would miss those aliases.
export const TOUR_ROUTE_NAME = 'BoiAcademy'
