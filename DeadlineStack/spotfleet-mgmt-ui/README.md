# Deadline SFMT

This repository contains the Deadline SFMT client and server, which is built with React using TypeScript and python with FastAPI. The application is Dockerized for easy deployment. Follow the steps below to build and run the application.

## Prerequisites

Make sure you have Docker installed on your machine. If not, you can download and install it from [Docker's official website](https://docs.docker.com/get-docker/).

## Build the Application

To build the application, run the following commands in the terminal:

```bash
docker build -t name:tag .
```

Replace name with the desired name for your Docker image, and tag with the desired tag (e.g., latest).
This command will build the React app (written in TypeScript) in the first stage and the FastAPI app in the second stage of the Dockerfile.

## Run the Application

After building the application, you can run it with the following command:

```bash
docker run -p 4242:4242 name:tag
```

Replace name and tag with the same values you used during the build.
This command will start the application, and you can access it in your web browser at http://localhost:4242.

## Access the Application

Open your web browser and go to http://localhost:4242 to access the Deadline SFMT application.
