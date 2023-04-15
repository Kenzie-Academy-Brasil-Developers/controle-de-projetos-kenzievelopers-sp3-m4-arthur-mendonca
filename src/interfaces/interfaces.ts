export interface Idev {
  id: number;
  name: string;
  email: string;
}

export type Tdev = Omit<Idev, "id">;

export interface IDevInfo {
  developerId: number;
  developerName: string;
  developerEmail: string;
  developerInfoDeveloperSince: Date;
  developerInfoPreferredOS: "Windows" | "Linux" | "MacOS";
}

export interface IGetDevInfo {
  developerSince: string;
  preferredOS: "Windows" | "Linux" | "MacOS";
}

export interface IProject {
  id: number;
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: string;
  developerId: number;
}

export type TProject = Omit<IProject, "id">;

export interface IProjectTable {
  projectName: string;
  projectDescription: string;
  projectEstimatedTime: string;
  projectRepository: string;
  projectStartDate: string;
  projectEndDate: string;
  projectDeveloperId: number;
  technologyId: number;
  technologyName: string;
}

export interface ITechnology {
  name: string;
}

export type TechnologyName = Pick<
  IProjectTable,
  "technologyName" | "technologyId"
>;
