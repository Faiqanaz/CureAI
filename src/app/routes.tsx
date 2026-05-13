import { createBrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PatientDashboard from "./pages/PatientDashboard";
import SymptomChecker from "./pages/SymptomChecker";
import AppointmentBooking from "./pages/AppointmentBooking";
import MedicalHistory from "./pages/MedicalHistory";

// Doctor pages
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorPrescriptions from "./pages/DoctorPrescriptions";
import DoctorPatients from "./pages/Doctorpatients"; 

// Admin/Verification pages
import DoctorVerification from "./pages/DoctorVerification";

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
  { path: "/patient/dashboard", Component: PatientDashboard },
  { path: "/patient/symptom-checker", Component: SymptomChecker },
  { path: "/patient/appointments", Component: AppointmentBooking },
  { path: "/patient/medical-history", Component: MedicalHistory },
  
  // Doctor routes
  { path: "/doctor/dashboard", Component: DoctorDashboard },
  { path: "/doctor/appointments", Component: DoctorAppointments },
  { path: "/doctor/prescriptions", Component: DoctorPrescriptions },
  { path: "/doctor/patients", Component: DoctorPatients },

  // Admin routes
  { path: "/admin/verify-doctors", Component: DoctorVerification },
]);