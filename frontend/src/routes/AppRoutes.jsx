import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProjectTickets from "../pages/ProjectTickets";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/projects/:projectId/tickets"
          element={<ProjectTickets />}
        />
      </Routes>
    </BrowserRouter>
  );
}
