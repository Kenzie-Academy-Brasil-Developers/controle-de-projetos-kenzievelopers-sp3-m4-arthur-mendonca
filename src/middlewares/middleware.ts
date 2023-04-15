import { NextFunction, Request, Response } from "express";
import { client } from "../database";
import { QueryConfig, QueryResult } from "pg";
import {
  IGetDevInfo,
  ITechnology,
  TProject,
  Tdev,
  TechnologyName,
} from "../interfaces/interfaces";

const checkExistingEmail = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const requestData: Tdev = request.body;

  const queryString: string = `
    SELECT * 
    FROM developers
    WHERE email = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [requestData.email],
  };

  const queryResult: QueryResult = await client.query(queryConfig);
  const emailAlreadyExists = queryResult;
  console.log(emailAlreadyExists.rows);

  if (emailAlreadyExists.rows.length > 0) {
    return response.status(409).json({
      error: "Email already exists.",
    });
  } else return next();
};

const checkDevId = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const devID = request.params.id;

  const queryString: string = `
  SELECT * 
  FROM developers
  WHERE id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [devID],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  const result = queryResult.rows;

  if (result.length === 0) {
    return response.status(404).json({
      message: "Developer not found.",
    });
  }

  return next();
};

const checkExistingInfoFromDev = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const devID: number = Number(request.params.id);

  const queryString: string = `
  SELECT * FROM developer_infos
  WHERE developerid = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [devID],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  if (queryResult.rowCount > 0) {
    return response.status(400).json({
      message: "Developer infos already exists.",
    });
  }

  return next();
};

const checkOS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const devInfo: IGetDevInfo = request.body;
  const OS: Array<string> = ["Windows", "Linux", "MacOS"];

  const theRightOs = OS.some((os) => devInfo.preferredOS.includes(os));

  if (!theRightOs) {
    return response.status(400).json({
      message: "Invalid OS option.",
      options: ["Windows", "Linux", "MacOS"],
    });
  }
  return next();
};

const checkDevIdInProjects = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const projectInfo: TProject = request.body;

  const queryString: string = `
  SELECT * FROM developers;
  `;

  const queryResult: QueryResult = await client.query(queryString);

  const existingDevId = queryResult.rows.map((dev) => dev.id);

  if (!existingDevId.includes(projectInfo.developerId)) {
    return response.status(404).json({
      message: "Developer not found",
    });
  }

  return next();
};

const checkProjectId = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const projectId = request.params.id;

  const queryString: string = `
  SELECT * 
  FROM 
  projects 
  WHERE 
  id = $1; 
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    return response.status(404).json({
      message: "Project not found.",
    });
  }

  return next();
};

const checkTechnologyName = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const technologies = [
    "JavaScript",
    "Python",
    "React",
    "Express.js",
    "HTML",
    "CSS",
    "Django",
    "PostgreSQL",
    "MongoDB",
  ];

  const technologyName: ITechnology = request.body;

  const checkIfItsIncluded = technologies.includes(technologyName.name);

  if (!checkIfItsIncluded) {
    return response.status(400).json({
      message: "Technology not supported.",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  return next();
};

const checkIfTechnologyAlreadyExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const technologyName: ITechnology = request.body;
  const projectId: string = request.params.id;

  const queryString: string = ` 
    SELECT p.id as "projectId", 
    t."name" as "technologyName"
    FROM  projects p 
    LEFT OUTER JOIN projects_technologies pt 
    ON p.id = pt."projectId"  
    LEFT OUTER JOIN technologies t 
    ON t.id = pt."technologyId"
    right outer join technologies t2  
    ON t2.id = pt."technologyId"
    WHERE p.id = $1`;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  const result: Array<TechnologyName> = queryResult.rows;

  const findTechnologyWithSameName = result.find(
    (tech) => tech.technologyName === technologyName.name
  );

  if (findTechnologyWithSameName) {
    return response.status(409).json({
      message: "This technology is already associated with the project",
    });
  }
  return next();
};

const checkIfTechIsAssociatedToProject = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { id } = request.params;

  const queryString = `
  select  t.name  
  from technologies t 
  right outer join projects_technologies pt 
  on  t.id = pt."technologyId"  
  right outer join projects p 
  on p.id = pt."projectId"
  where pt."projectId" = $1;`;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    return response.status(400).json({
      message: "Technology not related to the project.",
    });
  }

  return next();
};

const checkIfTechIsSupported = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { name } = request.params;

  const technologies = [
    "JavaScript",
    "Python",
    "React",
    "Express.js",
    "HTML",
    "CSS",
    "Django",
    "PostgreSQL",
    "MongoDB",
  ];

  const checkExistingTechnology = technologies.includes(name);

  if (!checkExistingTechnology) {
    return response.status(400).json({
      message: "Technology not supported.",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  return next();
};

export {
  checkExistingEmail,
  checkDevId,
  checkExistingInfoFromDev,
  checkOS,
  checkDevIdInProjects,
  checkProjectId,
  checkTechnologyName,
  checkIfTechnologyAlreadyExists,
  checkIfTechIsAssociatedToProject,
  checkIfTechIsSupported,
};
