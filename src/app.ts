import express, { Application, json } from "express";
import "dotenv/config";
import {
  createDev,
  deleteDev,
  insertDevInfo,
  showDevInfo,
  updateDevInfo,
} from "./logic/logic";
import {
  checkDevId,
  checkDevIdInProjects,
  checkExistingEmail,
  checkExistingInfoFromDev,
  checkIfTechIsAssociatedToProject,
  checkIfTechIsSupported,
  checkIfTechnologyAlreadyExists,
  checkOS,
  checkProjectId,
  checkTechnologyName,
} from "./middlewares/middleware";
import {
  addTechToProjectById,
  createProject,
  deleteProjectById,
  deleteTechnologyInAProject,
  showProjectById,
  updateProjectById,
} from "./logic/projects_logic";

const app: Application = express();
app.use(json());

app.post("/developers", checkExistingEmail, createDev);
app.get("/developers/:id", checkDevId, showDevInfo);
app.patch("/developers/:id", checkDevId, checkExistingEmail, updateDevInfo);
app.delete("/developers/:id", checkDevId, deleteDev);
app.post(
  "/developers/:id/infos",
  checkDevId,
  checkOS,
  checkExistingInfoFromDev,
  insertDevInfo
);
app.post("/projects", checkDevIdInProjects, createProject);
app.get("/projects/:id", showProjectById);
app.patch(
  "/projects/:id",
  checkProjectId,
  checkDevIdInProjects,
  updateProjectById
);
app.delete("/projects/:id", checkProjectId, deleteProjectById);
app.post(
  "/projects/:id/technologies",
  checkProjectId,
  checkTechnologyName,
  checkIfTechnologyAlreadyExists,
  addTechToProjectById
);

app.delete(
  "/projects/:id/technologies/:name",
  checkProjectId,
  checkIfTechIsSupported,
  checkIfTechIsAssociatedToProject,
  deleteTechnologyInAProject
);

export default app;
