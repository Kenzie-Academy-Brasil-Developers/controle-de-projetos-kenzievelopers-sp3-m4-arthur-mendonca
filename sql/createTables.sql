create type OS as enum ('Windows', 'Linux', 'MacOS');

CREATE TABLE developers(
    id SERIAL PRIMARY KEY,
    name VARCHAR (50) NOT NULL,
    email VARCHAR (50) NOT NULL 
);

CREATE TABLE developer_infos (
    id SERIAL PRIMARY KEY, 
    "developerSince" DATE NOT NULL, 
    preferredOS OS NOT NULL, 
    developerId INTEGER UNIQUE NOT NULL,
    FOREIGN KEY (developerId) REFERENCES developers(id) on delete cascade
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(50) NOT NULL,
    description text, 
    "estimatedTime" VARCHAR(20) NOT NULL,
    repository VARCHAR(120) NOT NULL,
    "startDate" DATE NOT NULL,
    endDate DATE, 
    developerId INTEGER,
    FOREIGN KEY (developerId) REFERENCES developers(id) on delete cascade
);

CREATE TABLE technologies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE  projects_technologies(
    id SERIAL PRIMARY KEY, 
    addedIn DATE NOT NULL, 
    technologyId INTEGER NOT NULL, 
    projectId INTEGER NOT NULL,
    FOREIGN KEY (technologyId) REFERENCES technologies (id) on delete cascade,
    FOREIGN KEY (projectId) REFERENCES projects (id) on delete cascade
);

insert into technologies (name)
values ('JavaScript'), 
('Python'), 
('React'), 
('Express.js'), 
('HTML'), 
('CSS'), 
('Django'), 
('PostgreSQL'), 
('MongoDB');