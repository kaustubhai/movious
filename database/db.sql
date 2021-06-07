CREATE DATABASE muvious;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE theater (
    _id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    admin VARCHAR(150) NOT NULL,
    contact VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address TEXT [] NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE person (
    _id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    age INT NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contact VARCHAR(50) UNIQUE NOT NULL,
    city VARCHAR(150) NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE show (
    _id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    poster BYTEA NOT NULL,
    theater UUID REFERENCES theater(_id),
    screen INT NOT NULL,
    seats INT NOT NULL,
    cost FLOAT(2) NOT NULL,
    age INT NOT NULL,
    booked INT [],
    date TIMESTAMP NOT NULL,
    language VARCHAR(50) NOT NULL
);

CREATE TABLE booking (
    _id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    show UUID REFERENCES show(_id),
    person UUID REFERENCES person(_id),
    transaction FLOAT(2) NOT NULL,
    seats VARCHAR(3) [] NOT NULL
);