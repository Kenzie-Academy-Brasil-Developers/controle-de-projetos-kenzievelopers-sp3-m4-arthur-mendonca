import { QueryConfig, QueryResult } from "pg";
import { IDevInfo, IGetDevInfo, Idev, Tdev } from "../interfaces/interfaces";
import { client } from "../database";
import { Request, Response } from "express";
import format from "pg-format";

const createDev = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const devData: Tdev = request.body;

  const queryString = `
  INSERT INTO developers
  (%I)
  VALUES (%L)
  RETURNING *
  `;

  const queryFormat = format(
    queryString,
    Object.keys(devData),
    Object.values(devData)
  );

  const queryResult: QueryResult<Idev> = await client.query(queryFormat);

  return response.status(201).json(queryResult.rows[0]);
};

const showDevInfo = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const devID = request.params.id;

  const queryString: string = `
  SELECT d.id AS "developerId",  
  d."name" AS "developerName", 
  d.email AS "developerEmail", 
  di."developerSince" AS "developerInfoDeveloperSince", 
  di."preferredOS" AS "developerInfoPreferredOS"  
  FROM developers AS d 
  FULL OUTER JOIN developer_infos AS di 
  ON d.id = di.developerid
  WHERE d.id = $1; 
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [devID],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  const result: IDevInfo = queryResult.rows[0];

  return response.status(200).json(result);
};

const updateDevInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const { body, params } = request;

  const queryString: string = `
  UPDATE developers
  SET 
  (%I) = ROW (%L)
  WHERE id = $1
  RETURNING *;
  `;

  const queryFormat = format(
    queryString,
    Object.keys(body),
    Object.values(body)
  );
  const queryConfig: QueryConfig = {
    text: queryFormat,
    values: [params.id],
  };
  const queryResult: QueryResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

const deleteDev = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const devID = request.params.id;

  const queryString: string = `
  DELETE FROM developers 
  WHERE id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [devID],
  };

  await client.query(queryConfig);

  return response.status(204).send();
};

const insertDevInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const devID = parseInt(request.params.id);
  const devInfo: IGetDevInfo = request.body;

  const queryString: string = `
  INSERT INTO  
  developer_infos ("developerSince", "preferredOS", developerid)
 	VALUES 
  ($1, $2, $3)
  RETURNING *;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [devInfo.developerSince, devInfo.preferredOS, devID],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  return response.status(201).json(queryResult.rows[0]);
};

export { createDev, showDevInfo, updateDevInfo, deleteDev, insertDevInfo };
