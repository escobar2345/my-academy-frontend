import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Process from "../views/MainView.vue";
import SimulationView from "../views/SimulationView.vue";
import SimulationRunView from "../views/SimulationRunView.vue";
import ReportView from "../views/ReportView.vue";
import InteractionView from "../views/InteractionView.vue";
import BoiRsuPage from "../views/BoiRsuPage.vue";
import BoiAcademy from "../views/BoiAcademy.vue";
import Classroom from "../views/Classroom.vue";
import Workspace from "../views/Workspace.vue";
import Internet from "../views/Internet.vue";
import Membership from "../views/Membership.vue";
import Partners from "../views/Partners.vue";
import TechTeam from "../views/TechTeam.vue";
import Login from "../views/Login.vue";
import StudentDashboard from "../../boi-school/studentdashboard.vue";
import RoadmapPage from "../../boi-school/roadmap.vue";
import Registration from "../../boi-school/registration.vue";
import AdminPage from "../views/school-portal/AdminPage.vue";
import TeacherPage from "../views/school-portal/TeacherPage.vue";
import TeacherClassroomGate from "../views/school-portal/TeacherClassroomGate.vue";
import PartnerPage from "../views/school-portal/PartnerPage.vue";

const routes = [
  {
    path: "/",
    name: "BoiAcademy",
    component: BoiAcademy,
    // The tour answers to several paths. They are aliases (not separate named
    // routes) on purpose: an alias keeps route.name === 'BoiAcademy', which is
    // how AcademyNav knows "you are already on the tour" no matter which URL
    // you arrived by. TOUR_URL in constants/academy.js points at /academy.
    alias: ["/academy", "/BoiAcademy", "/boiacademy", "/boi-academy"],
  },
  {
    path: "/process/:projectId",
    name: "Process",
    component: Process,
    props: true,
  },
  {
    path: "/simulation/:simulationId",
    name: "Simulation",
    component: SimulationView,
    props: true,
  },
  {
    path: "/simulation/:simulationId/start",
    name: "SimulationRun",
    component: SimulationRunView,
    props: true,
  },
  {
    path: "/report/:reportId",
    name: "Report",
    component: ReportView,
    props: true,
  },
  {
    path: "/interaction/:reportId",
    name: "Interaction",
    component: InteractionView,
    props: true,
  },
  {
    path: "/boirsu",
    name: "BoiRsuPage",
    component: BoiRsuPage,
  },
  // Registration / enrollment form. ACADEMY_URL ("Academy" in the nav) points
  // here — clicking Academy means "I want to join", not "show me the tour".
  {
    path: "/registration",
    name: "Registration",
    component: Registration,
  },
  // Marketing pages the nav links to. Without these the nav links resolved to
  // no route and rendered a blank page.
  {
    path: "/workspace",
    name: "Workspace",
    component: Workspace,
  },
  {
    path: "/internet",
    name: "Internet",
    component: Internet,
  },
  {
    path: "/membership",
    name: "Membership",
    component: Membership,
  },
  // Tech-Team "coming soon" page. TECH_TEAM_URL in constants/academy.js points
  // here — clicking Tech-Team in the nav lands on this instead of scrolling.
  {
    path: "/tech-team",
    name: "TechTeam",
    component: TechTeam,
  },
  // Partner / affiliate programme placeholder page. The nav's PARTNERS_URL in
  // constants/academy.js now points at /school/partner (the live PartnerPage);
  // this /partners route is kept so old links/bookmarks still render.
  {
    path: "/partners",
    name: "Partners",
    component: Partners,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/dashboard",
    name: "StudentDashboard",
    component: StudentDashboard,
  },
  {
    path: "/student-dashboard",
    name: "StudentDashboardAlt",
    component: StudentDashboard,
  },
  {
    path: "/studentdashboard",
    name: "StudentDashboardLegacy",
    component: StudentDashboard,
  },
  {
    path: "/roadmap",
    name: "RoadmapPage",
    component: RoadmapPage,
  },
  {
    // Two frontend endpoints for the same live-classroom experience:
    //   /classroom/teacher -> the educator enters in teacher mode
    //   /classroom/student -> learners join in student mode
    // /classroom (with no mode) stays as a student-mode fallback so existing
    // links that predate this split keep working.
    path: "/classroom",
    name: "ClassroomPage",
    component: Classroom,
  },
  {
    // The teacher classroom sits behind the TeacherClassroomGate: only the
    // login created when an admin/partner adds the teacher can enter, and
    // one device per teacher session is enforced there.
    path: "/classroom/teacher",
    name: "TeacherClassroom",
    component: TeacherClassroomGate,
  },
  {
    path: "/classroom/student",
    name: "StudentClassroom",
    component: Classroom,
    props: { role: "student" },
  },
  {
    // Aliases let the short URLs work too: /admin, /teacher and /partner all
    // render the same portal pages as their /school/... counterparts, so a
    // hand-typed URL never lands on an unmatched (blank) route.
    path: "/school/admin",
    name: "SchoolAdmin",
    component: AdminPage,
    alias: ["/admin"],
  },
  {
    path: "/school/teacher",
    name: "SchoolTeacher",
    component: TeacherPage,
    alias: ["/teacher"],
  },
  {
    path: "/school/partner",
    name: "SchoolPartner",
    component: PartnerPage,
    alias: ["/partner"],
  },
  // Catch-all: any URL matching no route above redirects home instead of
  // rendering a blank page. App.vue is only a <router-view/>, so an
  // unmatched path used to show pure white with no clue what went wrong.
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Programs links push to /academy#apply from other pages and rely on this to
  // land on the section. The small delay lets the page mount and GSAP lay the
  // section out before we measure its position; without it we scroll to a
  // position that then shifts. Back/forward restores the previous scroll.
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(
          () => resolve({ el: to.hash, top: 0, behavior: "smooth" }),
          400,
        );
      });
    }
    return { top: 0 };
  },
});

export default router;
