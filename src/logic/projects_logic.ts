import { Request, Response } from "express";
import { IProjectTable, ITechnology, TProject } from "../interfaces/interfaces";
import format from "pg-format";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";

const createProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const projectData: TProject = request.body;

  const queryString: string = `
        INSERT INTO projects
        (%I)
        VALUES (%L)
        RETURNING *;
    `;

  const queryFormat = format(
    queryString,
    Object.keys(projectData),
    Object.values(projectData)
  );

  const queryResult: QueryResult = await client.query(queryFormat);

  return response.status(201).json(queryResult.rows[0]);
};

const showProjectById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const projectId = request.params.id;

  const queryString: string = `
  SELECT p.id as "projectId", 
      p.name as "projectName", 
      p.description as "projectDescription", 
      p."estimatedTime" as "projectEstimatedTime",
      p.repository as "projectRepository",
      p."startDate" as "projectStartDate",
      p."endDate" as "projectEndDate",
      p."developerId" as "projectDeveloperId",
      pt."technologyId"  as "technologyId",
      t."name" as "technologyName"
  FROM  projects p 
  LEFT OUTER JOIN projects_technologies pt 
  ON p.id = pt."projectId"  
  LEFT OUTER JOIN technologies t 
  ON t.id = pt."technologyId" 
  WHERE p.id  = $1; 
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  const queryResult: QueryResult<Array<IProjectTable>> = await client.query(
    queryConfig
  );

  if (queryResult.rowCount === 0) {
    return response.status(404).json({ message: "Project not found." });
  }
  return response.status(200).json(queryResult.rows);
};

const updateProjectById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const projectId = request.params.id;
  const updateData: TProject = request.body;

  const queryString: string = `
  UPDATE projects
  SET 
  (%I) = ROW (%L)
  WHERE id = $1
  RETURNING *;
  `;

  const queryFormat = format(
    queryString,
    Object.keys(updateData),
    Object.values(updateData)
  );

  const queryConfig: QueryConfig = {
    text: queryFormat,
    values: [projectId],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

const deleteProjectById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const projectId = request.params.id;

  const queryString: string = `
  DELETE FROM 
  projects 
  WHERE 
  id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  return response.status(204).send();
};

const addTechToProjectById = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const projectId = request.params.id;
  let newTechName: ITechnology = request.body;

  const data = {
    ...newTechName,
    projectId,
  };

  const queryTechnologyId: string = `
  SELECT id  FROM technologies WHERE name = $1;
  `;

  const queryConfigTechnologyId: QueryConfig = {
    text: queryTechnologyId,
    values: [newTechName.name],
  };

  const queryResultTechnologyId: QueryResult = await client.query(
    queryConfigTechnologyId
  );

  const technologyId: number = queryResultTechnologyId.rows[0].id;

  const queryInsertTechnology: string = `
  INSERT INTO
  projects_technologies ("addedIn", "technologyId", "projectId")
  VALUES (NOW(), $1, $2)
  RETURNING *;
  `;

  const queryConfigInsertTechnology: QueryConfig = {
    text: queryInsertTechnology,
    values: [technologyId, projectId],
  };

  const queryInsertTechnologyResult: QueryResult = await client.query(
    queryConfigInsertTechnology
  );

  const queryString: string = `
  SELECT p.id as "projectId", 
      p.name as "projectName", 
      p.description as "projectDescription", 
      p."estimatedTime" as "projectEstimatedTime",
      p.repository as "projectRepository",
      p."startDate" as "projectStartDate",
      p."endDate" as "projectEndDate",
      pt."technologyId"  as "technologyId",
      t."name" as "technologyName"
  FROM  projects p 
  LEFT OUTER JOIN projects_technologies pt 
  ON p.id = pt."projectId"  
  LEFT OUTER JOIN technologies t 
  ON t.id = pt."technologyId"
  RIGHT OUTER JOIN technologies t2  
  ON t2.id = pt."technologyId" 
  WHERE p.id  = $1; 
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  const queryResult: QueryResult<IProjectTable> = await client.query(
    queryConfig
  );

  const result: IProjectTable = queryResult.rows[queryResult.rows.length - 1];

  return response.status(201).json(result);
};

const deleteTechnologyInAProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const { id, name } = request.params;

  const queryTechName: string = `
  SELECT id FROM 
  technologies  
  WHERE 
  name = $1 ;
  `;

  const queryConfigTechName: QueryConfig = {
    text: queryTechName,
    values: [name],
  };

  const queryResultTechName: QueryResult = await client.query(
    queryConfigTechName
  );

  const techIdToDelete: number = queryResultTechName.rows[0].id;

  const queryString: string = `
  DELETE FROM 
  projects_technologies 
  WHERE 
  "technologyId" = $1 and "projectId"  = $2;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [techIdToDelete, id],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  return response.status(204).send();
};

export {
  createProject,
  showProjectById,
  updateProjectById,
  deleteProjectById,
  addTechToProjectById,
  deleteTechnologyInAProject,
};
