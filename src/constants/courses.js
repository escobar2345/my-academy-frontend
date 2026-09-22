/* The school's course catalog — the one list of what BOIRSU teaches, how many
   weeks each course runs and who it suits. It lives here rather than inside
   registration.vue because two pages now need it, and a copy per page is a copy
   that can drift:

     - boi-school/registration.vue renders it as the course picker.
     - views/school-portal/PartnerPage.vue reads it to answer "how long will this
       course take?" for a parent monitoring their child. Registration never
       persisted a duration, so for courses without a published roadmap this
       catalog is the school's only real statement of course length.

   `wks` stays the pre-formatted display string registration prints ("16 WKS");
   courseWeeks() parses it for anything that needs the number. */

export const COURSES = [
  { name: 'Frontend Web Development', em: '🧩', desc: 'Build beautiful websites with HTML, CSS & JavaScript.', wks: '16 WKS', lvl: 'BEGINNER FRIENDLY' },
  { name: 'Backend & APIs', em: '⚙️', desc: 'Servers, databases and the logic behind apps (Node, Python).', wks: '20 WKS', lvl: 'SOME CODING' },
  { name: 'Full-Stack Web Development', em: '🚀', desc: 'The complete journey — frontend through backend.', wks: '28 WKS', lvl: 'BEGINNER FRIENDLY' },
  { name: 'Mobile App Development', em: '📱', desc: 'Build Android & iOS apps with Flutter or React Native.', wks: '20 WKS', lvl: 'SOME CODING' },
  { name: 'UI/UX Product Design', em: '🎨', desc: 'Design apps people love — Figma, research & prototyping.', wks: '12 WKS', lvl: 'BEGINNER FRIENDLY' },
  { name: 'Graphic Design & Branding', em: '🖌️', desc: 'Logos, posters, brand systems — Adobe & Canva.', wks: '10 WKS', lvl: 'BEGINNER FRIENDLY' },
  { name: 'Data Analysis', em: '📊', desc: 'Excel, SQL & Power BI — turn data into decisions.', wks: '14 WKS', lvl: 'BEGINNER FRIENDLY' },
  { name: 'Data Science & AI', em: '🤖', desc: 'Python, machine learning and real AI projects.', wks: '20 WKS', lvl: 'SOME CODING' },
  { name: 'Cloud Computing & DevOps', em: '☁️', desc: 'AWS, Azure, Docker & Kubernetes — ship like a pro.', wks: '18 WKS', lvl: 'SOME CODING' },
  { name: 'Cybersecurity', em: '🛡️', desc: 'Protect systems, networks and data. Ethical hacking.', wks: '18 WKS', lvl: 'SOME CODING' },
  { name: 'Blockchain & Web3', em: '⛓️', desc: 'Smart contracts, Solidity, DeFi and dApps.', wks: '16 WKS', lvl: 'SOME CODING' },
  { name: 'Digital Marketing', em: '📣', desc: 'SEO, paid ads, content & social media growth.', wks: '10 WKS', lvl: 'BEGINNER FRIENDLY' },
  { name: 'Video Editing & Content Creation', em: '🎬', desc: 'CapCut, Premiere, storytelling for YouTube & TikTok.', wks: '8 WKS', lvl: 'BEGINNER FRIENDLY' },
  { name: 'Motion Graphics & Animation', em: '🌀', desc: 'After Effects, Lottie & cinematic motion.', wks: '12 WKS', lvl: 'SOME DESIGN' },
  { name: 'Game Development', em: '🎮', desc: 'Unity & Godot — 2D and 3D games from scratch.', wks: '20 WKS', lvl: 'SOME CODING' },
  { name: 'Product Management', em: '📋', desc: 'Own the roadmap — roadmap, users & agile teams.', wks: '12 WKS', lvl: 'NO CODING NEEDED' },
  { name: 'AI Prompt Engineering', em: '💬', desc: 'Master ChatGPT, Claude & build AI-powered tools.', wks: '6 WKS', lvl: 'BEGINNER FRIENDLY' },
  { name: 'No-Code / Low-Code Apps', em: '🧱', desc: 'Build apps with Bubble, Webflow & FlutterFlow — no coding.', wks: '10 WKS', lvl: 'BEGINNER FRIENDLY' },
  { name: 'Software Testing / QA', em: '🔍', desc: 'Manual & automated testing, Selenium, Postman.', wks: '12 WKS', lvl: 'BEGINNER FRIENDLY' },
  { name: 'SEO & Content Writing', em: '✍️', desc: 'Rank pages, write blogs that convert, earn in USD.', wks: '10 WKS', lvl: 'BEGINNER FRIENDLY' },
  { name: 'Virtual Assistant & Tech Admin', em: '💼', desc: 'Remote admin, tools & client management.', wks: '8 WKS', lvl: 'BEGINNER FRIENDLY' }
]

// How many weeks a course runs, looked up by name. Matching is loose (case- and
// punctuation-insensitive, "&" read as "and") because a student's stored
// course_name comes back from the database and may differ in case or spacing.
// Returns null for a course the catalog does not list, so callers can say "not
// set" rather than inventing a duration.
export function courseWeeks(name) {
  const key = (s) => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim()
  const want = key(name)
  if (!want) return null
  const hit = COURSES.find((c) => key(c.name) === want)
  if (!hit) return null
  const weeks = Number(String(hit.wks).replace(/[^0-9]/g, ''))
  return weeks > 0 ? weeks : null
}